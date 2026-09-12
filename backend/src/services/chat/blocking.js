const prisma = require('../../db');
const {
    ChatServiceError,
    requireUserId,
    requireExistingUser,
    serializeUser,
} = require('./shared');

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
        throw new ChatServiceError('CANNOT_MESSAGE_SELF', 'You cannot message yourself');
    await requireExistingUser(recipientId);
    const blockingRelationship = await getBlockingRelationship(senderId, recipientId);
    if (blockingRelationship)
        throw new ChatServiceError('USER_BLOCKED', 'Messaging is not allowed between these users');
}

async function blockUser({
    blockerId,
    blockedId,
})
{
    requireUserId(blockerId);
    await requireExistingUser(blockedId);
    if (blockerId === blockedId)
        throw new ChatServiceError('CANNOT_BLOCK_SELF', 'You cannot block yourself');
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
})
{
    requireUserId(blockerId);
    requireUserId(blockedId);
    await prisma.userBlock.deleteMany({
        where: {
            blockerId,
            blockedId,
        },
    });
}

async function getBlockedUsers(userId)
{
    requireUserId(userId);
    const blocks = await prisma.userBlock.findMany({
        where: { blockerId: userId },
        include: {
            blocked: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return blocks.map((block) => ({
        ...serializeUser(block.blocked),
        blockedAt: block.createdAt.getTime(),
    }));
}

module.exports = {
    getBlockingRelationship,
    requireMessagingAllowed,
    blockUser,
    unblockUser,
    getBlockedUsers,
};
