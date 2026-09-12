const { ChatServiceError } = require('../services/chatService');

function getUserSocketRoom(userId)
{
    return `user:${userId}`;
}

function emitChatError(socket, event, error)
{
    const isExpectedError = error instanceof ChatServiceError;
    let code = 'CHAT_INTERNAL_ERROR';
    let message = 'Unable to process chat request';

    if (isExpectedError)
    {
        code = error.code;
        message = error.message;
    }
    if (!isExpectedError)
        console.error(`Unable to process ${event}:`, error);
    socket.emit('chat:error', {
        event,
        code,
        message,
    });
}

function normalizeEngineEntity(entity)
{
    const normalizedEntity = {
        ...entity,
    };
    if (typeof normalizedEntity.typeId !== 'number' && typeof normalizedEntity.entityTypeId === 'number')
        normalizedEntity.typeId = normalizedEntity.entityTypeId;
    delete normalizedEntity.entityTypeId;
    return normalizedEntity;
}

module.exports = {
    getUserSocketRoom,
    emitChatError,
    normalizeEngineEntity,
};
