const prisma = require('../../db');
const {
    CHAT_MESSAGE_INCLUDE,
    GAME_INVITATION_TTL_MS,
    ChatServiceError,
    requireUserId,
    requireInvitationId,
    serializeChatMessage,
    requireExistingUser,
} = require('./shared');
const { requireMessagingAllowed } = require('./blocking');

async function expireGameInvitations(recipientId)
{
    requireUserId(recipientId);
    await prisma.gameInvitation.updateMany({
        where: {
            recipientId,
            status: 'PENDING',
            expiresAt: {
                lte: new Date(),
            },
        },
        data: {
            status: 'EXPIRED',
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
    const normalizedRoomId = typeof roomId === 'string' ? roomId.trim() : '';
    if (!normalizedRoomId)
        throw new ChatServiceError('INVALID_ROOM_ID', 'Invalid room id');
    const room = await prisma.room.findUnique({
        where: { id: normalizedRoomId },
        include: {
            players: {
                select: {
                    userId: true,
                },
            },
        },
    });
    if (!room)
        throw new ChatServiceError('ROOM_NOT_FOUND', 'Room not found');
    if (room.status !== 'waiting')
        throw new ChatServiceError('GAME_ALREADY_STARTED', 'Game already started');
    const senderIsMember = room.players.some((player) => player.userId === senderId);
    if (!senderIsMember)
        throw new ChatServiceError('PLAYER_NOT_IN_ROOM', 'You are not in this room');
    if (room.players.length >= 4)
        throw new ChatServiceError('ROOM_FULL', 'Room is full');
    const recipientMembership = await prisma.roomPlayer.findFirst({
        where: { userId: recipientId },
        select: { roomId: true },
    });
    if (recipientMembership)
        throw new ChatServiceError('RECIPIENT_ALREADY_IN_ROOM', 'This user is already in a room');
    await expireGameInvitations(recipientId);
    const existingInvitation = await prisma.gameInvitation.findFirst({
        where: {
            senderId,
            recipientId,
            roomId: normalizedRoomId,
            status: 'PENDING',
            expiresAt: {
                gt: new Date(),
            },
        },
        select: { id: true },
    });
    if (existingInvitation)
        throw new ChatServiceError('INVITATION_ALREADY_PENDING', 'An invitation is already pending');
    const sender = await requireExistingUser(senderId);
    const expiresAt = new Date(Date.now() + GAME_INVITATION_TTL_MS);
    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            recipientId,
            type: 'GAME_INVITATION',
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
            status: 'PENDING',
            expiresAt: { lte: new Date() },
            OR: [
                { senderId: userId },
                { recipientId: userId },
            ],
        },
        data: {
            status: 'EXPIRED',
            respondedAt: new Date(),
        },
    });
    const messages = await prisma.chatMessage.findMany({
        where: {
            type: 'GAME_INVITATION',
            invitation: {
                is: {
                    OR: [
                        {
                            recipientId: userId,
                            status: 'PENDING',
                            expiresAt: { gt: new Date() },
                        },
                        { senderId: userId },
                    ],
                },
            },
        },
        include: CHAT_MESSAGE_INCLUDE,
        orderBy: { id: 'desc' },
        take: 100,
    });
    return messages.map(serializeChatMessage);
}

async function getPendingGameInvitation({
    invitationId,
    recipientId,
})
{
    const normalizedInvitationId = requireInvitationId(invitationId);
    requireUserId(recipientId);
    const invitation = await prisma.gameInvitation.findUnique({
        where: { id: normalizedInvitationId },
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
    if (!invitation || invitation.recipientId !== recipientId)
        throw new ChatServiceError('INVITATION_NOT_FOUND', 'Invitation not found');
    if (invitation.status === 'PENDING' && invitation.expiresAt <= new Date())
    {
        await prisma.gameInvitation.update({
            where: { id: invitation.id },
            data: {
                status: 'EXPIRED',
                respondedAt: new Date(),
            },
        });
        throw new ChatServiceError('INVITATION_EXPIRED', 'Invitation has expired');
    }
    if (invitation.status !== 'PENDING')
        throw new ChatServiceError('INVITATION_ALREADY_HANDLED', 'Invitation has already been handled');
    if (!invitation.roomId)
        throw new ChatServiceError('ROOM_NOT_FOUND', 'Room no longer exists');
    return invitation;
}

async function respondToGameInvitation({
    invitationId,
    recipientId,
    response,
})
{
    const invitation = await getPendingGameInvitation({ invitationId, recipientId });
    if (response !== 'ACCEPTED' && response !== 'DECLINED')
        throw new ChatServiceError('INVALID_INVITATION_RESPONSE', 'Invalid invitation response');
    const updateResult = await prisma.gameInvitation.updateMany({
        where: {
            id: invitation.id,
            recipientId,
            status: 'PENDING',
            expiresAt: {
                gt: new Date(),
            },
        },
        data: {
            status: response,
            respondedAt: new Date(),
        },
    });
    if (updateResult.count !== 1)
        throw new ChatServiceError('INVITATION_ALREADY_HANDLED', 'Invitation has already been handled');
    const chatMessage = await prisma.chatMessage.findUnique({
        where: { id: invitation.messageId },
        include: CHAT_MESSAGE_INCLUDE,
    });
    if (!chatMessage)
        throw new ChatServiceError('INVITATION_NOT_FOUND', 'Invitation message not found');
    return serializeChatMessage(chatMessage);
}

module.exports = {
    expireGameInvitations,
    createGameInvitation,
    getPendingGameInvitations,
    getPendingGameInvitation,
    respondToGameInvitation,
};
