import { useEffect, useState } from 'react'

/*
function getPlayerName(currentUser) {
    return currentUser?.username || currentUser?.email || 'Player';
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
    const [latestGameState, setLatestGameState] = useState(null);
    const [gameEntities, setGameEntities] = useState([]);
    const [gameResult, setGameResult] = useState(null);
    const [gameError, setGameError] = useState('');
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
        //Nanborg
        // TODO(nanborg): Keep game:state as the server-authoritative state
        // after game:start; GamePage should render it instead of mockGameState.
        // TODO(nanborg): Listen to game:end and store the final result for the
        // post-game screen.
        function handleGameStart(gameStartPayload) {
            setGameStarted(true);
            setGameStartInfo(gameStartPayload);
            setLatestGameState(null);
            setGameEntities([]);
            setGameError('');
            setGameResult(null);
            setRoomStatus('started');
            setRoomError('');
            window.location.hash = '#/game';
        }

        function handleEntityUpdate(entityUpdatePayload) {
            if (
                !entityUpdatePayload ||
                typeof entityUpdatePayload.roomId !== 'string' ||
                typeof entityUpdatePayload.entity !== 'object' ||
                entityUpdatePayload.entity === null ||
                typeof entityUpdatePayload.entity.entityId !== 'number'
            ) {
                console.error('Invalid game:entity:update payload', entityUpdatePayload);
                return;
            }
            const updatedEntity = entityUpdatePayload.entity;
            setGameEntities(previousEntities => {
                const entityAlreadyExists = previousEntities.some(
                    entity => entity.entityId === updatedEntity.entityId
                );
                if (!entityAlreadyExists)
                    return [...previousEntities, updatedEntity];
                return previousEntities.map(entity =>
                    entity.entityId === updatedEntity.entityId ? updatedEntity : entity
                );
            });
        }

        function handleEntityDelete(entityDeletePayload)
        {
            if (
                !entityDeletePayload ||
                typeof entityDeletePayload.roomId !== 'string' ||
                typeof entityDeletePayload.entity !== 'object' ||
                entityDeletePayload.entity === null ||
                typeof entityDeletePayload.entity.entityId !== 'number'
            ) {
                console.error("Invalid game:entity:delete payload", entityDeletePayload);
                return;
            }
            const deletedEntityId = entityDeletePayload.entity.entityId;
            setGameEntities(previousEntities =>
                previousEntities.filter(
                    entity => entity.entityId !== deletedEntityId
                )
            );
        }

        function handleGameState(gameStatePayload) {
            if (!gameStatePayload || typeof gameStatePayload.state !== 'object' || gameStatePayload.state === null)
            {
                console.error("Invalid game:state payload:", gameStatePayload);
                return;
            }
            setGameEntities([]);
            setLatestGameState(gameStatePayload.state);
        }

        function handleGameError(gameErrorPayload) {
            if (!gameErrorPayload || typeof gameErrorPayload.message !== 'string')
            {
                console.error('Invalid game:error payload:', gameErrorPayload);
                return;
            }
            setGameStarted(false);
            setGameError(gameErrorPayload.message);
            setRoomStatus('error');
        }

        function handleRoomRemoved() {
            resetRoom();
            setRoomError('Room no longer exists.');
            window.location.hash = '#/room';
        }

        function handleGameEnd(gameEndPayload) {
            if (!gameEndPayload || typeof gameEndPayload.roomId !== 'string' || typeof gameEndPayload.reason !== 'string')
            {
                console.error("Invalid game:end payload:", gameEndPayload);
                return;
            }
            setGameStarted(false);
            setGameStartInfo(null);
            setGameResult(gameEndPayload);
            setRoomStatus('finished');
            setRoomError('');
        }

        socket.on('room:created', handleRoomCreated);
        socket.on('room:update', handleRoomUpdate);
        socket.on('room:error', handleRoomError);
        socket.on('chat:message', handleChatMessage);
        socket.on('game:start', handleGameStart);
        socket.on('game:entity:update', handleEntityUpdate);
        socket.on('game:entity:delete', handleEntityDelete);
        socket.on('game:state', handleGameState);
        socket.on('game:end', handleGameEnd);
        socket.on('game:error', handleGameError);
        socket.on('room:removed', handleRoomRemoved);

        return () => {
            socket.off('room:created', handleRoomCreated);
            socket.off('room:update', handleRoomUpdate);
            socket.off('room:error', handleRoomError);
            socket.off('chat:message', handleChatMessage);
            socket.off('game:start', handleGameStart);
            socket.off('game:entity:update', handleEntityUpdate);
            socket.off('game:entity:delete', handleEntityDelete);
            socket.off('game:state', handleGameState);
            socket.off('game:end', handleGameEnd);
            socket.off('game:error', handleGameError);
            socket.off('room:removed', handleRoomRemoved);
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
        setLatestGameState(null);
        setGameError('');
        setGameEntities([]);
        setGameResult(null);
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

    function leaveGame() {
        if (!socket || !currentRoom)
            return;
        socket.emit('room:leave', {roomId: currentRoom.id});
        resetRoom();
        window.location.hash = '#/lobby';
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
        latestGameState,
        gameStarted,
        roomNameInput,
        setRoomNameInput,
        gameResult,
        gameEntities,
        gameError,
        leaveGame,
    };
}
