const prisma = require("../db");
const rooms = new Map();

function generateRoomId() {
    return `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createPlayer(playerId, playerName) {
    return {
        id: playerId,
        name: playerName || `Player-${playerId.slice(0, 4)}`,
        ready: false,
        input: {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false,
        },
    };
}

async function createRoom(ownerId, roomName) {
    const roomId = generateRoomId();
    const cleanRoomName = typeof roomName === "string" && roomName.trim()
        ? roomName.trim()
        : null;

    if (cleanRoomName)
    {
        const existingRoom = await prisma.room.findUnique({
            where: {
                name: cleanRoomName,
            },
        });
        if (existingRoom)
            throw new Error("Room name already exists");
    }
    await prisma.room.create({
        data: {
            id: roomId,
            name: cleanRoomName,
            ownerId: ownerId,
            players: {
                create: {
                    userId: ownerId,
                    ready: false,
                },
            },
        },
    });
    return getRoom(roomId);
}

async function joinRoom(roomIdentifier, userId) {
    const cleanIdentifier = typeof roomIdentifier === "string"
        ? roomIdentifier.trim()
        : "";
    if (!cleanIdentifier)
        return null;

    const room = await prisma.room.findFirst({
        where: {
            OR: [
                {id: cleanIdentifier},
                {name: cleanIdentifier},
            ],
        },
    });

    if (!room) {
        return null;
    }
    
    const existingPlayer = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId: room.id,
                userId: userId,
            },
        },
    });
    if (!existingPlayer) {
        await prisma.roomPlayer.create({
            data: {
                roomId: room.id,
                userId: userId,
                ready: false,
            },
        });
    }
    return getRoom(room.id);
}

async function leaveRoom(roomId, userId) {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { players: true },
    });

    if (!room) {
        return null;
    }
    
    await prisma.roomPlayer.deleteMany({
        where: {
            roomId,
            userId,
        },
    });

    const remainingPlayers = await prisma.roomPlayer.findMany({
        where: { roomId },
    });

    if (remainingPlayers.length === 0)
    {
        await prisma.room.delete({
            where: { id: roomId },
        });
        return null;
    }
    if (room.ownerId === userId)
    {
        await prisma.room.update({
            where: { id: roomId },
            data: { ownerId: remainingPlayers[0].userId },
        });
    }
    return getRoom(roomId);
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

async function setPlayerReady(roomId, userId) {
   const player = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId,
                userId,
            },
        },
    });

    if (!player)
        return null;

    await prisma.roomPlayer.update({
        where: {
            roomId_userId: {
                roomId,
                userId,
            },
        },
        data: { ready: !player.ready },
    });
    return getRoom(roomId);
}

function startGame(roomId, playerId) {
    const room = rooms.get(roomId);

    if (!room) {
        return {
            room: null,
            error: "Room not found"
        };
    }
    const player = room.players.find((player) => player.id === playerId);
    if (!player) {
        return {
            room: null,
            error: "Player is not in room",
        };
    }
    const allPlayersReady = room.players.length > 0 &&
        room.players.every((player) => player.ready === true);
    if (!allPlayersReady) {
        return {
            room,
            error: "All players must be ready",
        };
    }
    room.status = "starting";
    return {
        room,
        error: null,
    };
}

function setPlayerInput(roomId, playerId, input) {
    const room = rooms.get(roomId);

    if (!room) {
        return {
            room: null,
            error: "Room not found",
        };
    }
    if (room.status !== "starting" && room.status !== "playing") {
        return {
            room,
            error: "Game is not started",
        };
    }
    const player = room.players.find((player) => player.id === playerId);
    if (!player) {
        return {
            room,
            error: "Player is not in room",
        };
    }
    player.input = {
        up: input.up === true,
        down: input.down === true,
        left: input.left === true,
        right: input.right === true,
        action: input.action === true,
    };
    return {
        room,
        error: null,
    };
}

function formatRoom(room)
{
    if (!room)
        return null;

    return {
        id: room.id,
        name: room.name,
        ownerId: room.ownerId,
        status: room.status,
        createdAt: room.createdAt,
        players: room.players.map((player) => ({
            id: player.user.id,
            name: player.user.username,
            ready: player.ready,
        })),
    };
}

async function getRoom(roomId) {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            players: {
                include: {
                    user: true,
                },
            },
        },
    });
    return formatRoom(room);
}

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    leaveAllRooms,
    getPlayerInRoom,
    setPlayerReady,
    startGame,
    setPlayerInput,
};