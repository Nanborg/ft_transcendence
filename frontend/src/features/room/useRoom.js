import { useEffect, useState } from 'react'

/*
function getPlayerName(currentUser) {
    return currentUser?.name || currentUser?.email || 'Player';
}*/


export function useRoom(socket, currentUser) {
    const [roomIdInput, setRoomIdInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomStatus, setRoomStatus] = useState('idle');
    const [roomError, setRoomError] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameStartInfo, setGameStartInfo] = useState(null);
    const [roomNameInput, setRoomNameInput] = useState('');

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        function handleRoomCreated(room) {
            setCurrentRoom(room);
            setRoomStatus('joined');
            setRoomError('');
        }

        function handleRoomUpdate(room) {
            setCurrentRoom(room);
            setRoomStatus('joined');
            setRoomError('');
        }

        function handleRoomError(error) {
            setRoomStatus('error');
            setRoomError(error.message);
        }

        function handleChatMessage(chatMessage) {
            setChatMessages(previousMessages => [
                ...previousMessages,
                chatMessage,
            ]);
        }

        function handleGameStart(gameStartPayload) {
            setGameStarted(true);
            setGameStartInfo(gameStartPayload);
            setRoomStatus('started');
            setRoomError('');
        }

        socket.on('room:created', handleRoomCreated);
        socket.on('room:update', handleRoomUpdate);
        socket.on('room:error', handleRoomError);
        socket.on('chat:message', handleChatMessage);
        socket.on('game:start', handleGameStart);

        return () => {
            socket.off('room:created', handleRoomCreated);
            socket.off('room:update', handleRoomUpdate);
            socket.off('room:error', handleRoomError);
            socket.off('chat:message', handleChatMessage);
            socket.off('game:start', handleGameStart);
        };
    }, [socket]);

    useEffect(() => {
        if (!currentUser) {
            resetRoom();
        }
    }, [currentUser]);

    function createRoom(event) {
        event.preventDefault();
        if (!socket || !currentUser) {
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('room:create', {
            /*playerName: getPlayerName(currentUser),*/
            roomName: roomNameInput.trim() || undefined,
        });
    }

    function joinRoom(event) {
        event.preventDefault();

        if (!socket || !currentUser) {
            return;
        }
        const roomId = roomIdInput.trim();
        if (!roomId) {
            setRoomStatus('error');
            setRoomError('Enter the room id');
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('room:join', {
            roomId,
            /*playerName: getPlayerName(currentUser),*/
        });
    }

    function resetRoom() {
        setCurrentRoom(null);
        setRoomStatus('idle');
        setRoomError('');
        setRoomIdInput('');
        setRoomNameInput('');
        setChatMessages([]);
        setChatInput('');
        setGameStarted(false);
        setGameStartInfo(null);
    }

    function leaveRoom() {
        if (!socket || !currentRoom) {
            return;
        }

        socket.emit('room:leave', {
            roomId: currentRoom.id,
        });
        resetRoom();
    }

    function toggleReady() {
        if (!socket || !currentRoom) {
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('player:ready', {
            roomId: currentRoom.id,
        });
    }

    function sendChatMessage(event) {
        event.preventDefault();
        if (!socket || !currentRoom) {
            return;
        }
        const message = chatInput.trim();
        if (!message) {
            return;
        }
        socket.emit('chat:message', {
            roomId: currentRoom.id,
            message,
        });
        setChatInput('');
    }

    function startGame() {
        if (!socket || !currentRoom) {
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('game:start', {
            roomId: currentRoom.id,
        });
    }


    return {
        roomIdInput,
        setRoomIdInput,
        currentRoom,
        roomStatus,
        roomError,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        chatInput,
        setChatInput,
        chatMessages,
        sendChatMessage,
        startGame,
        gameStartInfo,
        gameStarted,
        roomNameInput,
        setRoomNameInput,
    };
}