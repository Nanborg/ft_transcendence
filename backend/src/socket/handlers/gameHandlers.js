const { getPlayerInRoom, getRoom, startGame, markGamePlaying, setPlayerInput, resetGameStart } = require('../rooms');
const { getConnection } = require('../connections');
const { gameEngineService, PLAYER_ACTION, PLAYER_UPGRADE } = require('../../services/gameEngineService');

function getGameEngineStartMessage(errorCode)
{
    if (errorCode === 'GAME_ENGINE_ROOM_READY_TIMEOUT')
        return 'Game engine did not confirm room readiness in time';
    if (errorCode === 'GAME_ENGINE_INIT_FAILED')
        return 'Game engine failed while loading the map';
    return 'Unable to start the game engine';
}

function getPayloadRoomId(payload)
{
    if (payload?.roomId !== null && payload?.roomId !== undefined)
        return payload.roomId;
    return '';
}

function getNormalizedAction(input)
{
    if (typeof input.action !== 'boolean')
        return input.action;
    if (input.action)
        return PLAYER_ACTION.MELEE;
    return PLAYER_ACTION.NONE;
}

function registerGameHandlers(io, socket)
{
    socket.on('game:start', async (payload) =>
    {
        if (!payload || typeof payload.roomId !== 'string')
        {
            socket.emit('room:error', {
                event: 'game:start',
                message: 'Invalid payload',
            });
            return;
        }
        try
        {
            const { roomId } = payload;
            let { room, error } = await startGame(roomId, socket.user.id);
            if (error)
            {
                socket.emit('room:error', {
                    event: 'game:start',
                    message: error,
                });
                return;
            }
            let engineSession;
            io.to(roomId).emit('room:update', room);

            try
            {
                engineSession = await gameEngineService.startGame(room);
            }
            catch (error)
            {
                console.error('Unable to start game engine session:', error);
                const restoredRoom = await resetGameStart(roomId);
                io.to(roomId).emit('room:update', restoredRoom);
                let errorCode = 'GAME_ENGINE_START_FAILED';
                if (error?.code === 'ROOM_READY_TIMEOUT')
                    errorCode = 'GAME_ENGINE_ROOM_READY_TIMEOUT';
                else if (error?.code === 'ROOM_INIT_FAILED')
                    errorCode = 'GAME_ENGINE_INIT_FAILED';
                socket.emit('room:error', {
                    event: 'game:start',
                    code: errorCode,
                    message: getGameEngineStartMessage(errorCode),
                });
                return;
            }
            room = await markGamePlaying(roomId);

            io.to(roomId).emit('room:update', room);
            io.to(roomId).emit('game:start', {
                roomId: room.id,
                status: room.status,
                players: room.players,
                enginePlayers: engineSession.players,
                timestamp: Date.now(),
            });
            const initialState = gameEngineService.getStateSnapshot(roomId);
            if (initialState)
            {
                io.to(roomId).emit('game:state:init', initialState);
            }
            console.log(`game starting in room ${room.id}`);
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'game:start',
                message: error.message,
            });
        }
    });

    socket.on('game:resync', async (payload) =>
    {
        if (!payload || typeof payload.roomId !== 'string')
        {
            socket.emit('game:error', {
                roomId: getPayloadRoomId(payload),
                code: 'INVALID_PAYLOAD',
                message: 'Invalid game resync payload',
            });
            return;
        }
        const { roomId } = payload;
        try
        {
            const player = await getPlayerInRoom(roomId, socket.user.id);
            if (!player)
            {
                socket.emit('game:error', {
                    roomId,
                    code: 'PLAYER_NOT_IN_ROOM',
                    message: 'Player is not in room',
                });
                return;
            }
            const snapshot = gameEngineService.getStateSnapshot(roomId);
            if (!snapshot)
            {
                socket.emit('game:error', {
                    roomId,
                    code: 'GAME_NOT_RUNNING',
                    message: 'Game is not running',
                });
                return;
            }
            const room = await getRoom(roomId);
            const engineSession = gameEngineService.getSession(room.id);
            const connection = getConnection(socket.user.id);
            if (connection?.reconnectTimer && connection.keepOnReconnect)
            {
                clearTimeout(connection.reconnectTimer);
                connection.reconnectTimer = null;
                connection.keepOnReconnect = false;
                connection.disconnectedAt = null;
            }
            socket.emit('game:start', {
                roomId: room.id,
                status: room.status,
                players: room.players,
                enginePlayers: engineSession.players,
                timestamp: Date.now(),
            });
            socket.emit('game:state:init', snapshot);
        }
        catch (error)
        {
            console.error(`Unable to resync game state for room ${roomId}:`, error);
            socket.emit('game:error', {
                roomId,
                code: 'GAME_RESYNC_FAILED',
                message: 'Unable to resync game state',
            });
        }
    });

    socket.on('player:input', async (payload) =>
    {
        if (
            !payload ||
            typeof payload.roomId !== 'string' ||
            typeof payload.input !== 'object' ||
            payload.input === null ||
            Array.isArray(payload.input)
        )
        {
            socket.emit('room:error', {
                event: 'player:input',
                message: 'Invalid payload',
            });
            return;
        }
        try
        {
            const { roomId, input } = payload;
            const movementKeys = ['up', 'down', 'left', 'right'];
            const validKeys = [...movementKeys, 'action', 'dirX', 'dirY'];
            const inputKeys = Object.keys(input);
            const hasMovement = movementKeys.some((key) => Object.hasOwn(input, key));
            const hasAction = Object.hasOwn(input, 'action');
            const hasDirection = Object.hasOwn(input, 'dirX') || Object.hasOwn(input, 'dirY');
            const hasInvalidKey = inputKeys.some((key) => !validKeys.includes(key));
            const hasInvalidMovement = hasMovement && movementKeys.some((key) => typeof input[key] !== 'boolean');
            const normalizedAction = getNormalizedAction(input);
            const requiresDirection =
                hasAction &&
                (
                    normalizedAction === PLAYER_ACTION.MELEE ||
                    normalizedAction === PLAYER_ACTION.RANGED
                );
            const hasInvalidDirection =
                hasDirection &&
                (
                    !Number.isInteger(input.dirX) ||
                    !Number.isInteger(input.dirY) ||
                    input.dirX < -1 ||
                    input.dirX > 1 ||
                    input.dirY < -1 ||
                    input.dirY > 1 ||
                    (input.dirX === 0 && input.dirY === 0)
                );
            const hasMissingDirection = requiresDirection && !hasDirection;
            const hasInvalidAction = hasAction && !Object.values(PLAYER_ACTION).includes(normalizedAction);
            if (
                inputKeys.length === 0 ||
                (!hasMovement && !hasAction) ||
                hasInvalidKey ||
                hasInvalidMovement ||
                hasInvalidDirection ||
                hasMissingDirection ||
                hasInvalidAction
            )
            {
                socket.emit('room:error', {
                    event: 'player:input',
                    message: 'Invalid input',
                });
                return;
            }
            const normalizedInput = {
                ...(hasMovement && {
                    up: input.up,
                    down: input.down,
                    left: input.left,
                    right: input.right,
                }),
                ...(hasAction && {
                    action: normalizedAction,
                }),
                ...(hasDirection && {
                    dirX: input.dirX,
                    dirY: input.dirY,
                }),
            };
            const { error } = await setPlayerInput(roomId, socket.user.id, normalizedInput);
            if (error)
            {
                socket.emit('room:error', {
                    event: 'player:input',
                    message: error,
                });
                return;
            }
            try
            {
                if (hasMovement)
                {
                    await gameEngineService.sendPlayerInput(
                        roomId,
                        socket.user.id,
                        normalizedInput
                    );
                }
                if (hasAction)
                {
                    await gameEngineService.sendPlayerAction(
                        roomId,
                        socket.user.id,
                        normalizedAction,
                        {
                            dirX: normalizedInput.dirX,
                            dirY: normalizedInput.dirY,
                        }
                    );
                }
            }
            catch (error)
            {
                console.error('Unable to send player input to game engine:', error);
                socket.emit('room:error', {
                    event: 'player:input',
                    message: 'Game engine unavailable',
                });
                return;
            }
            io.to(roomId).emit('player:input', {
                playerId: socket.user.id,
                input: normalizedInput,
                timestamp: Date.now(),
            });
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'player:input',
                message: error.message,
            });
        }
    });

    socket.on('checkpoint:upgrade', async (payload) =>
    {
        if (
            !payload ||
            typeof payload.roomId !== 'string' ||
            !Object.values(PLAYER_UPGRADE).includes(payload.upgrade)
        )
        {
            socket.emit('checkpoint:error', {
                roomId: getPayloadRoomId(payload),
                code: 'INVALID_PAYLOAD',
                message: 'Invalid checkpoint upgrade payload',
            });
            return;
        }
        const { roomId, upgrade } = payload;
        try
        {
            const player = await getPlayerInRoom(roomId, socket.user.id);
            if (!player)
            {
                socket.emit('checkpoint:error', {
                    roomId,
                    code: 'PLAYER_NOT_IN_ROOM',
                    message: 'Player is not in room',
                });
                return;
            }
            const playerData = gameEngineService.getPlayerData(roomId, socket.user.id);
            if (!playerData)
            {
                socket.emit('checkpoint:error', {
                    roomId,
                    code: 'PLAYER_DATA_UNAVAILABLE',
                    message: 'Player data is unavailable',
                });
                return;
            }
            if (playerData.atACheckpoint !== true)
            {
                socket.emit('checkpoint:error', {
                    roomId,
                    code: 'PLAYER_NOT_AT_CHECKPOINT',
                    message: 'Player is not at a checkpoint',
                });
                return;
            }
            await gameEngineService.sendCheckpointUpgrade(
                roomId,
                socket.user.id,
                playerData,
                upgrade
            );
        }
        catch (error)
        {
            console.error(`Unable to upgrade ${upgrade} for user ${socket.user.id}:`, error);
            socket.emit('checkpoint:error', {
                roomId,
                code: 'CHECKPOINT_UPGRADE_FAILED',
                message: 'Unable to upgrade ability',
            });
        }
    });
}

module.exports = { registerGameHandlers };
