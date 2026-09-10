const prisma = require('../../db');

const MAX_CHAT_MESSAGE_LENGTH = 2000;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 100;
const GAME_INVITATION_TTL_MS = 15 * 60 * 1000;

class ChatServiceError extends Error
{
    constructor(code, message)
    {
        super(message);
        this.name = 'ChatServiceError';
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

function requireUserId(userId)
{
    if (!Number.isInteger(userId) || userId <= 0)
        throw new ChatServiceError('INVALID_USER_ID', 'Invalid user id');
    return userId;
}

function requireInvitationId(invitationId)
{
    const normalizedInvitationId = Number(invitationId);
    if (!Number.isInteger(normalizedInvitationId) || normalizedInvitationId <= 0)
        throw new ChatServiceError('INVALID_INVITATION_ID', 'Invalid invitation id');
    return normalizedInvitationId;
}

function normalizeMessageContent(content)
{
    if (typeof content !== 'string')
        throw new ChatServiceError('INVALID_MESSAGE', 'Message must be a string');
    const normalizedContent = content.trim();
    if (!normalizedContent)
        throw new ChatServiceError('EMPTY_MESSAGE', 'Message cannot be empty');
    if (normalizedContent.length > MAX_CHAT_MESSAGE_LENGTH)
        throw new ChatServiceError('MESSAGE_TOO_LONG', `Message cannot exceed ${MAX_CHAT_MESSAGE_LENGTH} characters`);
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
    return { limit, beforeId };
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
                name: 'System',
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

async function requireExistingUser(userId)
{
    requireUserId(userId);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            avatar: true,
        },
    });
    if (!user)
        throw new ChatServiceError('USER_NOT_FOUND', 'User not found');
    return user;
}

async function requireRoomMembership(roomId, userId)
{
    requireUserId(userId);
    if (typeof roomId !== 'string' || !roomId.trim())
        throw new ChatServiceError('INVALID_ROOM_ID', 'Invalid room id');
    const membership = await prisma.roomPlayer.findUnique({
        where: {
            roomId_userId: {
                roomId: roomId.trim(),
                userId,
            },
        },
    });
    if (!membership)
        throw new ChatServiceError('PLAYER_NOT_IN_ROOM', 'Player is not in room');
    return membership;
}

module.exports = {
    MAX_CHAT_MESSAGE_LENGTH,
    GAME_INVITATION_TTL_MS,
    CHAT_MESSAGE_INCLUDE,
    ChatServiceError,
    requireUserId,
    requireInvitationId,
    normalizeMessageContent,
    normalizeHistoryOptions,
    serializeUser,
    serializeChatMessage,
    requireExistingUser,
    requireRoomMembership,
};
