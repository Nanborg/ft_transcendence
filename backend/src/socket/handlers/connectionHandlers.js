const { removeConnection, scheduleDisconnect, isConnected } = require('../connections');
const { leaveAllRooms, getRoomsByUserId } = require('../rooms');
const { gameEngineService } = require('../../services/gameEngineService');

function registerConnectionHandlers(io, socket)
{
    socket.on('debug:latency:check', ({ clientSentAt }) =>
    {
        if (!clientSentAt || typeof clientSentAt !== 'number')
            return;

        socket.emit('debug:latency:result', {
            clientSentAt,
            backendReceivedAt: Date.now(),
        });
    });

    socket.on('disconnect', async () =>
    {
        try
        {
            const stopInput = {
                up: false,
                down: false,
                left: false,
                right: false,
            };
            const userRooms = await getRoomsByUserId(socket.user.id);
            const keepOnReconnect = userRooms.some((room) => gameEngineService.getSession(room.id));
            for (const room of userRooms)
            {
                await gameEngineService.sendPlayerInput(room.id, socket.user.id, stopInput);
            }
            scheduleDisconnect(
                socket.user.id,
                socket.id,
                async () =>
                {
                    const userRooms = await getRoomsByUserId(socket.user.id);
                    if (!isConnected(socket.user.id))
                    {
                        io.emit('user_status', {
                            userId: socket.user.id,
                            isConnected: false,
                        });
                    }
                    for (const room of userRooms)
                    {
                        try
                        {
                            const engineSession = gameEngineService.getSession(room.id);
                            if (!engineSession || room.players.length <= 1)
                            {
                                await gameEngineService.stopGame(room.id, 'all_players_left');
                            }
                            else
                            {
                                await gameEngineService.removePlayer(room.id, socket.user.id);
                            }
                        }
                        catch (error)
                        {
                            console.error(`Unable to remove user ${socket.user.id} from engine room ${room.id}:`, error);
                        }
                    }
                    const { updatedRooms, removedRoomIds } = await leaveAllRooms(socket.user.id);
                    for (const room of updatedRooms)
                    {
                        io.to(room.id).emit('room:update', room);
                    }
                    for (const roomId of removedRoomIds)
                    {
                        io.to(roomId).emit('room:removed', {
                            roomId,
                        });
                    }
                    removeConnection(socket.user.id, socket.id);
                    console.log(
                        `user ${socket.user.id} removed after reconnect timeout`
                    );
                },
                keepOnReconnect
            );
        }
        catch (error)
        {
            socket.emit('room:error', {
                event: 'disconnect',
                message: error.message,
            });
        }
    });
}

module.exports = { registerConnectionHandlers };
