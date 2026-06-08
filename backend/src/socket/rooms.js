const rooms = new Map();

function generateRoomId() {
    return `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createRoom(ownerId) {
    const roomId = generateRoomId();

    const room = {
        id: roomId,
        ownerId,
        players: [ownerId],
        createdAt: Date.now(),
    };
    rooms.set(roomId, room);
    return room;
}

function joinRoom(roomId, playerId) {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }
    if (!room.players.includes(playerId)) {
        room.players.push(playerId);
    }
    return room;
}

function leaveRoom(roomId, playerId) {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }
    room.players = room.players.filter((id) => id !== playerId);
    if (room.players.length === 0) {
        rooms.delete(roomId);
        return null;
    }
    if (room.ownerId === playerId) {
        room.ownerId = room.players[0];
    }
    return room;
}

function getRoom(roomId) {
    return rooms.get(roomId) || null;
}

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
};