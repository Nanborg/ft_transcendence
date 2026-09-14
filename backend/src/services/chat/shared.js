const prisma = require('../../db');

const MAX_CHAT_MESSAGE_LENGTH = 2000;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 100;
// DECISION: Game invites expire after 15 minutes.
const GAME_INVITATION_TTL_MS = 15 * 60 * 1000;

class ChatServiceError extends Error
{
    constructor(code, message)
    {
        // WHY: Services throw client-safe chat errors.
        super(message);
        this.name = 'ChatServiceError';
        this.code = code;
    }
}

const CHAT_MESSAGE_INCLUDE = {
    // WHY: One include shape powers all chat serializers.
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
    // SAFETY: User ids must be positive integers.
    if (!Number.isInteger(userId) || userId <= 0)
        throw new ChatServiceError('INVALID_USER_ID', 'Invalid user id');
    return userId;
}

function requireInvitationId(invitationId)
{
    // SAFETY: Route/socket ids arrive as strings.
    const normalizedInvitationId = Number(invitationId);
    if (!Number.isInteger(normalizedInvitationId) || normalizedInvitationId <= 0)
        throw new ChatServiceError('INVALID_INVITATION_ID', 'Invalid invitation id');
    return normalizedInvitationId;
}

function normalizeMessageContent(content)
{
    // SAFETY: Messages must be strings.
    if (typeof content !== 'string')
        throw new ChatServiceError('INVALID_MESSAGE', 'Message must be a string');
    const normalizedContent = content.trim();
    if (!normalizedContent)
        // SAFETY: Empty messages are ignored.
        throw new ChatServiceError('EMPTY_MESSAGE', 'Message cannot be empty');
    if (normalizedContent.length > MAX_CHAT_MESSAGE_LENGTH)
        // REQUIRED: Frontend uses same max length.
        throw new ChatServiceError('MESSAGE_TOO_LONG', `Message cannot exceed ${MAX_CHAT_MESSAGE_LENGTH} characters`);
    return normalizedContent;
}

function normalizeHistoryOptions(options = {})
{
    // SAFETY: Clamp pagination input.
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
    // FALLBACK: System messages have no user.
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
    // WHY: Socket payloads use frontend-friendly names.
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
                // FALLBACK: Messages can be system-authored.
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
    // SAFETY: Chat targets must exist.
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
    // SAFETY: Room chat requires membership.
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
