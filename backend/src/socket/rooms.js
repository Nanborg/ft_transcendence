const rooms = new Map();

function generateRoomId() {
    return `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createPlayer(playerId, playerName) {
    return {
        id: playerId,
        name: playerName || `Player-${playerId.slice(0, 4)}`,
        ready: false,
    };
}

function createRoom(ownerId, ownerName) {
    const roomId = generateRoomId();
    const owner = createPlayer(ownerId, ownerName);

    const room = {
        id: roomId,
        ownerId,
        players: [owner],
        createdAt: Date.now(),
    };
    rooms.set(roomId, room);
    return room;
}

function joinRoom(roomId, playerId, playerName) {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }
    const alreadyInRoom = room.players.some((player) => player.id === playerId);
    if (!alreadyInRoom) {
        room.players.push(createPlayer(playerId, playerName));
    }
    return room;
}

function leaveRoom(roomId, playerId) {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }
    room.players = room.players.filter((player) => player.id !== playerId);
    if (room.players.length === 0) {
        rooms.delete(roomId);
        return null;
    }
    if (room.ownerId === playerId) {
        room.ownerId = room.players[0].id;
    }
    return room;
}

function leaveAllRooms(playerId) {
    const updatedRooms = [];
    const removedRoomIds = [];

    for (const [roomId, room] of rooms.entries()) {
        const wasInRoom = room.players.some((player) => player.id === playerId);
        if (!wasInRoom) {
            continue;
        }
        room.players = room.players.filter((player) => player.id !== playerId);
        if (room.players.length === 0) {
            rooms.delete(roomId);
            removedRoomIds.push(roomId);
            continue;
        }
        if (room.ownerId === playerId) {
            room.ownerId = room.players[0].id;
        }
        updatedRooms.push(room);
    }
    return {
        updatedRooms,
        removedRoomIds,
    };
}

function getPlayerInRoom(roomId, playerId) {
    const room = rooms.get(roomId);
    if (!room) {
        return null;
    }
    return room.players.find((player) => player.id === playerId) || null;
}

function setPlayerReady(roomId, playerId) {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }
    const player = room.players.find((player) => player.id === playerId);
    if (!player) {
        return null;
    }
    player.ready = !player.ready;
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
    leaveAllRooms,
    getPlayerInRoom,
    setPlayerReady,
};