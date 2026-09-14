const prisma = require("../db");
const { gameEngineService } = require("../services/gameEngineService");
const { cleanInput } = require('../services/sanitize');
const playerInputs = new Map();
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

function generateRoomId() {
    // DECISION: Human-readable ids help debugging.
    return `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createPlayer(playerId, playerName) {
    // FALLBACK: Anonymous players still get labels.
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
    // SAFETY: Room names must be user-provided strings.
    if (typeof roomName !== "string") {
        return {
            room: null,
            error: {
                code: "INVALID_ROOM_NAME",
                message: "Room name must be a non-empty string",
            },
        };
    }
    const cleanRoomName = cleanInput(roomName.trim());
    // SAFETY: Sanitized empty name is invalid.
    if (cleanRoomName === '') {
        return {
            room: null,
            error: {
                code: "INVALID_ROOM_NAME",
                message: "Room name must be a non-empty string",
            },
        };
    }
    // REQUIRED: A user can own/join only one room.
    const existingMembership = await prisma.roomPlayer.findFirst({
        where: {
            userId: ownerId,
        },
    });
    if (existingMembership) {
        return {
            room: null,
            error: {
                code: "USER_ALREADY_IN_ROOM",
                message: "User is already in a room",
            },
        };
    }
    const roomId = generateRoomId();
    // SAFETY: Room names stay unique for joins.
    const existingRoom = await prisma.room.findUnique({
        where: {
            name: cleanRoomName,
        },
    });

    if (existingRoom) {
        return {
            room: null,
            error: {
                code: "ROOM_NAME_ALREADY_EXISTS",
                message: "Room name already exists"
            },
        };
    }
    await prisma.room.create({
        data: {
            id: roomId,
            name: cleanRoomName,
            ownerId,
            players: {
                create: {
                    userId: ownerId,
                    ready: false,
                },
            },
        },
    });
    return {
        room: await getRoom(roomId),
        error: null,
    };
}

async function joinRoom(roomIdentifier, userId) {
    // DECISION: Users can join by id or name.
    const cleanIdentifier = typeof roomIdentifier === "string"
        ? roomIdentifier.trim()
        : "";
    if (!cleanIdentifier) {
        // SAFETY: Empty identifier cannot select room.
        return {
            room: null,
            error: {
                code: "INVALID_PAYLOAD",
                message: "Invalid payload",
            },
        };
    }

    const room = await prisma.room.findFirst({
        where: {
            // REQUIRED: Support both room id and room name.
            OR: [
                { id: cleanIdentifier },
                { name: cleanIdentifier },
            ],
        },
    });

    if (!room) {
        return {
            room: null,
            error: {
                code: "ROOM_NOT_FOUND",
                message: "Room not found",
            },
        };
    }

    const membershipInAnotherRoom = await prisma.roomPlayer.findFirst({
        // SAFETY: Prevent cross-room state conflicts.
        where: {
            userId,
            roomId: {
                not: room.id,
            },
        },
    });

    if (membershipInAnotherRoom) {
        return {
            room: null,
            error: {
                code: "USER_ALREADY_IN_ANOTHER_ROOM",
                message: "User is already in another room",
            },
        };
    }

    const existingPlayer = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId: room.id,
                userId,
            },
        },
    });

    if (existingPlayer) {
        // DECISION: Rejoining same room is idempotent.
        return {
            room: await getRoom(room.id),
            error: null,
        };
    }

    const fullRoom = await prisma.room.findUnique({
        where: { id: room.id },
        include: { players: true },
    });

    if (fullRoom.status !== "waiting") {
        // SAFETY: No joining after game start.
        return {
            room: null,
            error: {
                code: "GAME_ALREADY_STARTED",
                message: "Game already started",
            },
        };
    }

    if (fullRoom.players.length >= MAX_PLAYERS) {
        // REQUIRED: Game supports max four players.
        return {
            room: null,
            error: {
                code: "ROOM_FULL",
                message: "Room is full",
            },
        };
    }

    await prisma.roomPlayer.create({
        data: {
            roomId: room.id,
            userId,
            ready: false,
        },
    });
    return {
        room: await getRoom(room.id),
        error: null,
    };
}

async function leaveRoom(roomId, userId) {
    // SAFETY: Unknown room leave is harmless.
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { players: true },
    });

    if (!room) {
        return null;
    }

    // SYNC: Remove membership before room recalculation.
    await prisma.roomPlayer.deleteMany({
        where: {
            roomId,
            userId,
        },
    });

    // SYNC: Input cache must follow membership.
    playerInputs.delete(`${roomId}:${userId}`);

    const remainingPlayers = await prisma.roomPlayer.findMany({
        where: { roomId },
    });

    if (remainingPlayers.length === 0) {
        // DECISION: Empty rooms are deleted.
        await prisma.room.delete({
            where: { id: roomId },
        });
        return null;
    }
    if (room.ownerId === userId) {
        // DECISION: Oldest remaining player becomes owner.
        await prisma.room.update({
            where: { id: roomId },
            data: { ownerId: remainingPlayers[0].userId },
        });
    }
    return getRoom(roomId);
}

async function leaveAllRooms(userId) {
    // WHY: Disconnect/logout can clean multiple rooms.
    const memberships = await prisma.roomPlayer.findMany({
        where: { userId },
        include: { room: true },
    });

    const updatedRooms = [];
    const removedRoomIds = [];

    for (const membership of memberships) {
        // SYNC: Process each room independently.
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
            // SYNC: Caller emits room removed events.
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
    // REQUIRED: Game handlers verify membership.
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
    // SAFETY: Ready toggle requires membership.
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

    const room = await prisma.room.findUnique({
        where: { id: roomId },
    });
    if (!room)
        return null;

    if (room.status !== "waiting") {
        // SAFETY: Ready state locks after start.
        return {
            room: await getRoom(roomId),
            error: {
                code: "READY_LOCKED",
                message: "Ready state can only be changed while waiting",
            },
        };
    }

    await prisma.roomPlayer.update({
        where: {
            roomId_userId: {
                roomId,
                userId,
            },
        },
        data: { ready: !player.ready },
    });
    return {
        room: await getRoom(roomId),
        error: null,
    };
}

async function startGame(roomId, userId) {
    // Flow:
    //   1. Validate room and owner.
    //   2. Check minimum players.
    //   3. Require every player ready.
    //   4. Move room to starting.
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
        // REQUIRED: Owner controls game start.
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
        // REQUIRED: Start waits for all ready.
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

async function markGamePlaying(roomId) {
    // SYNC: Engine is ready, room becomes playable.
    await prisma.room.update({
        where: { id: roomId },
        data: { status: "playing" },
    });
    return getRoom(roomId);
}

async function setPlayerInput(roomId, userId, input) {
    // REQUIRED: Input only applies to live games.
    const room = await getRoom(roomId);

    if (!room) {
        return {
            room: null,
            error: "Room not found",
        };
    }
    if (room.status !== "playing") {
        return {
            room,
            error: "Game is not started",
        };
    }
    const player = room.players.find((roomPlayer) => roomPlayer.id === userId);
    if (!player) {
        return {
            room,
            error: "Player is not in room",
        };
    }

    const inputKey = `${roomId}:${userId}`;
    // SYNC: Partial input keeps previous axes.
    const previousInput = playerInputs.get(inputKey) || {
        up: false,
        down: false,
        left: false,
        right: false,
        action: 0,
    };

    playerInputs.set(inputKey, {
        roomId,
        userId,
        up: typeof input.up === "boolean" ? input.up : previousInput.up,
        down: typeof input.down === "boolean" ? input.down : previousInput.down,
        left: typeof input.left === "boolean" ? input.left : previousInput.left,
        right: typeof input.right === "boolean" ? input.right : previousInput.right,
        action: Number.isInteger(input.action) ? input.action : previousInput.action,
        updatedAt: Date.now(),
    });

    return {
        room,
        error: null,
    };
}

function formatRoom(room) {
    // WHY: Socket clients need a small room shape.
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
    // REQUIRED: Players stay ordered for stable UI.
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            players: {
                orderBy: [
                    { joinedAt: "asc" },
                    { id: "asc" },
                ],
                include: {
                    user: true,
                },
            },
        },
    });
    return formatRoom(room);
}

async function getRoomsByUserId(userId) {
    // WHY: Reconnect restores rooms for a user.
    const players = await prisma.roomPlayer.findMany({
        where: { userId },
        include: {
            room: {
                include: {
                    players: {
                        orderBy: [
                            { joinedAt: "asc" },
                            { id: "asc" },
                        ],
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });
    return players.map((player) => formatRoom(player.room));
}

async function resetGameStart(roomId) {
    // SYNC: Failed/ended games reset lobby state.
    await prisma.roomPlayer.updateMany({
        where: { roomId },
        data: { ready: false },
    });

    await prisma.room.update({
        where: { id: roomId },
        data: { status: "waiting" },
    });
    return getRoom(roomId);
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
    markGamePlaying,
    setPlayerInput,
    getRoomsByUserId,
    resetGameStart,
};
