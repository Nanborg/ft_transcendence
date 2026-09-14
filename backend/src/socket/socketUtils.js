const { ChatServiceError } = require('../services/chatService');

function getUserSocketRoom(userId)
{
	// DECISION: Personal room targets one user socket.
	return `user:${userId}`;
}

function emitChatError(socket, event, error)
{
	// SAFETY: Expected errors can be shown to client.
	const isExpectedError = error instanceof ChatServiceError;
	let code = 'CHAT_INTERNAL_ERROR';
	let message = 'Unable to process chat request';

	if (isExpectedError)
	{
		// SYNC: Service code becomes socket error code.
		code = error.code;
		message = error.message;
	}
	if (!isExpectedError)
		// DEBUG: Unexpected errors stay server-side.
		console.error(`Unable to process ${event}:`, error);
	socket.emit('chat:error', { event, code, message, });
}

function normalizeEngineEntity(entity)
{
	// FALLBACK: Engine may send old entityTypeId field.
	const normalizedEntity = {...entity,};
	if (typeof normalizedEntity.typeId !== 'number' && typeof normalizedEntity.entityTypeId === 'number')
		normalizedEntity.typeId = normalizedEntity.entityTypeId;
	delete normalizedEntity.entityTypeId;
	return (normalizedEntity);
}

module.exports = { getUserSocketRoom, emitChatError, normalizeEngineEntity, };
