const prisma = require("../db");

const MAX_CHAT_MESSAGE_LENGTH = 2000;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 100;

class ChatServiceError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "ChatServiceError";
        this.code = code;
    }
}

const CHAT_MESSAGE_INCLUDE = {
    sender: {
        select: {
            id: true,
            username: true,
            avatar: true,
        },
    },
    recipient: {
        select: {
            id: true,
            username: true,
            avatar: true,
        },
    },
    invitation: {
        include: {
            room: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
        },
    },
};

function requireUserId(userId) {
    if (!Number.isInteger(userId) || userId <= 0)
    {
        throw new ChatServiceError("INVALID_USER_ID", "Invalid user id");
    }
    return userId;
}

function normalizeMessageContent(content)
{
    if (typeof content !== "string")
        throw new ChatServiceError("INVALID_MESSAGE", "Message must be a string");
    const normalizedContent = content.trim();
    if (!normalizedContent)
        throw new ChatServiceError("EMPTY_MESSAGE", "Message cannot be empty");
    if (normalizedContent.length > MAX_CHAT_MESSAGE_LENGTH)
        throw new ChatServiceError("MESSAGE_TOO_LONG", `Message cannot exceed ${MAX_CHAT_MESSAGE_LENGTH} characters`);
    return normalizedContent;
}

function normalizeHistoryOptions(options = {})
{
    const parsedLimit = Number(options.limit);
    const parsedBeforeId = Number(options.beforeId);
    const limit = Number.isInteger(parsedLimit)
        ? Math.min(Math.max(parsedLimit, 1), MAX_HISTORY_LIMIT)
        : DEFAULT_HISTORY_LIMIT;
    const beforeId = Number.isInteger(parsedBeforeId) && parsedBeforeId > 0
        ? parsedBeforeId
        : null;
    return {limit, beforeId,};
}

function serializeUser(user)
{
    if (!user)
        return null;
    return {
        id: user.id,
        name: user.username,
        avatar: user.avatar,
    };
}

function serializeChatMessage(chatMessage)
{
    return {
        id: chatMessage.id,
        type: chatMessage.type,
        roomId: chatMessage.roomId,
        message: chatMessage.content,
        timestamp: chatMessage.createdAt.getTime(),
        readAt: chatMessage.readAt
            ? chatMessage.readAt.getTime()
            : null,
        author: chatMessage.sender
            ? serializeUser(chatMessage.sender)
            : {
                id: null,
                name:"System",
                avatar: null,
            },
            recipient: serializeUser(chatMessage.recipient),
            invitation: chatMessage.invitation
                ? {
                    id: chatMessage.invitation.id,
                    status: chatMessage.invitation.status,
                    room: chatMessage.invitation.room,
                    expiresAt: chatMessage.invitation.expiresAt.getTime(),
                    respondedAt: chatMessage.invitation.respondedAt
                        ? chatMessage.invitation.respondedAt.getTime()
                        : null,
                }
                : null,
    };
}

async function requireExistingUser(userId) {
    requireUserId(userId);
    const user = await prisma.user.findUnique({
        where: {id: userId,},
        select: {
            id: true,
            username: true,
            avatar: true,
        },
    });
    if (!user)
        throw new ChatServiceError("USER_NOT_FOUND", "User not found");
    return user;
}

async function requireRoomMembership(roomId, userId)
{
    requireUserId(userId);
    if (typeof roomId !== "string" || !roomId.trim())
        throw new ChatServiceError("INVALID_ROOM_ID", "Invalid room id");
    const membership = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId: roomId.trim(),
                userId,
            },
        },
    });
    if (!membership)
        throw new ChatServiceError("PLAYER_NOT_IN_ROOM", "Player is not in room");
    return membership;
}

async function getBlockingRelationship(firstUserId, secondUserId)
{
    requireUserId(firstUserId);
    requireUserId(secondUserId);
    return prisma.userBlock.findFirst({
        where: {
            OR: [
                {
                    blockerId: firstUserId,
                    blockedId: secondUserId,
                },
                {
                    blockerId: secondUserId,
                    blockedId: firstUserId,
                },
            ],
        },
    });
}

async function requireMessagingAllowed(senderId, recipientId)
{
    requireUserId(senderId);
    requireUserId(recipientId);
    if (senderId === recipientId)
        throw new ChatServiceError("CANNOT_MESSAGE_SELF", "You cannot message yourself");
    await requireExistingUser(recipientId);
    const blockingRelationship = await getBlockingRelationship(senderId, recipientId);
    if (blockingRelationship)
        throw new ChatServiceError("USER_BLOCKED", "Messaging is not allowed between these users");
}

async function createRoomMessage({
    roomId,
    senderId,
    content,
}) {
    const normalizedContent = normalizeMessageContent(content);
    const normalizedRoomId = typeof roomId === "string" ? roomId.trim() : "";
    await requireRoomMembership(normalizedRoomId, senderId);
    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            roomId: normalizedRoomId,
            type: "TEXT",
            content: normalizedContent,
        },
        include: CHAT_MESSAGE_INCLUDE,
    });
    return serializeChatMessage(chatMessage);
}

async function createDirectMessage({
    senderId,
    recipientId,
    content,
}) {
    const normalizedContent = normalizeMessageContent(content);
    await requireMessagingAllowed(senderId, recipientId);
    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            recipientId,
            type: "TEXT",
            content: normalizedContent,
        },
        include: CHAT_MESSAGE_INCLUDE,
    });
    return serializeChatMessage(chatMessage);
}

async function getRoomHistory({
    roomId,
    userId,
    beforeId,
    limit,
}) {
    const normalizedRoomId = typeof roomId === "string" ? roomId.trim() : "";
    await requireRoomMembership(normalizedRoomId, userId);
    const historyOptions = normalizeHistoryOptions({beforeId, limit,});
    const messages = await prisma.chatMessage.findMany({
        where: {
            roomId: normalizedRoomId,
            ...(historyOptions.beforeId
                ? {
                    id: {
                        lt: historyOptions.beforeId
                    },
                }
                : {}),
        },
        include: CHAT_MESSAGE_INCLUDE,
        orderBy: {
            id: "desc",
        },
        take: historyOptions.limit,
    });
    return messages.reverse().map(serializeChatMessage);
}

async function getDirectHistory({
    userId,
    otherUserId,
    beforeId,
    limit,
}) {
    requireUserId(userId);
    await requireExistingUser(otherUserId);
    if (userId === otherUserId)
        throw new ChatServiceError("CANNOT_MESSAGE_SELF", "You cannot open a conversation with yourself");
    const historyOptions = normalizeHistoryOptions({beforeId, limit});
    const messages = await prisma.chatMessage.findMany({
        where: {
            AND: [
                {
                    OR: [
                        {
                            senderId: userId,
                            recipientId: otherUserId,
                        },
                        {
                            senderId: otherUserId,
                            recipientId: userId,
                        },
                    ],
                },
                ...(historyOptions.beforeId
                    ? [
                        {
                            id: {
                                lt: historyOptions.beforeId,
                            },
                        },
                    ]
                    : []),
            ],
        },
        include: CHAT_MESSAGE_INCLUDE,
        orderBy: {
            id: "desc",
        },
        take: historyOptions.limit,
    });
    return messages.reverse().map(serializeChatMessage);
}

async function markDirectMessagesRead({
    userId,
    otherUserId,
}) {
    requireUserId(userId);
    requireUserId(otherUserId);
    const latestUnreadMessage = await prisma.chatMessage.findFirst({
        where: {
            senderId: otherUserId,
            recipientId: userId,
            readAt: null,
        },
        orderBy: {
            id: "desc",
        },
        select: {
            id: true,
        },
    });
    if (!latestUnreadMessage) {
        return {
            updatedCount: 0,
            upToMessageId: null,
            readAt: null,
        };
    }
    const readAt = new Date();
    const result = await prisma.chatMessage.updateMany({
        where: {
            senderId: otherUserId,
            recipientId: userId,
            readAt: null,
            id: {
                lte: latestUnreadMessage.id,
            },
        },
        data: {
            readAt,
        },
    });
    return {
        updatedCount: result.count,
        upToMessageId: latestUnreadMessage.id,
        readAt: readAt.getTime(),
    };
}

async function blockUser({
    blockerId,
    blockedId,
}) {
    requireUserId(blockerId);
    await requireExistingUser(blockedId);

    if (blockerId === blockedId) {
        throw new ChatServiceError(
            "CANNOT_BLOCK_SELF",
            "You cannot block yourself"
        );
    }

    return prisma.userBlock.upsert({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId,
            },
        },
        update: {},
        create: {
            blockerId,
            blockedId,
        },
    });
}

async function unblockUser({
    blockerId,
    blockedId,
}) {
    requireUserId(blockerId);
    requireUserId(blockedId);

    await prisma.userBlock.deleteMany({
        where: {
            blockerId,
            blockedId,
        },
    });
}

async function getBlockedUsers(userId) {
    requireUserId(userId);

    const blocks = await prisma.userBlock.findMany({
        where: {
            blockerId: userId,
        },
        include: {
            blocked: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return blocks.map((block) => ({
        ...serializeUser(block.blocked),
        blockedAt: block.createdAt.getTime(),
    }));
}

module.exports = {
    MAX_CHAT_MESSAGE_LENGTH,
    ChatServiceError,
    normalizeMessageContent,
    serializeChatMessage,
    getBlockingRelationship,
    createRoomMessage,
    createDirectMessage,
    getRoomHistory,
    getDirectHistory,
    markDirectMessagesRead,
    blockUser,
    unblockUser,
    getBlockedUsers,
};
