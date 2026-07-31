const dgram = require("dgram");
const EventEmitter = require("events");
const path = require("path");
const { mapConv } = require("../game/mapConv");

const DEFAULT_ENGINE_HOST = process.env.GAMEPLAY_HOST || "gameplay-cpp";
const DEFAULT_ENGINE_PORT = Number(process.env.GAMEPLAY_PORT || 7297);
const ENGINE_INPUT_TYPE = Object.freeze({
    ROOM_CREATE: 0,
    ROOM_DESTROY: 1,
    ROOM_START: 2,
    ROOM_STOP: 3,

    PING: 100,
    SYNC: 101,

    JOIN: 110,
    LEAVE: 111,
    MOVE: 112,
    ACTION: 113,

    CHECKPOINT_UPGRADE: 114,
});

const PLAYER_ACTION = Object.freeze({
    NONE: 0,
    MELEE: 1,
    RANGED: 2,
    SHIELD: 3,
});

const PLAYER_UPGRADE = Object.freeze({
    MELEE: "melee",
    RANGED: "ranged",
    SHIELD: "shield",
});

class GameEngineService extends EventEmitter {
    constructor({
        host = DEFAULT_ENGINE_HOST,
        port = DEFAULT_ENGINE_PORT,
    } = {}) {
        super();

        this.host = host;
        this.port = port;
        this.socket = dgram.createSocket("udp4");
        this.started = false;
        this.sessions = new Map();

        this.socket.on("message", (buffer, remoteInfo) => {
            this.handleMessage(buffer, remoteInfo);
        });

        this.socket.on("error", (error) => {
            console.error("Game engine Udp error:", error);
            this.emit("engine-error", error);
        });

        this.socket.on("listening", () => {
            const address = this.socket.address();

            console.log(
                `Game engine UDP client listening on ${address.address}:${address.port}`
            );
            this.emit("listening", address);
        });

        this.socket.on("close", () => {
            this.started = false;
            console.log("Game engine UDP client closed");
            this.emit("close");
        });
    }

    start() {
        if (this.started)
            return;
        this.socket.bind(0);
        this.started = true;
    }
    send(command) {
        if (!this.started)
            throw new Error("Game engine service is not started");
        if (!command || typeof command !== "object" || Array.isArray(command))
            throw new TypeError("Game engine command must be an object");
        const payload = Buffer.from(JSON.stringify(command));
        return new Promise((resolve, reject) => {
            this.socket.send(
                payload,
                this.port,
                this.host,
                (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                }
            );
        });
    }

    createSession(room) {
        if (!room || typeof room.id !== "string" || !Array.isArray(room.players))
            throw new TypeError("Invalid room");
        const players = room.players.map((player, index) => ({
            userId: player.id,
            enginePlayerId: index,
        }));
        const session = {
            roomId: room.id,
            players,
            createdAt: Date.now(),
            startedAt: null,
            tick: 0,
            map: null,
            entities: new Map(),
            playerData: [],
        };
        this.sessions.set(room.id, session);
        return session;
    }

    getSession(roomId) {
        return this.sessions.get(roomId) || null;
    }

    cacheEntityUpdate(roomId, entity, tick) {
        const session = this.getSession(roomId);
        if (!session || !entity || typeof entity.entityId !== "number")
            return false;
        session.entities.set(entity.entityId, entity);
        if (typeof tick === "number")
            session.tick = tick;
        return true;
    }

    cacheEntityDelete(roomId, entityId, tick) {
        const session = this.getSession(roomId);
        if (!session || typeof entityId !== "number")
            return false;
        session.entities.delete(entityId);
        if (typeof tick === "number")
            session.tick = tick;
        return true;
    }

    getStateSnapshot(roomId) {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        return {
            roomId: session.roomId,
            tick: session.tick,
            serverStartedAt: session.startedAt,
            end: false,
            map: session.map,
            entities: Array.from(session.entities.values()),
            playerData: session.playerData,
        };
    }

    getEnginePlayerId(roomId, userId) {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        const player = session.players.find(
            (entry) => entry.userId === userId
        );
        return player ? player.enginePlayerId : null;
    }

    getUserIdByEnginePlayerId(roomId, enginePlayerId) {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        const player = session.players.find(entry => entry.enginePlayerId === enginePlayerId);
        return player ? player.userId : null;
    }

    cachePlayerUpdate(roomId, playerData, tick) {
        const session = this.getSession(roomId);
        if (!session ||
            !playerData ||
            typeof playerData !== "object" ||
            Array.isArray(playerData) ||
            typeof playerData.playerId !== "number"
        )
            return null;
        const enginePlayerId = playerData.playerId;
        const userId = this.getUserIdByEnginePlayerId(roomId, enginePlayerId);
        if (userId === null)
            return null;
        const previousIndex = session.playerData.findIndex(player =>
            String(player.playerId) === String(userId)
        );
        const previousPlayer = previousIndex >= 0
            ? session.playerData[previousIndex]
            : null;
        const normalizedPlayer = {
            ...previousPlayer,
            ...playerData,
            playerId: userId,
            enginePlayerId,
            upgrades: {
                ...previousPlayer?.upgrades,
                ...playerData.upgrades,
            },
            cooldowns: {
                ...previousPlayer?.cooldowns,
                ...playerData.cooldowns,
            },
        };
        if (previousIndex >= 0)
            session.playerData[previousIndex] = normalizedPlayer;
        else
            session.playerData.push(normalizedPlayer);
        if (typeof tick === "number")
            session.tick = tick;
        return normalizedPlayer;
    }

    getPlayerData(roomId, userId) {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        return session.playerData.find(player => String(player.playerId) === String(userId)) || null;
    }

    sendPlayerInput(roomId, userId, input) {
        const enginePlayerId = this.getEnginePlayerId(roomId, userId);
        if (enginePlayerId === null) {
            throw new Error("Engine player mapping not found");
        }
        const x =
            (input.right === true ? 1 : 0) -
            (input.left === true ? 1 : 0);
        const y =
            (input.down === true ? 1 : 0) -
            (input.up === true ? 1 : 0);
        return this.send({
            type: ENGINE_INPUT_TYPE.MOVE,
            roomId,
            playerId: enginePlayerId,
            velX: x,
            velY: y,
        });
    }

    sendPlayerAction(roomId, userId, action) {
        const enginePlayerId = this.getEnginePlayerId(roomId, userId);
        if (enginePlayerId === null)
            throw new Error("Engine player mapping not found");
        if (!Object.values(PLAYER_ACTION).includes(action))
            throw new TypeError("Invalid player action");
        return this.send({
            type: ENGINE_INPUT_TYPE.ACTION,
            roomId,
            playerId: enginePlayerId,
            action,
        });
    }

    sendCheckpointUpgrade(
        roomId,
        userId,
        playerData,
        upgrade
    ) {
        const enginePlayerId = this.getEnginePlayerId(roomId, userId);
        if (enginePlayerId === null)
            throw new Error("Engine player mapping not found");
        if (!playerData || typeof playerData !== "object" || Array.isArray(playerData))
            throw new TypeError("Invalid player data");
        if (playerData.atACheckpoint !== true)
            throw new Error("Player is not at a checkpoint");
        if (!Object.values(PLAYER_UPGRADE).includes(upgrade))
            throw new TypeError("Invalid player upgrade");
        return this.send({
            type: ENGINE_INPUT_TYPE.CHECKPOINT_UPGRADE,
            roomId,
            playerData: {
                ...playerData,
                playerId: enginePlayerId,
                upgrades: {
                    melee: upgrade === PLAYER_UPGRADE.MELEE,
                    ranged: upgrade === PLAYER_UPGRADE.RANGED,
                    shield: upgrade === PLAYER_UPGRADE.SHIELD,
                },
            },
        });
    }

    async startGame(room) {
        const session = this.createSession(room);
        const joinedPlayerIds = [];
        let roomCreated = false;
        const mapPayload = mapConv(
            path.join(__dirname, "../game/maps/1_map_50_50_10_1_55.txt"),
            room.id
        );
        session.map = {
            width: mapPayload.width,
            height: mapPayload.height,
            scale: mapPayload.scale,
        };
        try {
            await this.send({
                type: ENGINE_INPUT_TYPE.ROOM_CREATE,
                roomId: room.id,
                scale: mapPayload.scale,
                entities: mapPayload.entities,
            });
            roomCreated = true;
            for (const player of session.players) {
                await this.send({
                    type: ENGINE_INPUT_TYPE.JOIN,
                    roomId: room.id,
                    playerId: player.enginePlayerId,
                });
                joinedPlayerIds.push(player.enginePlayerId);
            }
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_START, roomId: room.id });
            session.startedAt = Date.now();
            return session;
        } catch (error) {
            for (const playerId of joinedPlayerIds) {
                try {
                    await this.send({
                        type: ENGINE_INPUT_TYPE.LEAVE,
                        roomId: room.id,
                        playerId,
                    });
                } catch (cleanupError) {
                    console.error(
                        "Unable to rollback engine player:",
                        playerId,
                        cleanupError
                    );
                }
            }
            if (roomCreated) {
                try {
                    await this.send({ type: ENGINE_INPUT_TYPE.ROOM_DESTROY, roomId: room.id });
                } catch (cleanupError) {
                    console.error(`Unable to rollback engine room ${room.id};`, cleanupError);
                }
            }
            this.removeSession(room.id);
            throw error;
        }
    }

    async removePlayer(roomId, userId) {
        const session = this.getSession(roomId);
        if (!session)
            return;
        const playerIndex = session.players.findIndex((player) => player.userId === userId);
        if (playerIndex === -1)
            return;
        const player = session.players[playerIndex];
        await this.send({
            type: ENGINE_INPUT_TYPE.LEAVE,
            roomId,
            playerId: player.enginePlayerId,
        });
        session.players.splice(playerIndex, 1);
    }

    async stopGame(roomId) {
        const session = this.getSession(roomId);
        if (!session)
            return;
        let firstError = null;
        try {
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_STOP, roomId });
        } catch (error) {
            firstError = error;
            console.log(`Unable to stop room ${roomId}:`, error);
        }
        try {
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_DESTROY, roomId });
        } catch (error) {
            if (!firstError)
                firstError = error;
            console.error(`Unable to destroy engine room ${roomId}:`, error);
        } finally {
            this.removeSession(roomId);
        }
        if (firstError)
            throw firstError;
    }

    removeSession(roomId) {
        this.sessions.delete(roomId);
    }

    ping() {
        return this.send({
            type: ENGINE_INPUT_TYPE.PING,
        });
    }

    handleMessage(buffer, remoteInfo) {
        let message;
        try {
            message = JSON.parse(buffer.toString("utf8"));
        } catch (error) {
            console.error(
                "Invalid JSON received from game engine:",
                buffer.toString("utf8")
            );
            this.emit("invalid-message", {
                error,
                raw: buffer.toString("utf8"),
                remoteInfo,
            });
            return;
        }
        if (!message || typeof message !== "object" || Array.isArray(message)) {
            console.error(
                "Invalid message received from game engine:",
                message
            );
            this.emit("invalid-message", {
                error: new TypeError("Game engine message must be an object"),
                raw: buffer.toString("utf8"),
                remoteInfo,
            });
            return;
        }
        this.emit("message", message, remoteInfo);
        if (typeof message.type === "string")
            this.emit(message.type, message, remoteInfo);
    }

    close() {
        if (!this.started)
            return;
        this.socket.close();
    }
}

const gameEngineService = new GameEngineService();

module.exports = {
    ENGINE_INPUT_TYPE,
    PLAYER_ACTION,
    PLAYER_UPGRADE,
    GameEngineService,
    gameEngineService,
};
