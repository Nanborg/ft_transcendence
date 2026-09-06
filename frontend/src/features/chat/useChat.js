import { useEffect, useRef, useState } from "react";

const ROOM_HISTORY_LIMIT = 50;
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

function mergeChatMessages(...messageLists)
{
    const messagesByKey = new Map();

    messageLists.flat().forEach(message => {
        if (!message || typeof message !== "object")
            return;
        const key = Number.isInteger(message.id)
            ? `id:${message.id}`
            : [
                'legacy',
                message.timestamp,
                message.author?.id,
                message.message,
            ].join(':');
        messagesByKey.set(key, message);
    });
    return Array.from(messagesByKey.values()).sort((firstMessage, secondMessage) => {
        const timestampDifference = (Number(firstMessage.timestamp) || 0) - (Number(secondMessage.timestamp) || 0);
        if (timestampDifference !== 0)
            return timestampDifference;
        return (Number(firstMessage.id) || 0) - (Number(secondMessage.id) || 0);
    });
}

export function useChat(socket, currentUser, currentRoom, blockedUserIds = [])
{
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatError, setChatError] = useState('');
    const [liveMessageCount, setLiveMessageCount] = useState(0);
    const currentRoomIdRef = useRef(null);
    const blockedUserIdsRef = useRef(new Set());

    useEffect(() => {
        const nextRoomId = currentRoom?.id ?? null;

        if (currentRoomIdRef.current !== nextRoomId) {
            currentRoomIdRef.current = nextRoomId;
            setChatMessages([]);
            setChatInput('');
            setChatError('');
            setLiveMessageCount(0);
        }
    }, [currentRoom?.id]);

    useEffect(() => {
        const nextBlockedUserIds = new Set(
            blockedUserIds.map(userId => Number(userId)).filter(userId => Number.isInteger(userId))
        );
        blockedUserIdsRef.current = nextBlockedUserIds;
        setChatMessages(previousMessages => previousMessages.filter(message => !nextBlockedUserIds.has(Number(message.author?.id))));
    }, [blockedUserIds]);

    useEffect(() => {
        if (!socket)
            return undefined;

        function handleChatMessage(chatMessage)
        {
            if (!chatMessage || chatMessage.roomId !== currentRoomIdRef.current)
                return;
            if (blockedUserIdsRef.current.has(Number(chatMessage.author?.id)))
                return;
            setChatMessages(previousMessages =>
                mergeChatMessages(
                    previousMessages,
                    [chatMessage]
                )
            );
            setLiveMessageCount(previousCount => previousCount + 1);
        }

        function handleChatHistory(payload)
        {
            if (!payload || payload.scope !== 'room' || payload.roomId !== currentRoomIdRef.current || !Array.isArray(payload.messages))
                return;
            const visibleMessages = payload.messages.filter(message => !blockedUserIdsRef.current.has(Number(message.author?.id)));
            setChatMessages(previousMessages =>
                mergeChatMessages(
                    visibleMessages,
                    previousMessages
                )
            );
        }

        function handleChatError(error)
        {
            if (!error || typeof error.message !== 'string')
                return;

            setChatError(error.message);
        }

        socket.on('chat:message', handleChatMessage);
        socket.on('chat:history', handleChatHistory);
        socket.on('chat:error', handleChatError);

        return () => {
            socket.off('chat:message', handleChatMessage);
            socket.off('chat:history', handleChatHistory);
            socket.off('chat:error', handleChatError);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !currentUser || !currentRoom?.id)
            return undefined;

        function requestRoomChatHistory()
        {
            socket.emit('chat:history:request', {
                roomId: currentRoom.id,
                limit: ROOM_HISTORY_LIMIT,
            });
        }
        requestRoomChatHistory();
        socket.on('connect', requestRoomChatHistory);
        return () => {socket.off('connect', requestRoomChatHistory);};
    }, [socket, currentUser?.id, currentRoom?.id]);

    useEffect(() => {
        if (currentUser)
            return;

        currentRoomIdRef.current = null;
        setChatMessages([]);
        setChatInput('');
        setChatError('');
        setLiveMessageCount(0);
    }, [currentUser]);

    function sendChatMessage(event)
    {
        event?.preventDefault();
        if (!socket || !currentRoom?.id)
            return;
        const message = chatInput.trim();
        if (!message || message.length > MAX_CHAT_MESSAGE_LENGTH)
            return;
        setChatError('');
        socket.emit('chat:message', {
            roomId: currentRoom.id,
            message,
        });
        setChatInput('');
    }

    return {
        chatInput,
        setChatInput,
        chatMessages,
        chatError,
        liveMessageCount,
        sendChatMessage,
    };
}
