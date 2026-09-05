import { useEffect, useMemo, useRef, useState } from 'react';
import { MAX_CHAT_MESSAGE_LENGTH } from './useChat';

const DIRECT_HISTORY_LIMIT = 50;

function mergeDirectMessages(...messageLists)
{
    const messageById = new Map();

    messageLists.flat().forEach(message => {
        if (!message || typeof message !== 'object')
            return;

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

    const selectedUserIdRef = useRef(null);

    useEffect(() => {
        selectedUserIdRef.current = selectedUser?.id ?? null;
    }, [selectedUser?.id]);

    useEffect(() => {
        if (!socket || !currentUser?.id)
            return undefined;

        function requestDirectOverview()
        {
            socket.emit('chat:direct:conversations:request');
            socket.emit('chat:blocked:request');
        }

        function handleDirectMessage(message)
        {
            if (!message || typeof message !== 'object')
                return;

            const currentUserId = Number(currentUser.id);
            const authorId = Number(message.author?.id);
            const recipientId = Number(message.recipient?.id);

            if (authorId !== currentUserId && recipientId !== currentUserId)
                return;
            const otherUserId = authorId === currentUserId
                ? recipientId
                : authorId;
            if (otherUserId === selectedUserIdRef.current)
            {
                setDirectMessages(previousMessages =>
                    mergeDirectMessages(
                        previousMessages,
                        [message]
                    )
                );
                if (recipientId === currentUserId)
                    socket.emit('chat:direct:read', { userId: otherUserId, });
            }
            socket.emit('chat:direct:conversations:request');
        }

        function handleDirectHistory(payload)
        {
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
            if (!payload || !Array.isArray(payload.conversations))
                return;
            setConversations(payload.conversations);
        }

        function handleBlockedUsers(payload)
        {
            if (!payload || !Array.isArray(payload.users))
                return;
            setBlockedUsers(payload.users);
        }

        function handleBlockUpdate()
        {
            socket.emit('chat:blocked:request');
            socket.emit('chat:direct:conversations:request');
        }

        function handleChatError(error)
        {
            if (!error || typeof error.event !== 'string' || typeof error.message !== 'string')
                return;
            const isDirectChatError =
                error.event.startsWith('chat:direct:') ||
                error.event === 'chat:block' ||
                error.event === 'chat:unblock' ||
                error.event === 'chat:blocked:request';
            if (isDirectChatError)
                setDirectError(error.message);
        }

        function handleDirectRead(payload)
        {
            if (!payload || !Number.isInteger(Number(payload.readerId)))
                return;
            socket.emit('chat:direct:conversations:request');
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
        socket.on(
            'chat:direct:conversations',
            handleConversations
        );
        socket.on('chat:direct:read', handleDirectRead);
        socket.on('chat:blocked', handleBlockedUsers);
        socket.on('chat:block:update', handleBlockUpdate);
        socket.on('chat:error', handleChatError);
        socket.on('connect', requestDirectOverview);

        requestDirectOverview();
        return () => {
            socket.off('chat:direct:message', handleDirectMessage);
            socket.off('chat:direct:history', handleDirectHistory);
            socket.off(
                'chat:direct:conversations',
                handleConversations
            );
            socket.off('chat:direct:read', handleDirectRead);
            socket.off('chat:blocked', handleBlockedUsers);
            socket.off('chat:block:update', handleBlockUpdate);
            socket.off('chat:error', handleChatError);
            socket.off('connect', requestDirectOverview);
        };
    }, [socket, currentUser?.id]);

    useEffect(() => {
        if (currentUser)
            return;
        selectedUserIdRef.current = null;
        setConversations([]);
        setSelectedUser(null);
        setDirectMessages([]);
        setDirectInput('');
        setDirectError('');
        setBlockedUsers([]);
    }, [currentUser]);

    function openConversation(user)
    {
        const normalizedUser = normalizeConversationUser(user);

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
        socket.emit('chat:direct:read', { userId: normalizedUser.id, });
    }

    function closeConversation()
    {
        selectedUserIdRef.current = null;
        setSelectedUser(null);
        setDirectMessages([]);
        setDirectInput('');
        setDirectError('');
    }

    function sendDirectMessage(event)
    {
        event?.preventDefault();

        if (!socket || !selectedUser)
            return;
        const message = directInput.trim();
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
        if (!socket || !selectedUser)
            return;
        setDirectError('');
        socket.emit('chat:block', {
            userId: selectedUser.id,
        });
    }

    function unblockSelectedUser()
    {
        if (!socket || !selectedUser)
            return;
        setDirectError('');
        socket.emit('chat:unblock', {
            userId: selectedUser.id,
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
        isSelectedUserBlocked: selectedUser
            ? blockedUserIds.includes(selectedUser.id)
            : false,
        openConversation,
        openRequestId,
        closeConversation,
        sendDirectMessage,
        blockSelectedUser,
        unblockSelectedUser,
    };
}