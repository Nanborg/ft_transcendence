const prisma = require("../db");

const MAX_CHAT_MESSAGE_LENGTH = 2000;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 100;
const GAME_INVITATION_TTL_MS = 15 * 60 * 1000;

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

async function getDirectConversations(userId)
{
    requireUserId(userId);
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
    const otherUserIds = conversations.map(conversation => conversation.otherUserId);
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
    const userById = new Map(users.map(user => [user.id, user]));
    return conversations
        .filter(conversation => userById.has(conversation.otherUserId))
        .map(conversation => ({
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

function requireInvitationId(invitationId)
{
    const normalizedInvitationId = Number(invitationId);

    if (
        !Number.isInteger(normalizedInvitationId) ||
        normalizedInvitationId <= 0
    ) {
        throw new ChatServiceError(
            "INVALID_INVITATION_ID",
            "Invalid invitation id"
        );
    }

    return normalizedInvitationId;
}

async function expireGameInvitations(recipientId)
{
    requireUserId(recipientId);

    await prisma.gameInvitation.updateMany({
        where: {
            recipientId,
            status: "PENDING",
            expiresAt: {
                lte: new Date(),
            },
        },
        data: {
            status: "EXPIRED",
            respondedAt: new Date(),
        },
    });
}

async function createGameInvitation({
    senderId,
    recipientId,
    roomId,
})
{
    requireUserId(senderId);
    requireUserId(recipientId);

    await requireMessagingAllowed(senderId, recipientId);

    const normalizedRoomId =
        typeof roomId === "string" ? roomId.trim() : "";

    if (!normalizedRoomId) {
        throw new ChatServiceError(
            "INVALID_ROOM_ID",
            "Invalid room id"
        );
    }

    const room = await prisma.room.findUnique({
        where: {
            id: normalizedRoomId,
        },
        include: {
            players: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!room) {
        throw new ChatServiceError(
            "ROOM_NOT_FOUND",
            "Room not found"
        );
    }

    if (room.status !== "waiting") {
        throw new ChatServiceError(
            "GAME_ALREADY_STARTED",
            "Game already started"
        );
    }

    const senderIsMember = room.players.some(
        player => player.userId === senderId
    );

    if (!senderIsMember) {
        throw new ChatServiceError(
            "PLAYER_NOT_IN_ROOM",
            "You are not in this room"
        );
    }

    if (room.players.length >= 4) {
        throw new ChatServiceError(
            "ROOM_FULL",
            "Room is full"
        );
    }

    const recipientMembership =
        await prisma.roomPlayer.findFirst({
            where: {
                userId: recipientId,
            },
            select: {
                roomId: true,
            },
        });

    if (recipientMembership) {
        throw new ChatServiceError(
            "RECIPIENT_ALREADY_IN_ROOM",
            "This user is already in a room"
        );
    }

    await expireGameInvitations(recipientId);

    const existingInvitation =
        await prisma.gameInvitation.findFirst({
            where: {
                senderId,
                recipientId,
                roomId: normalizedRoomId,
                status: "PENDING",
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
            },
        });

    if (existingInvitation) {
        throw new ChatServiceError(
            "INVITATION_ALREADY_PENDING",
            "An invitation is already pending"
        );
    }

    const sender = await requireExistingUser(senderId);
    const expiresAt = new Date(
        Date.now() + GAME_INVITATION_TTL_MS
    );

    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            recipientId,
            type: "GAME_INVITATION",
            content: `${sender.username} invited you to join ${room.name || room.id}`,
            invitation: {
                create: {
                    senderId,
                    recipientId,
                    roomId: normalizedRoomId,
                    expiresAt,
                },
            },
        },
        include: CHAT_MESSAGE_INCLUDE,
    });

    return serializeChatMessage(chatMessage);
}

async function getPendingGameInvitations(userId)
{
    requireUserId(userId);
    await prisma.gameInvitation.updateMany({
        where: {
            status: "PENDING",
            expiresAt: { lte: new Date(), },
            OR: [
                { senderId: userId },
                { recipientId: userId },
            ],
        },
        data: {
            status: "EXPIRED",
            respondedAt: new Date(),
        },
    });

    const messages = await prisma.chatMessage.findMany({
        where: {
            type: "GAME_INVITATION",
            invitation: {
                is: {
                    OR: [
                        {
                            recipientId: userId,
                            status: "PENDING",
                            expiresAt: {gt: new Date(), },
                        },
                        {senderId: userId,},
                    ],
                },
            },
        },
        include: CHAT_MESSAGE_INCLUDE,
        orderBy: {id: "desc", },
        take: 100,
    });
    return messages.map(serializeChatMessage);
}

async function getPendingGameInvitation({
    invitationId,
    recipientId,
})
{
    const normalizedInvitationId =
        requireInvitationId(invitationId);

    requireUserId(recipientId);

    const invitation = await prisma.gameInvitation.findUnique({
        where: {
            id: normalizedInvitationId,
        },
        select: {
            id: true,
            messageId: true,
            senderId: true,
            recipientId: true,
            roomId: true,
            status: true,
            expiresAt: true,
        },
    });

    if (!invitation || invitation.recipientId !== recipientId) {
        throw new ChatServiceError(
            "INVITATION_NOT_FOUND",
            "Invitation not found"
        );
    }

    if (invitation.status === "PENDING" && invitation.expiresAt <= new Date())
    {
        await prisma.gameInvitation.update({
            where: {
                id: invitation.id,
            },
            data: {
                status: "EXPIRED",
                respondedAt: new Date(),
            },
        });
        throw new ChatServiceError(
            "INVITATION_EXPIRED",
            "Invitation has expired"
        );
    }
    if (invitation.status !== "PENDING") {
        throw new ChatServiceError(
            "INVITATION_ALREADY_HANDLED",
            "Invitation has already been handled"
        );
    }
    if (!invitation.roomId) {
        throw new ChatServiceError(
            "ROOM_NOT_FOUND",
            "Room no longer exists"
        );
    }
    return invitation;
}

async function respondToGameInvitation({
    invitationId,
    recipientId,
    response,
})
{
    const invitation = await getPendingGameInvitation({
        invitationId,
        recipientId,
    });
    if (response !== "ACCEPTED" && response !== "DECLINED")
    {
        throw new ChatServiceError(
            "INVALID_INVITATION_RESPONSE",
            "Invalid invitation response"
        );
    }
    const updateResult = await prisma.gameInvitation.updateMany({
        where: {
            id: invitation.id,
            recipientId,
            status: "PENDING",
            expiresAt: {
                gt: new Date(),
            },
        },
        data: {
            status: response,
            respondedAt: new Date(),
        },
    });
    if (updateResult.count !== 1) {
        throw new ChatServiceError(
            "INVITATION_ALREADY_HANDLED",
            "Invitation has already been handled"
        );
    }
    const chatMessage = await prisma.chatMessage.findUnique({
        where: {
            id: invitation.messageId,
        },
        include: CHAT_MESSAGE_INCLUDE,
    });
    if (!chatMessage) {
        throw new ChatServiceError(
            "INVITATION_NOT_FOUND",
            "Invitation message not found"
        );
    }
    return serializeChatMessage(chatMessage);
}

module.exports = {
    MAX_CHAT_MESSAGE_LENGTH,
    ChatServiceError,
    normalizeMessageContent,
    serializeChatMessage,
    getBlockingRelationship,
    createRoomMessage,
    createDirectMessage,
    createGameInvitation,
    getPendingGameInvitations,
    getPendingGameInvitation,
    respondToGameInvitation,
    getRoomHistory,
    getDirectHistory,
    getDirectConversations,
    markDirectMessagesRead,
    blockUser,
    unblockUser,
    getBlockedUsers,
};
