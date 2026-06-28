const prisma = require("../db");
const playerInputs = new Map();
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

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
    if (!cleanIdentifier) {
        return {
            room: null,
            error: "Invalid payload",
        };
    }

    const room = await prisma.room.findFirst({
        where: {
            OR: [
                {id: cleanIdentifier},
                {name: cleanIdentifier},
            ],
        },
    });

    if (!room) {
        return {
            room: null,
            error: "Room not found",
        };
    }

    const fullRoom = await prisma.room.findUnique({
        where: { id: room.id },
        include: { players: true },
    });

    if (fullRoom.status !== "waiting") {
        return {
            room: null,
            error: "Game already started",
        };
    }
    
    const existingPlayer = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId: room.id,
                userId: userId,
            },
        },
    });
    if (fullRoom.players.length >= MAX_PLAYERS) {
        return {
            room: null,
            error: "Room is full",
        };
    }
    if (!existingPlayer) {
        await prisma.roomPlayer.create({
            data: {
                roomId: room.id,
                userId: userId,
                ready: false,
            },
        });
    }
    return {
        room: await getRoom(room.id),
        error: null,
    };
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

    playerInputs.delete(`${roomId}:${userId}`);

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

async function leaveAllRooms(userId) {
    const memberships = await prisma.roomPlayer.findMany({
        where: { userId },
        include: { room: true },
    });

    const updatedRooms = [];
    const removedRoomIds = [];

    for (const membership of memberships) {
        const roomId = membership.roomId;
        const room = membership.room;

        await prisma.roomPlayer.deleteMany({
            where: { roomId, userId }
        });

        playerInputs.delete(`${roomId}:${userId}`);

        const remainingPlayers = await prisma.roomPlayer.findMany({
            where: { roomId },
            orderBy: { joinedAt: "asc" }
        });

        if (remainingPlayers.length === 0) {
            await prisma.room.delete({
                where: { id: roomId }
            });
            removedRoomIds.push(roomId);
            continue;
        }

        if (room.ownerId === userId) {
            await prisma.room.update({
                where: { id: roomId },
                data: { ownerId: remainingPlayers[0].userId },
            });
        }

        const updatedRoom = await getRoom(roomId);
        if (updatedRoom) {
            updatedRooms.push(updatedRoom);
        }
    }
    return {
        updatedRooms,
        removedRoomIds,
    };
}

async function getPlayerInRoom(roomId, userId) {
    const player = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId,
                userId,
            },
        },
        include: { user: true },
    });
    if (!player)
        return null;
    return {
        id: player.user.id,
        name: player.user.username,
        ready: player.ready,
    };
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

async function startGame(roomId, userId) {
    const room = await getRoom(roomId);

    if (!room) {
        return {
            room: null,
            error: "Room not found"
        };
    }
    const player = room.players.find((player) => player.id === userId);
    if (!player) {
        return {
            room: null,
            error: "Player is not in room",
        };
    }
    if (room.ownerId !== userId) {
        return {
            room,
            error: "Only the owner can start the game",
        };
    }
    if (room.status !== "waiting") {
        return {
            room,
            error: "Game already started",
        };
    }
    if (room.players.length < MIN_PLAYERS) {
        return {
            room,
            error: `At least ${MIN_PLAYERS} player(s) required`,
        };
    }
    const allPlayersReady = room.players.every((player) => player.ready === true);
    if (!allPlayersReady) {
        return {
            room,
            error: "All players must be ready",
        };
    }
    await prisma.room.update({
        where: { id: roomId },
        data: { status: "starting" },
    });
    return {
        room: await getRoom(roomId),
        error: null,
    };
}

async function setPlayerInput(roomId, userId, input) {
    const room = await getRoom(roomId);

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
    const player = room.players.find((player) => player.id === userId);
    if (!player) {
        return {
            room,
            error: "Player is not in room",
        };
    }
    
    const inputKey = `${roomId}:${userId}`;

    playerInputs.set(inputKey, {
        roomId,
        userId,
        up: input.up === true,
        down: input.down === true,
        left: input.left === true,
        right: input.right === true,
        action: input.action === true,
        updatedAt: Date.now(),
    });

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