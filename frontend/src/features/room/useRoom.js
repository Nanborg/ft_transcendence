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
    // const [latestGameState, setLatestGameState] = useState(null);
    const [gameEntities, setGameEntities] = useState([]);
    const [gameResult, setGameResult] = useState(null);
    const [gameError, setGameError] = useState('');
    const [roomNameInput, setRoomNameInput] = useState('');
    const [gamePlayerData, setGamePlayerData] = useState([]);
    const [gameStartedAt, setGameStartedAt] = useState(null);

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
            // setLatestGameState(null);
            setGameEntities([]);
            setGamePlayerData([]);
            setGameStartedAt(null);
            setGameError('');
            setGameResult(null);
            setRoomStatus('started');
            setRoomError('');
            window.location.hash = '#/game';
        }

        function handleGameStateInit(gameStateInitPayload)
        {
            if (
                !gameStateInitPayload ||
                typeof gameStateInitPayload.roomId !== 'string' ||
                typeof gameStateInitPayload.tick !== 'number' ||
                typeof gameStateInitPayload.serverStartedAt !== 'number' ||
                !Array.isArray(gameStateInitPayload.entities) ||
                !Array.isArray(gameStateInitPayload.playerData)
            ) {
                console.error('Invalid game:state:init payload:', gameStateInitPayload);
                return;
            }
            setGameStarted(true);
            setGameEntities(gameStateInitPayload.entities);
            setGamePlayerData(gameStateInitPayload.playerData);
            setGameStartedAt(gameStateInitPayload.serverStartedAt);
            // setLatestGameState(null);
            setGameError('');
            setGameResult(null);
            setRoomStatus('started');
            setRoomError('');
            window.location.hash = '#/game';
        }

        function handleGameStateUpdate(gameStateUpdatePayload)
        {
            if (
                !gameStateUpdatePayload ||
                typeof gameStateUpdatePayload.roomId !== 'string' ||
                !Array.isArray(gameStateUpdatePayload.entityUpdate) ||
                !Array.isArray(gameStateUpdatePayload.entityDelete) ||
                !Array.isArray(gameStateUpdatePayload.playerData)
            ) {
                console.error('Invalid game:state:update payload:', gameStateUpdatePayload);
                return;
            }

            setGameEntities(previousEntities => {
                const updateEntities = new Map(
                    previousEntities.map(entity => [
                        entity.entityId,
                        entity,
                    ])
                );
                gameStateUpdatePayload.entityUpdate.forEach(entity => {
                    if (entity && typeof entity.entityId === 'number')
                        updateEntities.set(entity.entityId, entity);
                });
                gameStateUpdatePayload.entityDelete.forEach(entity => {
                    if (entity && typeof entity.entityId === 'number')
                        updateEntities.delete(entity.entityId);
                });
                return Array.from(updateEntities.values());
            });
            setGamePlayerData(gameStateUpdatePayload.playerData);
        }

        // function handleGameState(gameStatePayload) {
        //     if (!gameStatePayload || typeof gameStatePayload.state !== 'object' || gameStatePayload.state === null)
        //     {
        //         console.error("Invalid game:state payload:", gameStatePayload);
        //         return;
        //     }
        //     setGameEntities([]);
        //     setLatestGameState(gameStatePayload.state);
        // }

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
            if (!gameEndPayload || typeof gameEndPayload.roomId !== 'string' || typeof gameEndPayload.tick !== 'number' ||
                typeof gameEndPayload.durationSeconds !== 'number' || gameEndPayload.end !== true || typeof gameEndPayload.win !== 'boolean' ||
                typeof gameEndPayload.reason !== 'string' || !Array.isArray(gameEndPayload.entities) || !Array.isArray(gameEndPayload.playerData))
            {
                console.error("Invalid game:end payload:", gameEndPayload);
                return;
            }
            setGameStarted(false);
            setGameStartInfo(null);
            // setLatestGameState(null);
            setGameEntities(gameEndPayload.entities);
            setGamePlayerData(gameEndPayload.playerData);
            setGameStartedAt(null);
            setGameResult(gameEndPayload);
            setGameError('');
            setRoomStatus('finished');
            setRoomError('');
        }

        socket.on('room:created', handleRoomCreated);
        socket.on('room:update', handleRoomUpdate);
        socket.on('room:error', handleRoomError);
        socket.on('chat:message', handleChatMessage);
        socket.on('game:start', handleGameStart);
        socket.on('game:state:init', handleGameStateInit);
        socket.on('game:state:update', handleGameStateUpdate);
        // socket.on('game:state', handleGameState);
        socket.on('game:end', handleGameEnd);
        socket.on('game:error', handleGameError);
        socket.on('room:removed', handleRoomRemoved);

        return () => {
            socket.off('room:created', handleRoomCreated);
            socket.off('room:update', handleRoomUpdate);
            socket.off('room:error', handleRoomError);
            socket.off('chat:message', handleChatMessage);
            socket.off('game:start', handleGameStart);
            socket.off('game:state:init', handleGameStateInit);
            socket.off('game:state:update', handleGameStateUpdate);
            // socket.off('game:state', handleGameState);
            socket.off('game:end', handleGameEnd);
            socket.off('game:error', handleGameError);
            socket.off('room:removed', handleRoomRemoved);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !currentRoom || currentRoom.status !== 'started')
            return undefined;
        function requestGameResync() {
            socket.emit('game:resync', { roomId: currentRoom.id });
        }
        requestGameResync();
        socket.on('connect', requestGameResync);
        return () => { socket.off('connect', requestGameResync); };
    }, [socket, currentRoom?.id, currentRoom?.status]);

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
        // setLatestGameState(null);
        setGameError('');
        setGameEntities([]);
        setGamePlayerData([]);
        setGameStartedAt(null);
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
        // latestGameState,
        gameStarted,
        roomNameInput,
        setRoomNameInput,
        gameResult,
        gameEntities,
        gameError,
        leaveGame,
        gamePlayerData,
        gameStartedAt,
    };
}
