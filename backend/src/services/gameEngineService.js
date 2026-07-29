const dgram = require("dgram");
const EventEmitter = require("events");

const DEFAULT_ENGINE_HOST = process.env.GAMEPLAY_HOST || "gameplay-cpp";
const DEFAULT_ENGINE_PORT = Number(process.env.GAMEPLAY_PORT || 7297);
const ENGINE_INPUT_TYPE = Object.freeze({
    PING: 0,
    JOIN: 1,
    LEAVE: 2,
    MOVE: 3,
    BUILD: 4,
    DELETE: 5,

    ROOM_CREATE: 6,
    ROOM_DESTROY: 7,
    ROOM_START: 8,
    ROOM_STOP: 9,
});

class GameEngineService extends EventEmitter{
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
            entities: new Map(),
            playerData: [],
        };
        this.sessions.set(room.id, session);
        return session;
    }

    getSession(roomId) {
        return this.sessions.get(roomId) || null;
    }

    cacheEntityUpdate(roomId, entity, tick)
    {
        const session = this.getSession(roomId);
        if (!session || !entity || typeof entity.entityId !== "number")
            return false;
        session.entities.set(entity.entityId, entity);
        if (typeof tick === "number")
            session.tick = tick;
        return true;
    }

    cacheEntityDelete(roomId, entityId, tick)
    {
        const session = this.getSession(roomId);
        if (!session || typeof entityId !== "number")
            return false;
        session.entities.delete(entityId);
        if (typeof tick === "number")
            session.tick = tick;
        return true;
    }

    getStateSnapshot(roomId)
    {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        return {
            roomId: session.roomId,
            tick: session.tick,
            serverStartedAt: session.startedAt,
            end: false,
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

    async startGame(room) {
        const session = this.createSession(room);
        const joinedPlayerIds = [];
        let roomCreated = false;

        try {
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_CREATE, roomId: room.id, scale: 1000, entities: [], });
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
        if (!message || typeof message !== "object" || Array.isArray(message))
        {
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
    GameEngineService,
    gameEngineService,
};
