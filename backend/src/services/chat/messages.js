const prisma = require('../../db');
const {
    CHAT_MESSAGE_INCLUDE,
    ChatServiceError,
    requireUserId,
    normalizeMessageContent,
    normalizeHistoryOptions,
    serializeUser,
    serializeChatMessage,
    requireExistingUser,
    requireRoomMembership,
} = require('./shared');
const { requireMessagingAllowed } = require('./blocking');

async function createRoomMessage({
    roomId,
    senderId,
    content,
})
{
    // REQUIRED: Room messages need valid content.
    const normalizedContent = normalizeMessageContent(content);
    const normalizedRoomId = typeof roomId === 'string' ? roomId.trim() : '';
    // SAFETY: Only room members can write room chat.
    await requireRoomMembership(normalizedRoomId, senderId);
    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            roomId: normalizedRoomId,
            type: 'TEXT',
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
})
{
    // REQUIRED: Direct messages need valid content.
    const normalizedContent = normalizeMessageContent(content);
    // SAFETY: Blocks stop direct messages.
    await requireMessagingAllowed(senderId, recipientId);
    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            recipientId,
            type: 'TEXT',
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
})
{
    // SAFETY: History is limited to room members.
    const normalizedRoomId = typeof roomId === 'string' ? roomId.trim() : '';
    await requireRoomMembership(normalizedRoomId, userId);
    const historyOptions = normalizeHistoryOptions({ beforeId, limit });
    // DECISION: Fetch newest first, return oldest first.
    const messages = await prisma.chatMessage.findMany({
        where: {
            roomId: normalizedRoomId,
            ...(historyOptions.beforeId
                ? {
                    id: {
                        lt: historyOptions.beforeId,
                    },
                }
                : {}),
        },
        include: CHAT_MESSAGE_INCLUDE,
        orderBy: { id: 'desc' },
        take: historyOptions.limit,
    });
    return messages.reverse().map(serializeChatMessage);
}

async function getDirectHistory({
    userId,
    otherUserId,
    beforeId,
    limit,
})
{
    // SAFETY: Both users must be valid.
    requireUserId(userId);
    await requireExistingUser(otherUserId);
    if (userId === otherUserId)
        // SAFETY: Self-conversations are invalid.
        throw new ChatServiceError('CANNOT_MESSAGE_SELF', 'You cannot open a conversation with yourself');
    const historyOptions = normalizeHistoryOptions({ beforeId, limit });
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
        orderBy: { id: 'desc' },
        take: historyOptions.limit,
    });
    return messages.reverse().map(serializeChatMessage);
}

async function markDirectMessagesRead({
    userId,
    otherUserId,
})
{
    // REQUIRED: Read receipt needs both users.
    requireUserId(userId);
    requireUserId(otherUserId);
    const latestUnreadMessage = await prisma.chatMessage.findFirst({
        // DECISION: Mark everything up to latest unread.
        where: {
            senderId: otherUserId,
            recipientId: userId,
            readAt: null,
        },
        orderBy: { id: 'desc' },
        select: { id: true },
    });
    if (!latestUnreadMessage)
    {
        // FALLBACK: No unread messages is valid.
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
        data: { readAt },
    });
    return {
        updatedCount: result.count,
        upToMessageId: latestUnreadMessage.id,
        readAt: readAt.getTime(),
    };
}

async function getDirectConversations(userId)
{
    requireUserId(userId);
    // WHY: SQL finds latest message and unread count per user.
    const conversations = await prisma.$queryRaw`
        WITH direct_messages As (
            SELECT
                message.*,
                CASE
                    WHEN message."senderId" = ${userId}
                    THEN message."recipientId"
                    ELSE message."senderId"
                END AS "otherUserId"
            FROM "ChatMessage" AS message
            WHERE
                message."senderId" IS NOT NULL
                AND message."recipientId" IS NOT NULL
                AND (
                    message."senderId" = ${userId}
                    OR message."recipientId" = ${userId}
                )
        ),
        latest_messages AS (
            SELECT DISTINCT ON ("otherUserId")
                *
            FROM direct_messages
            ORDER BY "otherUserId", "id" DESC
        ),
        unread_counts AS (
            SELECT
                "senderId" AS "otherUserId",
                COUNT(*)::INTEGER AS "unreadCount"
            FROM "ChatMessage"
            WHERE
                "recipientId" = ${userId}
                AND "senderId" IS NOT NULL
                AND "readAt" IS NULL
            GROUP BY "senderId"
        )
        SELECT
            latest."otherUserId",
            latest."id" AS "messageId",
            latest."type",
            latest."content",
            latest."senderId",
            latest."createdAt",
            latest."readAt",
            COALESCE(unread."unreadCount", 0)::INTEGER AS "unreadCount"
        FROM latest_messages AS latest
        LEFT JOIN unread_counts AS unread
            ON unread."otherUserId" = latest."otherUserId"
        ORDER BY latest."id" DESC
        LIMIT 100
    `;
    const otherUserIds = conversations.map((conversation) => conversation.otherUserId);
    // REQUIRED: Serialize users from Prisma records.
    const users = await prisma.user.findMany({
        where: {
            id: {
                in: otherUserIds,
            },
        },
        select: {
            id: true,
            username: true,
            avatar: true,
        },
    });
    const userById = new Map(users.map((user) => [user.id, user]));
    return conversations
        // SAFETY: Ignore rows for deleted users.
        .filter((conversation) => userById.has(conversation.otherUserId))
        .map((conversation) => ({
            user: serializeUser(userById.get(conversation.otherUserId)),
            unreadCount: conversation.unreadCount,
            lastMessage: {
                id: conversation.messageId,
                type: conversation.type,
                message: conversation.content,
                senderId: conversation.senderId,
                timestamp: conversation.createdAt.getTime(),
                readAt: conversation.readAt
                    ? conversation.readAt.getTime()
                    : null,
            },
        }));
}

module.exports = {
    createRoomMessage,
    createDirectMessage,
    getRoomHistory,
    getDirectHistory,
    getDirectConversations,
    markDirectMessagesRead,
};
