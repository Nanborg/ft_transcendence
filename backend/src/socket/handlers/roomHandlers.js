const { createRoom, joinRoom, leaveRoom, getRoom, setPlayerReady } = require('../rooms');
const { gameEngineService } = require('../../services/gameEngineService');

function registerRoomHandlers(io, socket)
{
    socket.on('room:create', async ({ roomName } = {}) =>
    {
        try
        {
            const { room, error } = await createRoom(socket.user.id, roomName);
            if (error)
            {
                socket.emit('room:error', {
                    event: 'room:create',
                    code: error.code,
                    message: error.message,
                });
                return;
            }
            socket.join(room.id);
            console.log(`room created: ${room.id} by user ${socket.user.id}`);
            socket.emit('room:created', room);
            io.to(room.id).emit('room:update', room);
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'room:create',
                message: error.message,
            });
        }
    });

    socket.on('room:join', async (payload) =>
    {
        if (!payload || typeof payload.roomId !== 'string')
        {
            socket.emit('room:error', {
                event: 'room:join',
                code: 'INVALID_PAYLOAD',
                message: 'Invalid payload',
            });
            return;
        }
        try
        {
            const { roomId } = payload;
            const { room, error } = await joinRoom(roomId, socket.user.id);
            if (error)
            {
                socket.emit('room:error', {
                    event: 'room:join',
                    code: error.code,
                    message: error.message,
                });
                return;
            }
            socket.join(room.id);
            console.log(`socket ${socket.user.id} joined room ${room.id}`);
            io.to(room.id).emit('room:update', room);
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'room:join',
                message: error.message,
            });
        }
    });

    socket.on('room:leave', async (payload) =>
    {
        if (!payload || typeof payload.roomId !== 'string')
        {
            socket.emit('room:error', {
                event: 'room:leave',
                message: 'Invalid payload',
            });
            return;
        }
        try
        {
            const { roomId } = payload;
            const roomBeforeLeave = await getRoom(roomId);
            const isLastPlayer =
                roomBeforeLeave &&
                roomBeforeLeave.players.length === 1 &&
                String(roomBeforeLeave.players[0].id) ===
                    String(socket.user.id);
            try
            {
                if (isLastPlayer)
                {
                    await gameEngineService.stopGame(roomId, 'all_players_left');
                }
                else
                {
                    await gameEngineService.removePlayer(roomId, socket.user.id);
                }
            }
            catch (error)
            {
                console.error(`Unable to remove user ${socket.user.id} from engine room ${roomId}:`, error);
            }
            const room = await leaveRoom(roomId, socket.user.id);
            socket.leave(roomId);
            console.log(`socket ${socket.user.id} left room ${roomId}`);
            if (room)
            {
                io.to(roomId).emit('room:update', room);
            }
            else
            {
                io.to(roomId).emit('room:removed', { roomId });
                console.log(`room removed: ${roomId}`);
            }
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'room:leave',
                message: error.message,
            });
        }
    });

    socket.on('player:ready', async (payload) =>
    {
        if (!payload || typeof payload.roomId !== 'string')
        {
            socket.emit('room:error', {
                event: 'player:ready',
                code: 'INVALID_PAYLOAD',
                message: 'Invalid payload',
            });
            return;
        }
        try
        {
            const { roomId } = payload;
            const result = await setPlayerReady(roomId, socket.user.id);
            if (!result)
            {
                socket.emit('room:error', {
                    event: 'player:ready',
                    code: 'PLAYER_NOT_IN_ROOM',
                    message: 'Player is not in room',
                });
                return;
            }
            const { room, error } = result;
            if (error)
            {
                socket.emit('room:error', {
                    event: 'player:ready',
                    code: error.code,
                    message: error.message,
                });
                return;
            }
            io.to(roomId).emit('room:update', room);
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'player:ready',
                message: error.message,
            });
        }
    });
}

module.exports = { registerRoomHandlers };
