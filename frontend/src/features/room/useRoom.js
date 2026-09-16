import { useEffect, useRef, useState } from 'react';
import { createGameStateStore } from '../game/gameStateStore';

export function useRoom(socket, currentUser) {
    const [roomIdInput, setRoomIdInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomStatus, setRoomStatus] = useState('idle');
    const [roomError, setRoomError] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameStartInfo, setGameStartInfo] = useState(null);
    const gameStoreRef = useRef(null);
    if (gameStoreRef.current === null)
        gameStoreRef.current = createGameStateStore();
    const gameStore = gameStoreRef.current;
    const [gameResult, setGameResult] = useState(null);
    const [gameError, setGameError] = useState('');
    const [roomNameInput, setRoomNameInput] = useState('');
    const [gameStartedAt, setGameStartedAt] = useState(null);
    const [gameMap, setGameMap] = useState(null);
    const currentRoomIdRef = useRef(null);

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        function setActiveRoom(room) {
            currentRoomIdRef.current = room?.id ?? null;
            setCurrentRoom(room);
        }

        function isCurrentRoomPayload(payload) {
            return (payload && typeof payload.roomId === 'string' && payload.roomId === currentRoomIdRef.current);
        }

        function handleRoomCreated(room) {
            setActiveRoom(room);
            setRoomStatus('joined');
            setRoomError('');
        }

        function handleRoomUpdate(room) {
            setActiveRoom(room);
            setRoomStatus('joined');
            setRoomError('');
        }

        function handleRoomError(error) {
            setRoomStatus('error');
            setRoomError(error.message);
        }

        function handleGameStart(gameStartPayload) {
            if (!isCurrentRoomPayload(gameStartPayload))
                return;
            setGameStarted(true);
            setGameStartInfo(gameStartPayload);
            gameStore.reset();
            setGameStartedAt(null);
            setGameError('');
            setGameResult(null);
            setRoomStatus('started');
            setRoomError('');
            setGameMap(null);
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
            if (!isCurrentRoomPayload(gameStateInitPayload))
                return;
            setGameStarted(true);
            setGameMap(gameStateInitPayload.map ?? null);
            gameStore.reset(gameStateInitPayload);
            setGameStartedAt(gameStateInitPayload.serverStartedAt);
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
            if (!isCurrentRoomPayload(gameStateUpdatePayload))
                return;
            gameStore.applyUpdate(gameStateUpdatePayload);
        }

        function handleGameError(gameErrorPayload) {
            if (!gameErrorPayload || typeof gameErrorPayload.message !== 'string')
            {
                console.error('Invalid game:error payload:', gameErrorPayload);
                return;
            }
            if (!isCurrentRoomPayload(gameErrorPayload))
                return;
            setGameStarted(false);
            setGameError(gameErrorPayload.message);
            setRoomStatus('error');
        }

        function handleRoomRemoved(payload) {
            if (!isCurrentRoomPayload(payload))
                return;
            resetRoom();
            setRoomError('Room no longer exists.');
            window.location.hash = '#/room';
        }
		function pingBackend({clientSentAt, backendReceivedAt}) {

			const roundTrip = Date.now() - clientSentAt;

			console.log({
				roundTrip,
				backendReceivedAt,
			})
		}

        function handleGameEnd(gameEndPayload) {
            if (!gameEndPayload || typeof gameEndPayload.roomId !== 'string' || typeof gameEndPayload.tick !== 'number' ||
                typeof gameEndPayload.durationSeconds !== 'number' || gameEndPayload.end !== true || typeof gameEndPayload.win !== 'boolean' ||
                typeof gameEndPayload.reason !== 'string' || !Array.isArray(gameEndPayload.entities) || !Array.isArray(gameEndPayload.playerData))
            {
                console.error("Invalid game:end payload:", gameEndPayload);
                return;
            }
            if (!isCurrentRoomPayload(gameEndPayload))
                return;
            setGameStarted(false);
            setGameStartInfo(null);
            gameStore.reset({ ...gameEndPayload, ended: true });
            setGameStartedAt(null);
            setGameResult(gameEndPayload);
            setGameError('');
            setRoomStatus('finished');
            setRoomError('');
        }

        socket.on('room:created', handleRoomCreated);
        socket.on('room:update', handleRoomUpdate);
        socket.on('room:error', handleRoomError);
        socket.on('game:start', handleGameStart);
        socket.on('game:state:init', handleGameStateInit);
        socket.on('game:state:update', handleGameStateUpdate);
        socket.on('game:end', handleGameEnd);
        socket.on('game:error', handleGameError);
        socket.on('room:removed', handleRoomRemoved);
		socket.on("debug:latency:result", pingBackend);

        return () => {
            socket.off('room:created', handleRoomCreated);
            socket.off('room:update', handleRoomUpdate);
            socket.off('room:error', handleRoomError);
            socket.off('game:start', handleGameStart);
            socket.off('game:state:init', handleGameStateInit);
            socket.off('game:state:update', handleGameStateUpdate);
            socket.off('game:end', handleGameEnd);
            socket.off('game:error', handleGameError);
            socket.off('room:removed', handleRoomRemoved);
			socket.off("debug:latency:result", pingBackend);
        };
    }, [socket, gameStore]);

	useEffect(() => {
		if (!socket) return;
		const interval = setInterval(() => {
			socket.emit("debug:latency:check", {
			clientSentAt: Date.now(),
			});
		}, 15000); // 15 secs

        return () => clearInterval(interval);
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
        currentRoomIdRef.current = null;
        setCurrentRoom(null);
        setRoomStatus('idle');
        setRoomError('');
        setRoomIdInput('');
        setRoomNameInput('');
        setGameStarted(false);
        setGameStartInfo(null);
        setGameError('');
        gameStore.reset();
        setGameStartedAt(null);
        setGameResult(null);
        setGameMap(null);
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
        startGame,
        gameStartInfo,
        gameStarted,
        roomNameInput,
        setRoomNameInput,
        gameResult,
        gameMap,
        gameStore,
        gameError,
        leaveGame,
        gameStartedAt,
    };
}
