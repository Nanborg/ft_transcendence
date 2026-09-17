// WHY: Socket handler is the bridge between browser rooms, chat, and game engine events
// SAFETY: Game end processing is locked per room so duplicate engine messages do not double-save results
const { addConnection } = require('./connections');
const { getRoomsByUserId, resetGameStart } = require('./rooms');
const { gameEngineService, PLAYER_ACTION } = require('../services/gameEngineService');
const { adaptPayloadForDB, saveGameResults } = require('../services/gameService');
const { registerConnectionHandlers } = require('./handlers/connectionHandlers');
const { registerRoomHandlers } = require('./handlers/roomHandlers');
const { registerGameHandlers } = require('./handlers/gameHandlers');
const { registerChatHandlers } = require('./handlers/chatHandlers');
const { getUserSocketRoom, normalizeEngineEntity } = require('./socketUtils');
const { createGameStateBatcher } = require('./gameStateBatcher');

const processingGameEnds = new Set();

function getMessageRoomId(message)
{
    if (message?.roomId !== undefined && message?.roomId !== null)
        return message.roomId;
    return message?.room;
}

function getMessageTick(message, session)
{
    if (typeof message.tick === 'number')
        return message.tick;
    return session?.tick ?? 0;
}

function getGameEndDurationSeconds(serverStartedAt, endedAt)
{
    if (typeof serverStartedAt === 'number')
        return Math.max(0, Math.floor((endedAt - serverStartedAt) / 1000));
    return 0;
}

function getGameEndEntities(message, snapshot)
{
    if (Array.isArray(message.entities))
        return message.entities.map(normalizeEngineEntity);
    return snapshot?.entities ?? [];
}

function getGameEndPlayerData(message, snapshot)
{
    if (Array.isArray(message.playerData))
        return message.playerData;
    return snapshot?.playerData ?? [];
}

function getGameEndTick(message, snapshot)
{
    if (typeof message.tick === 'number')
        return message.tick;
    return snapshot?.tick ?? 0;
}

function getGameEndWin(message)
{
    if (typeof message.win === 'boolean')
        return message.win;
    return message.victory === true;
}

function getEnginePayloadPlayer(player, session)
{
    const sessionPlayer = session?.players.find((sp) => sp.enginePlayerId === player.playerId);
    if (sessionPlayer)
    {
        // SYNC: Store user id, not engine id
        return {
            ...player,
            playerId: sessionPlayer.userId,
        };
    }
    return {
        ...player,
        playerId: player.playerId,
    };
}

module.exports = (io) =>
{
    const gameStateBatcher = createGameStateBatcher(io, roomId => gameEngineService.getSession(roomId));
    gameEngineService.on('close', gameStateBatcher.clear);
    gameEngineService.on('playerUpdate', (message) =>
    {
        const roomId = getMessageRoomId(message);
        if (
            !message ||
            typeof roomId !== 'string' ||
            !message.playerData ||
            typeof message.playerData !== 'object' ||
            Array.isArray(message.playerData)
        )
        {
            console.error('Invalid playerUpdate received from game engine:', message);
            return;
        }
        const previousPlayer = gameEngineService.getSession(roomId)?.playerData.find(
            player => player.enginePlayerId === message.playerData.playerId
        );
        const normalizedPlayer = gameEngineService.cachePlayerUpdate(
            roomId,
            message.playerData,
            message.tick
        );
        if (!normalizedPlayer)
        {
            console.error(`Unable to map playerupdate for room ${roomId}:`, message.playerData);
            return;
        }
        if (previousPlayer && !processingGameEnds.has(roomId))
        {
            for (const [key, action] of [
                ['melee', PLAYER_ACTION.MELEE],
                ['ranged', PLAYER_ACTION.RANGED],
            ])
            {
                const before = previousPlayer.cooldowns?.[key];
                const after = normalizedPlayer.cooldowns?.[key];
                if (Number.isFinite(before) && Number.isFinite(after) && after > before)
                {
                    io.to(roomId).emit('player:attack', {
                        roomId,
                        playerId: normalizedPlayer.playerId,
                        action,
                    });
                }
            }
        }
        const session = gameEngineService.getSession(roomId);
        gameStateBatcher.enqueue({
            roomId,
            tick: getMessageTick(message, session),
            end: false,
            entityUpdate: [],
            entityDelete: [],
            playerData: [normalizedPlayer],
        });
    });

    gameEngineService.on('entityUpdate', (message) =>
    {
        const roomId = getMessageRoomId(message);
        if (
            !message ||
            typeof roomId !== 'string' ||
            typeof message.entity !== 'object' ||
            message.entity === null
        )
        {
            console.error('Invalid entityUpdate received from game engine:', message);
            return;
        }
        const entity = normalizeEngineEntity(message.entity);
        const session = gameEngineService.getSession(roomId);
        const previousEntity = session?.entities.get(entity.entityId);
        if (Number.isFinite(entity.health))
        {
            const previousMax = previousEntity?.healthBarMax;
            entity.healthBarMax = Math.max(
                1,
                Number.isFinite(previousMax) ? previousMax : 0,
                entity.health
            );
        }
        gameEngineService.cacheEntityUpdate(roomId, entity, message.tick);
        gameStateBatcher.enqueue({
            roomId,
            tick: message.tick,
            end: false,
            entityUpdate: [ entity ],
            entityDelete: [],
            playerData: [],
        });
    });

    gameEngineService.on('gameEnd', async (message) =>
    {
        const roomId = getMessageRoomId(message);
        if (!message || typeof roomId !== 'string' || typeof message.reason !== 'string')
        {
            console.error('Invalid gameEnd received from game engine:', message);
            return;
        }
        if (processingGameEnds.has(roomId))
        {
            console.log(`[GameEnd] Duplicate event ignored for room: ${roomId}`);
            return;
        }
        gameStateBatcher.end(roomId);
        processingGameEnds.add(roomId);
        const snapshot = gameEngineService.getStateSnapshot(roomId);
        const endedAt = Date.now();
        const serverStartedAt = snapshot?.serverStartedAt;
        const durationSeconds = getGameEndDurationSeconds(serverStartedAt, endedAt);
        const entities = getGameEndEntities(message, snapshot);
        const playerData = getGameEndPlayerData(message, snapshot);
        const tick = getGameEndTick(message, snapshot);
        const win = getGameEndWin(message);
        try
        {
            const session = gameEngineService.getSession(roomId);
            const enginePayload = {
                roomId,
                win,
                reason: message.reason,
                durationSeconds,
                playerData: playerData.map((p) => getEnginePayloadPlayer(p, session)),
            };
            const dbData = adaptPayloadForDB(enginePayload);
            // DECISION: Save final engine result now
            await saveGameResults(dbData);
            let roomToUpdate = null;
            try
            {
                roomToUpdate = await resetGameStart(roomId);
            }
            catch (error)
            {
                if (error.code === 'P2025')
                {
                    console.log(`Room ${roomId} has already been deleted.`);
                }
                else
                {
                    throw error;
                }
            }
            io.to(roomId).emit('game:end', {
                roomId,
                tick,
                durationSeconds,
                end: true,
                win,
                reason: message.reason,
                entities,
                playerData,
            });
            if (roomToUpdate)
            {
                io.to(roomId).emit('room:update', roomToUpdate);
            }
        }
        catch (error)
        {
            console.error(`Unable to complete game end for room ${roomId};`, error);
            io.to(roomId).emit('game:error', {
                roomId,
                code: 'GAME_END_PROCESSING_FAILED',
                message: 'Unable to complete the game end',
            });
        }
        finally
        {
            processingGameEnds.delete(roomId);
            console.log(`[GameEnd] Lock released for room: ${roomId}`);
        }
        await gameEngineService.destroyGame(roomId);
    });

    gameEngineService.on('entityDelete', (message) =>
    {
        const roomId = getMessageRoomId(message);
        if (
            !message ||
            typeof roomId !== 'string' ||
            typeof message.entity !== 'object' ||
            message.entity === null ||
            typeof message.entity.entityId !== 'number'
        )
        {
            console.error('Invalid entityDelete received from game engine:', message);
            return;
        }
        const deletedEntity = normalizeEngineEntity(message.entity);
        gameEngineService.cacheEntityDelete(roomId, deletedEntity.entityId, message.tick);
        gameStateBatcher.enqueue({
            roomId,
            tick: message.tick,
            end: false,
            entityUpdate: [],
            entityDelete: [deletedEntity],
            playerData: [],
        });
    });

    io.on('connection', async (socket) =>
    {
        console.log(`socket connected: ${socket.id}`);
        addConnection(socket.user.id, socket);
        io.emit('user:status', {
            userId: socket.user.id,
            isOnline: true,
        });
        socket.join(getUserSocketRoom(socket.user.id));
        const existingRoom = await getRoomsByUserId(socket.user.id);

        for (const room of existingRoom)
        {
            socket.join(room.id);
            socket.emit('room:update', room);
            io.to(room.id).emit('room:update', room);
        }

        registerConnectionHandlers(io, socket);
        registerRoomHandlers(io, socket);
        registerGameHandlers(io, socket, gameStateBatcher);
        registerChatHandlers(io, socket);
    });
};
