import { useEffect, useMemo, useRef, useState } from 'react';
import { MAX_CHAT_MESSAGE_LENGTH } from './useChat';

const DIRECT_HISTORY_LIMIT = 50;

function mergeDirectMessages(...messageLists)
{
    const messageById = new Map();

    messageLists.flat().forEach(message => {
        // SAFETY: Ignore malformed socket payloads.
        if (!message || typeof message !== 'object')
            return;

        // FALLBACK: Some invitation messages may lack ids.
        const key = Number.isInteger(message.id)
            ? `id:${message.id}`
            : [
                message.timestamp,
                message.author?.id,
                message.recipient?.id,
                message.message,
            ].join(':');

        messageById.set(key, message);
    });

    return Array.from(messageById.values()).sort(
        (firstMessage, secondMessage) => {
            // SYNC: Merge history and live messages in order.
            const timestampDifference =
                (Number(firstMessage.timestamp) || 0) -
                (Number(secondMessage.timestamp) || 0);

            if (timestampDifference !== 0)
                return timestampDifference;

            return (
                (Number(firstMessage.id) || 0) -
                (Number(secondMessage.id) || 0)
            );
        }
    );
}

function normalizeConversationUser(user)
{
    // SAFETY: Conversations require stable numeric ids.
    if (!user || !Number.isInteger(Number(user.id)))
        return null;

    return {
        id: Number(user.id),
        name: user.name || user.username || `User ${user.id}`,
        avatar: user.avatar || null,
    };
}

export function useDirectChat(socket, currentUser)
{
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [directMessages, setDirectMessages] = useState([]);
    const [directInput, setDirectInput] = useState('');
    const [directError, setDirectError] = useState('');
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [openRequestId, setOpenRequestId] = useState(0);
    const [invitations, setInvitations] = useState([]);
    const [unreadInvitationResponseCount, setUnreadInvitationResponseCount, ] = useState(0);

    const selectedUserIdRef = useRef(null);

    useEffect(() => {
        // SYNC: Handlers read the latest selected user.
        selectedUserIdRef.current = selectedUser?.id ?? null;
    }, [selectedUser?.id]);

    useEffect(() => {
        if (!socket || !currentUser?.id)
            return undefined;

        function requestDirectOverview()
        {
            // SYNC: Refresh all direct-chat side panels.
            socket.emit('chat:direct:conversations:request');
            socket.emit('chat:blocked:request');
            socket.emit('chat:invitation:list:request');
        }

        function handleDirectMessage(message)
        {
            // SAFETY: Ignore invalid direct payloads.
            if (!message || typeof message !== 'object')
                return;

            const currentUserId = Number(currentUser.id);
            const authorId = Number(message.author?.id);
            const recipientId = Number(message.recipient?.id);

            // SAFETY: Ignore messages not involving us.
            if (authorId !== currentUserId && recipientId !== currentUserId)
                return;
            const otherUserId = authorId === currentUserId
                ? recipientId
                : authorId;
            if (otherUserId === selectedUserIdRef.current)
            {
                // SYNC: Append live message to open thread.
                setDirectMessages(previousMessages =>
                    mergeDirectMessages(
                        previousMessages,
                        [message]
                    )
                );
                if (recipientId === currentUserId)
                    // SYNC: Mark visible incoming messages read.
                    socket.emit('chat:direct:read', { userId: otherUserId, });
            }
            // SYNC: Sidebar unread counts may change.
            socket.emit('chat:direct:conversations:request');
        }

        function handleDirectHistory(payload)
        {
            // SAFETY: Ignore history for another thread.
            if (!payload || Number(payload.userId) !== selectedUserIdRef.current || !Array.isArray(payload.messages))
                return;
            setDirectMessages(previousMessages =>
                mergeDirectMessages(
                    payload.messages,
                    previousMessages
                )
            );
        }

        function handleConversations(payload)
        {
            // SAFETY: Ignore invalid conversation lists.
            if (!payload || !Array.isArray(payload.conversations))
                return;
            setConversations(payload.conversations);
        }

        function handleBlockedUsers(payload)
        {
            // SAFETY: Ignore invalid block lists.
            if (!payload || !Array.isArray(payload.users))
                return;
            setBlockedUsers(payload.users);
        }

        function handleBlockUpdate()
        {
            // SYNC: Blocking affects lists and visibility.
            socket.emit('chat:blocked:request');
            socket.emit('chat:direct:conversations:request');
        }

        function handleInvitationList(payload)
        {
            // SAFETY: Ignore invalid invitation lists.
            if (!payload || !Array.isArray(payload.invitations))
                return;
            setInvitations(payload.invitations);
        }

        function handleInvitationUpdate(payload)
        {
            const invitationMessage = payload?.invitation;
            const invitation = invitationMessage?.invitation;
            // SAFETY: Invitation updates need a stable id.
            if (!invitationMessage || typeof invitationMessage !== 'object' || !invitation || !Number.isInteger(Number(invitation.id)))
                return;
            const currentUserId = Number(currentUser.id);
            const authorId = Number(invitationMessage.author?.id);
            const recipientId = Number(invitationMessage.recipient?.id);
            const isSender = authorId === currentUserId;
            const isRecipient = recipientId === currentUserId;
            setInvitations(previousInvitations => {
                const remainingInvitations =
                    previousInvitations.filter(
                        message => Number(message.invitation?.id) !==
                        Number(invitation.id)
                    );
                if (invitation.status === 'PENDING' && (isSender || isRecipient))
                    // SYNC: Keep pending invites visible.
                    return mergeDirectMessages(remainingInvitations, [invitationMessage]);
                if (isSender)
                    // SYNC: Sender sees final response.
                    return mergeDirectMessages(remainingInvitations, [invitationMessage]);
                return remainingInvitations;
            });
            if (isSender && invitation.status !== 'PENDING')
                // SYNC: Badge counts unseen responses.
                setUnreadInvitationResponseCount(previousCount => previousCount + 1);
            const otherUserId = isSender
                ? recipientId
                : authorId;
            if (otherUserId === selectedUserIdRef.current) {
                // SYNC: Open thread shows invite status.
                setDirectMessages(previousMessages =>
                    mergeDirectMessages(previousMessages, [invitationMessage])
                );
            }
            socket.emit('chat:direct:conversations:request');
            if (invitation.status === 'ACCEPTED' && isRecipient && payload.room?.id)
                // DECISION: Accepted invite opens the room page.
                window.location.hash = '#/room';
        }

        function handleChatError(error)
        {
            // SAFETY: Only direct-chat errors update this panel.
            if (!error || typeof error.event !== 'string' || typeof error.message !== 'string')
                return;
            const isDirectChatError =
                error.event.startsWith('chat:direct:') ||
                error.event.startsWith('chat:invitation') ||
                error.event === 'chat:block' ||
                error.event === 'chat:unblock' ||
                error.event === 'chat:blocked:request';
            if (isDirectChatError)
                setDirectError(error.message);
        }

        function handleDirectRead(payload)
        {
            // SAFETY: Ignore invalid read receipts.
            if (!payload || !Number.isInteger(Number(payload.readerId)))
                return;
            socket.emit('chat:direct:conversations:request');
            // SAFETY: Only update the open thread.
            if (Number(payload.otherUserId) !== Number(currentUser.id) || Number(payload.readerId) !== selectedUserIdRef.current || !payload.readAt)
                return;
            setDirectMessages(previousMessages =>
                previousMessages.map(message => {
                    const messageId = Number(message.id);
                    const upToMessageId = Number(payload.upToMessageId);
                    if (
                        Number(message.author?.id) === Number(currentUser.id) &&
                        messageId <= upToMessageId
                    )
                    {
                        // SYNC: Mark sent messages read.
                        return {
                            ...message,
                            readAt: payload.readAt,
                        };
                    }
                    return message;
                })
            );
        }

        socket.on('chat:direct:message', handleDirectMessage);
        socket.on('chat:direct:history', handleDirectHistory);
        socket.on('chat:direct:conversations', handleConversations);
        socket.on('chat:direct:read', handleDirectRead);
        socket.on('chat:blocked', handleBlockedUsers);
        socket.on('chat:block:update', handleBlockUpdate);
        socket.on('chat:invitation:list', handleInvitationList);
        socket.on('chat:invitation:update', handleInvitationUpdate);
        socket.on('chat:error', handleChatError);
        socket.on('connect', requestDirectOverview);

        requestDirectOverview();
        return () => {
            socket.off('chat:direct:message', handleDirectMessage);
            socket.off('chat:direct:history', handleDirectHistory);
            socket.off('chat:direct:conversations', handleConversations);
            socket.off('chat:direct:read', handleDirectRead);
            socket.off('chat:blocked', handleBlockedUsers);
            socket.off('chat:block:update', handleBlockUpdate);
            socket.off('chat:invitation:list', handleInvitationList);
            socket.off('chat:invitation:update', handleInvitationUpdate);
            socket.off('chat:error', handleChatError);
            socket.off('connect', requestDirectOverview);
        };
    }, [socket, currentUser?.id]);

    useEffect(() => {
        if (currentUser)
            return;
        // SAFETY: Logout clears direct-chat state.
        selectedUserIdRef.current = null;
        setConversations([]);
        setSelectedUser(null);
        setDirectMessages([]);
        setInvitations([]);
        setDirectInput('');
        setDirectError('');
        setBlockedUsers([]);
        setUnreadInvitationResponseCount(0);
    }, [currentUser]);

    function refreshDirectOverview()
    {
        // SAFETY: Avoid socket calls when logged out.
        if (!socket || !currentUser?.id)
            return;
        socket.emit('chat:direct:conversations:request');
        socket.emit('chat:blocked:request');
        socket.emit('chat:invitation:list:request');
    }

    function openConversation(user)
    {
        const normalizedUser = normalizeConversationUser(user);

        // SAFETY: Only open valid conversations.
        if (!socket || !normalizedUser)
            return;
        selectedUserIdRef.current = normalizedUser.id;
        setSelectedUser(normalizedUser);
        setDirectMessages([]);
        setDirectInput('');
        setDirectError('');
        setOpenRequestId(previousId => previousId + 1);
        socket.emit('chat:direct:history:request', {
            userId: normalizedUser.id,
            limit: DIRECT_HISTORY_LIMIT,
        });
        // SYNC: Opening a thread marks it read.
        socket.emit('chat:direct:read', { userId: normalizedUser.id, });
    }

    function closeConversation()
    {
        // SYNC: Closing clears thread state.
        selectedUserIdRef.current = null;
        setSelectedUser(null);
        setDirectMessages([]);
        setDirectInput('');
        setDirectError('');
    }

    function sendDirectMessage(event)
    {
        event?.preventDefault();

        // SAFETY: Do not send without a recipient.
        if (!socket || !selectedUser)
            return;
        const message = directInput.trim();
        // REQUIRED: Backend enforces the same limit.
        if (!message || message.length > MAX_CHAT_MESSAGE_LENGTH)
            return;
        setDirectError('');
        socket.emit('chat:direct:message', {
            recipientId: selectedUser.id,
            message,
        });
        setDirectInput('');
    }

    function blockSelectedUser()
    {
        // SAFETY: Blocking needs an open conversation.
        if (!socket || !selectedUser)
            return;
        setDirectError('');
        socket.emit('chat:block', {
            userId: selectedUser.id,
        });
    }

    function unblockSelectedUser()
    {
        // SAFETY: Unblocking needs an open conversation.
        if (!socket || !selectedUser)
            return;
        setDirectError('');
        socket.emit('chat:unblock', {
            userId: selectedUser.id,
        });
    }

    function markInvitationResponsesSeen()
    {
        // SYNC: User opened the response indicator.
        setUnreadInvitationResponseCount(0);
    }

    function sendGameInvitation(roomId, recipientId = selectedUser?.id)
    {
        const normalizedRecipientId = Number(recipientId);
        // SAFETY: Invitations require valid users.
        if (!socket || !Number.isInteger(normalizedRecipientId) || normalizedRecipientId <= 0)
            return;
        setDirectError('');
        socket.emit('chat:invitation:send', {
            recipientId: normalizedRecipientId,
            roomId,
        });
    }

    function respondToInvitation(invitationId, response)
    {
        // SAFETY: Socket owns invitation state.
        if (!socket)
            return;
        setDirectError('');
        socket.emit('chat:invitation:respond', {
            invitationId,
            response,
        });
    }

    const blockedUserIds = useMemo(() => blockedUsers.map(user => Number(user.id)), [blockedUsers]);

    return {
        conversations,
        selectedUser,
        directMessages,
        directInput,
        setDirectInput,
        directError,
        blockedUsers,
        blockedUserIds,
        invitations,
        refreshDirectOverview,
        isSelectedUserBlocked: selectedUser
            ? blockedUserIds.includes(selectedUser.id)
            : false,
        openConversation,
        openRequestId,
        closeConversation,
        sendDirectMessage,
        sendGameInvitation,
        respondToInvitation,
        blockSelectedUser,
        unblockSelectedUser,
        unreadInvitationResponseCount,
        markInvitationResponsesSeen,
    };
}
