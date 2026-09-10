const dgram = require('dgram');
const EventEmitter = require('events');
const { mapConv } = require('../game/mapConv');
const {
    DEFAULT_ENGINE_HOST,
    DEFAULT_ENGINE_PORT,
    DEFAULT_ENGINE_MAP_DIRECTORY,
    DEFAULT_ROOM_READY_TIMEOUT_MS,
    ENGINE_INPUT_TYPE,
    PLAYER_ACTION,
    PLAYER_UPGRADE,
} = require('./gameEngine/constants');
const { writeMapFile, removeMapFile, pickRandomMapFile } = require('./gameEngine/mapFiles');
const { SessionStore } = require('./gameEngine/sessionStore');
const { RoomReadyTracker } = require('./gameEngine/roomReadyTracker');

class GameEngineService extends EventEmitter
{
    constructor({
        host = DEFAULT_ENGINE_HOST,
        port = DEFAULT_ENGINE_PORT,
        mapDirectory = DEFAULT_ENGINE_MAP_DIRECTORY,
        roomReadyTimeoutMs = DEFAULT_ROOM_READY_TIMEOUT_MS,
    } = {})
    {
        super();

        this.host = host;
        this.port = port;
        this.mapDirectory = mapDirectory;
        this.roomReadyTimeoutMs = roomReadyTimeoutMs;
        this.socket = dgram.createSocket('udp4');
        this.started = false;
        this.sessionStore = new SessionStore();
        this.roomReadyTracker = new RoomReadyTracker(roomReadyTimeoutMs);
        this.pingInterval = null;

        this.socket.on('message', (buffer, remoteInfo) =>
        {
            this.handleMessage(buffer, remoteInfo);
        });

        this.socket.on('error', (error) =>
        {
            console.error('Game engine Udp error:', error);
            this.emit('engine-error', error);
        });

        this.socket.on('listening', () =>
        {
            const address = this.socket.address();

            console.log(
                `Game engine UDP client listening on ${address.address}:${address.port}`
            );
            this.emit('listening', address);
        });

        this.socket.on('close', () =>
        {
            this.started = false;
            console.log('Game engine UDP client closed');
            this.emit('close');
        });
    }

    start()
    {
        if (this.started)
            return;
        this.socket.bind(0);
        this.started = true;

        this.pingInterval = setInterval(() =>
        {
            for (const roomId of this.sessionStore.roomIds())
            {
                this.send({
                    type: ENGINE_INPUT_TYPE.PING,
                    roomId,
                }).catch((error) =>
                {
                    console.error(`Unable to ping room ${roomId}:`, error);
                });
            }
        }, 30000); // 30 secs
    }

    send(command)
    {
        if (!this.started)
            throw new Error('Game engine service is not started');
        if (!command || typeof command !== 'object' || Array.isArray(command))
            throw new TypeError('Game engine command must be an object');
        const payload = Buffer.from(JSON.stringify(command));
        return new Promise((resolve, reject) =>
        {
            this.socket.send(payload, this.port, this.host, (error) =>
            {
                if (error)
                {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    createSession(room)
    {
        return this.sessionStore.createSession(room);
    }

    getSession(roomId)
    {
        return this.sessionStore.getSession(roomId);
    }

    cacheEntityUpdate(roomId, entity, tick)
    {
        return this.sessionStore.cacheEntityUpdate(roomId, entity, tick);
    }

    cacheEntityDelete(roomId, entityId, tick)
    {
        return this.sessionStore.cacheEntityDelete(roomId, entityId, tick);
    }

    getStateSnapshot(roomId)
    {
        return this.sessionStore.getStateSnapshot(roomId);
    }

    getEnginePlayerId(roomId, userId)
    {
        return this.sessionStore.getEnginePlayerId(roomId, userId);
    }

    getUserIdByEnginePlayerId(roomId, enginePlayerId)
    {
        return this.sessionStore.getUserIdByEnginePlayerId(roomId, enginePlayerId);
    }

    cachePlayerUpdate(roomId, playerData, tick)
    {
        return this.sessionStore.cachePlayerUpdate(roomId, playerData, tick);
    }

    getPlayerData(roomId, userId)
    {
        return this.sessionStore.getPlayerData(roomId, userId);
    }

    sendPlayerInput(roomId, userId, input)
    {
        const enginePlayerId = this.getEnginePlayerId(roomId, userId);
        if (enginePlayerId === null)
            throw new Error('Engine player mapping not found');
        let x = 0;
        if (input.right === true)
        {
            x += 1;
        }
        if (input.left === true)
        {
            x -= 1;
        }
        let y = 0;
        if (input.down === true)
        {
            y += 1;
        }
        if (input.up === true)
        {
            y -= 1;
        }
        return this.send({
            type: ENGINE_INPUT_TYPE.MOVE,
            roomId,
            playerId: enginePlayerId,
            velX: x,
            velY: y,
        });
    }

    sendPlayerAction(roomId, userId, action, direction = {})
    {
        const enginePlayerId = this.getEnginePlayerId(roomId, userId);
        if (enginePlayerId === null)
            throw new Error('Engine player mapping not found');
        if (!Object.values(PLAYER_ACTION).includes(action))
            throw new TypeError('Invalid player action');
        const requiresDirection =
            action === PLAYER_ACTION.MELEE ||
            action === PLAYER_ACTION.RANGED;
        const hasInvalidDirection =
            !Number.isInteger(direction.dirX) ||
            !Number.isInteger(direction.dirY) ||
            direction.dirX < -1 ||
            direction.dirX > 1 ||
            direction.dirY < -1 ||
            direction.dirY > 1 ||
            (direction.dirX === 0 && direction.dirY === 0);
        if (requiresDirection && hasInvalidDirection)
            throw new TypeError('Invalid player attack direction');
        return this.send({
            type: ENGINE_INPUT_TYPE.ACTION,
            roomId,
            playerId: enginePlayerId,
            action,
            dirX: direction.dirX,
            dirY: direction.dirY,
        });
    }

    sendCheckpointUpgrade(roomId, userId, playerData, upgrade)
    {
        const enginePlayerId = this.getEnginePlayerId(roomId, userId);
        if (enginePlayerId === null)
            throw new Error('Engine player mapping not found');
        if (!playerData || typeof playerData !== 'object' || Array.isArray(playerData))
            throw new TypeError('Invalid player data');
        if (playerData.atACheckpoint !== true)
            throw new Error('Player is not at a checkpoint');
        if (!Object.values(PLAYER_UPGRADE).includes(upgrade))
            throw new TypeError('Invalid player upgrade');
        return this.send({
            type: ENGINE_INPUT_TYPE.ACTION,
            roomId,
            playerId: enginePlayerId,
            action: PLAYER_ACTION.NONE,
            upgrade: {
                melee: upgrade === PLAYER_UPGRADE.MELEE,
                ranged: upgrade === PLAYER_UPGRADE.RANGED,
                shield: upgrade === PLAYER_UPGRADE.SHIELD,
                health: upgrade === PLAYER_UPGRADE.HEALTH,
            },
        });
    }

    writeMapPayload(mapPayload)
    {
        return writeMapFile(this.mapDirectory, mapPayload);
    }

    removeMapPayload(filePath)
    {
        return removeMapFile(filePath);
    }

    // n is the number of players in the room
    randomMap(n)
    {
        return pickRandomMapFile(n);
    }

    async startGame(room)
    {
        const session = this.createSession(room);
        const joinedPlayerIds = [];
        let roomCreated = false;
        const roomReadyPromise = this.waitForRoomReady(room.id);
        const playerCount = session.players.length;
        const mapPayload = mapConv(
            await this.randomMap(playerCount),
            room.id
        );
        session.map = {
            roomId: room.id,
            width: mapPayload.width,
            height: mapPayload.height,
            scale: mapPayload.scale,
            rows: mapPayload.rows,
            spawnX: mapPayload.spawnX,
            spawnY: mapPayload.spawnY,
            entities: mapPayload.entities,
        };
        let roomReadyRetry = null;
        try
        {
            session.engineMapFile = await this.writeMapPayload(mapPayload);
            const roomCreateCommand = {
                type: ENGINE_INPUT_TYPE.ROOM_CREATE,
                roomId: room.id,
                scale: mapPayload.scale,
                entities: [],
                entitiesFile: session.engineMapFile,
            };
            await this.send(roomCreateCommand);

            roomCreated = true;
            roomReadyRetry = setInterval(() =>
            {
                this.send(roomCreateCommand).catch((error) =>
                {
                    console.error(`Unable to retry engine room create for ${room.id}:`, error);
                });
            }, 1000);
            await roomReadyPromise;
            clearInterval(roomReadyRetry);
            roomReadyRetry = null;

            for (const player of session.players)
            {
                await this.send({
                    type: ENGINE_INPUT_TYPE.JOIN,
                    roomId: room.id,
                    playerId: player.enginePlayerId,
                    username: player.username,
                });
                joinedPlayerIds.push(player.enginePlayerId);
            }
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_START, roomId: room.id });
            session.startedAt = Date.now();
            return session;
        }
        catch (error)
        {
            if (roomReadyRetry)
            {
                clearInterval(roomReadyRetry);
            }
            for (const playerId of joinedPlayerIds)
            {
                try
                {
                    await this.send({
                        type: ENGINE_INPUT_TYPE.LEAVE,
                        roomId: room.id,
                        playerId,
                    });
                }
                catch (cleanupError)
                {
                    console.error('Unable to rollback engine player:', playerId, cleanupError);
                }
            }
            if (roomCreated)
            {
                try
                {
                    await this.send({ type: ENGINE_INPUT_TYPE.ROOM_DESTROY, roomId: room.id });
                }
                catch (cleanupError)
                {
                    console.error(`Unable to rollback engine room ${room.id};`, cleanupError);
                }
            }
            await this.removeMapPayload(session.engineMapFile);
            this.removeSession(room.id);
            throw error;
        }
    }

    waitForRoomReady(roomId)
    {
        return this.roomReadyTracker.wait(roomId);
    }

    resolveRoomReady(roomId, message)
    {
        return this.roomReadyTracker.resolve(roomId, message);
    }

    rejectRoomReady(roomId, error)
    {
        return this.roomReadyTracker.reject(roomId, error);
    }

    async removePlayer(roomId, userId)
    {
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
    }

    async stopGame(roomId, reason)
    {
        const session = this.getSession(roomId);
        if (!session)
            return;
        try
        {
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_STOP, roomId, reason });
        }
        catch (error)
        {
            console.log(`Unable to stop room ${roomId}:`, error);
            throw error;
        }
    }

    async destroyGame(roomId)
    {
        const session = this.getSession(roomId);
        if (!session)
            return;
        let firstError = null;
        try
        {
            await this.send({ type: ENGINE_INPUT_TYPE.ROOM_DESTROY, roomId });
        }
        catch (error)
        {
            if (!firstError)
            {
                firstError = error;
            }
            console.error(`Unable to destroy engine room ${roomId}:`, error);
        }
        finally
        {
            await this.removeMapPayload(session.engineMapFile);
            this.removeSession(roomId);
        }
        if (firstError)
            throw firstError;
    }

    removeSession(roomId)
    {
        this.rejectRoomReady(roomId, new Error(`Room ${roomId} removed before roomReady`));
        this.sessionStore.delete(roomId);
    }

    ping()
    {
        return this.send({
            type: ENGINE_INPUT_TYPE.PING,
        });
    }

    handleMessage(buffer, remoteInfo)
    {
        let message;
        try
        {
            message = JSON.parse(buffer.toString('utf8'));
        }
        catch (error)
        {
            console.error('Invalid JSON received from game engine:', buffer.toString('utf8'));
            this.emit('invalid-message', {
                error,
                raw: buffer.toString('utf8'),
                remoteInfo,
            });
            return;
        }
        if (!message || typeof message !== 'object' || Array.isArray(message))
        {
            console.error('Invalid message received from game engine:', message);
            this.emit('invalid-message', {
                error: new TypeError('Game engine message must be an object'),
                raw: buffer.toString('utf8'),
                remoteInfo,
            });
            return;
        }
        this.emit('message', message, remoteInfo);
        if (message.type === 'roomReady' && typeof message.roomId === 'string')
        {
            this.resolveRoomReady(message.roomId, message);
        }
        if (message.type === 'roomInitFailed' && typeof message.roomId === 'string')
        {
            const error = new Error(`Game engine init failed for room ${message.roomId}`);
            error.code = 'ROOM_INIT_FAILED';
            this.rejectRoomReady(message.roomId, error);
        }
        if (typeof message.type === 'string')
        {
            this.emit(message.type, message, remoteInfo);
        }
    }

    close()
    {
        if (!this.started)
            return;

        if (this.pingInterval)
        {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

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
