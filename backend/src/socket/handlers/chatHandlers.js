const { cleanInput } = require('../../services/sanitize');
const
{
	ChatServiceError,
	createRoomMessage,
	createDirectMessage,
	getRoomHistory,
	getDirectHistory,
	getDirectConversations,
	blockUser,
	unblockUser,
	getBlockedUsers,
	markDirectMessagesRead,
	createGameInvitation,
	getPendingGameInvitation,
	getPendingGameInvitations,
	respondToGameInvitation
} = require('../../services/chatService');

const { joinRoom } = require('../rooms');
const { getUserSocketRoom, emitChatError } = require('../socketUtils');

function getHistoryRoomId(payload)
{
	// FALLBACK: History response still names room
	if (typeof payload.roomId === 'string')
		return payload.roomId.trim();
	return '';
}

function getCleanContent(rawMessage)
{
	// SAFETY: Sanitize chat before service layer
	if (typeof rawMessage === 'string')
		return cleanInput(rawMessage.trim());
	return rawMessage;
}

function getInvitationResponse(payload)
{
	// REQUIRED: Service expects uppercase response
	if (typeof payload?.response === 'string')
		return payload.response.trim().toUpperCase();
	return '';
}

function registerChatHandlers(io, socket)
{
	// WHY: Register all chat events for one socket
	socket.on('chat:message', async (payload = {}) =>
	{
		try
		{
			// SAFETY: Service validates room membership
			const rawMessage = payload?.message;
			const content = getCleanContent(rawMessage);
			const chatMessage = await createRoomMessage(
			{
				roomId: payload?.roomId,
				senderId: socket.user.id,
				content,
			});
			io.to(chatMessage.roomId).emit('chat:message', chatMessage);

		} catch (error) {
			// SAFETY: Normalize service errors for client
			emitChatError(socket, 'chat:message', error);
		}
	});

	socket.on('chat:history:request', async (payload = {}) =>
	{
		try
		{
			// REQUIRED: History is scoped to current user
			const messages = await getRoomHistory(
			{
				roomId: payload.roomId,
				userId: socket.user.id,
				beforeId: payload.beforeId,
				limit: payload.limit,
			});
			socket.emit('chat:history',
			{
				scope: 'room',
				roomId: getHistoryRoomId(payload),
				messages,
			});

		} catch (error) {
			emitChatError(socket, 'chat:history:request', error);
		}
	});

	socket.on('chat:direct:conversations:request', async () =>
	{
		try
		{
			// SYNC: Sidebar needs latest conversations
			const conversations = await getDirectConversations(socket.user.id);
			socket.emit('chat:direct:conversations', { conversations });

		} catch (error) {
			emitChatError(socket, 'chat:direct:conversations:request', error);
		}
	});

	socket.on('chat:invitation:send', async (payload = {}) =>
	{
		try
		{
			// REQUIRED: Invitation is stored as chat message
			const invitationMessage = await createGameInvitation(
			{
				senderId: socket.user.id,
				recipientId: Number(payload?.recipientId),
				roomId: payload?.roomId,
			});
			io.to(getUserSocketRoom(socket.user.id))
				.to(getUserSocketRoom(invitationMessage.recipient.id))
				// SYNC: Both users see invitation immediately
				.emit('chat:direct:message', invitationMessage);
			io.to(getUserSocketRoom(socket.user.id))
				.to(getUserSocketRoom(invitationMessage.recipient.id))
				.emit('chat:invitation:update', { invitation: invitationMessage });
		} catch (error) {
			emitChatError(socket, 'chat:invitation:send', error);
		}
	});

	socket.on('chat:invitation:list:request', async () =>
	{
		try
		{
			// SYNC: Expired invites are filtered in service
			const invitations = await getPendingGameInvitations(socket.user.id);
			socket.emit('chat:invitation:list', { invitations });

		} catch (error) {
			emitChatError(socket, 'chat:invitation:list:request', error);
		}
	});

	socket.on('chat:invitation:respond', async (payload = {}) =>
	{
		try
		{
			// Flow:
			//   1. Validate pending invite
			//   2. Join room if accepted
			//   3. Store invite response
			//   4. Notify both users
			const invitationId = Number(payload?.invitationId);
			const response = getInvitationResponse(payload);
			const pendingInvitation = await getPendingGameInvitation(
			{
				invitationId,
				recipientId: socket.user.id,
			});
			let joinedRoom = null;
			if (response === 'ACCEPTED')
			{
				// REQUIRED: Accepting invite joins target room
				const joinResult = await joinRoom(pendingInvitation.roomId, socket.user.id);
				if (joinResult.error)
					throw new ChatServiceError(joinResult.error.code, joinResult.error.message);
				joinedRoom = joinResult.room;
			}
			const invitationMessage = await respondToGameInvitation(
			{
				invitationId,
				recipientId: socket.user.id,
				response,
			});
			if (joinedRoom)
			{
				// SYNC: Socket joins room after DB membership
				await socket.join(joinedRoom.id);
				io.to(joinedRoom.id).emit('room:update', joinedRoom);
			}
			const updatePayload =
			{
				invitation: invitationMessage,
				room: joinedRoom,
			};
			io.to(getUserSocketRoom(socket.user.id))
				.emit('chat:invitation:update', updatePayload);
			if (pendingInvitation.senderId)
			{
				io.to(getUserSocketRoom(pendingInvitation.senderId))
					.emit('chat:invitation:update', updatePayload);
			}

		} catch (error) {
			emitChatError(socket, 'chat:invitation:respond', error);
		}
	});

	socket.on('chat:direct:message', async (payload = {}) =>
	{
		try
		{
			// SAFETY: Service checks block status
			const rawMessage = payload?.message;
			const content = getCleanContent(rawMessage);
			const chatMessage = await createDirectMessage(
			{
				senderId: socket.user.id,
				recipientId: Number(payload?.recipientId),
				content,
			});
			io.to(getUserSocketRoom(socket.user.id))
				.to(getUserSocketRoom(chatMessage.recipient.id))
				.emit('chat:direct:message', chatMessage);

		} catch (error) {
			emitChatError(socket, 'chat:direct:message', error);
		}
	});

	socket.on('chat:direct:history:request', async (payload = {}) =>
	{
		try
		{
			// REQUIRED: Client chooses the other user
			const otherUserId = Number(payload?.userId);
			const messages = await getDirectHistory(
			{
				userId: socket.user.id,
				otherUserId,
				beforeId: payload?.beforeId,
				limit: payload?.limit,
			});
			socket.emit('chat:direct:history',
			{
				userId: otherUserId,
				messages,
			});

		} catch (error) {
			emitChatError(socket, 'chat:direct:history:request', error);
		}
	});

	socket.on('chat:direct:read', async (payload = {}) =>
	{
		try
		{
			// SYNC: Read receipts notify both users
			const otherUserId = Number(payload?.userId);
			const result = await markDirectMessagesRead({ userId: socket.user.id, otherUserId });
			const readUpdate = { readerId: socket.user.id, otherUserId, ...result };
			io.to(getUserSocketRoom(socket.user.id))
				.to(getUserSocketRoom(otherUserId))
				.emit('chat:direct:read', readUpdate);

		} catch (error) {
			emitChatError(socket, 'chat:direct:read', error);
		}
	});

	socket.on('chat:block', async (payload = {}) =>
	{
		try
		{
			// SAFETY: Block relation is user-scoped
			const blockedId = Number(payload?.userId);
			await blockUser({ blockerId: socket.user.id, blockedId });
			socket.emit('chat:block:update', { userId: blockedId, blocked: true });

		} catch (error) {
			emitChatError(socket, 'chat:block', error);
		}
	});

	socket.on('chat:unblock', async (payload = {}) =>
	{
		try
		{
			// SYNC: Unblock refreshes client visibility
			const blockedId = Number(payload?.userId);
			await unblockUser({ blockerId: socket.user.id, blockedId });
			socket.emit('chat:block:update', { userId: blockedId, blocked: false });

		} catch (error) {
			emitChatError(socket, 'chat:unblock', error);
		}
	});

	socket.on('chat:blocked:request', async () =>
	{
		try
		{
			// SYNC: Client filters blocked authors locally
			const users = await getBlockedUsers(socket.user.id);
			socket.emit('chat:blocked', { users });

		} catch (error) {
			emitChatError(socket, 'chat:blocked:request', error);
		}
	});
}

module.exports = { registerChatHandlers };
