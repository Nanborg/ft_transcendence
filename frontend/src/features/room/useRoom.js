import { useEffect, useRef, useState } from 'react';
import { createGameStateStore } from '../game/gameStateStore';

export function useRoom(socket, currentUser) {
    const [roomIdInput, setRoomIdInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomStatus, setRoomStatus] = useState('idle');
    const [roomError, setRoomError] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameStartInfo, setGameStartInfo] = useState(null);
    // WHY: Live game data changes too often for normal React state
    const gameStoreRef = useRef(null);
    if (gameStoreRef.current === null)
        gameStoreRef.current = createGameStateStore();
    const gameStore = gameStoreRef.current;
    const [gameResult, setGameResult] = useState(null);
    const [gameError, setGameError] = useState('');
    const [roomNameInput, setRoomNameInput] = useState('');
    const [gameStartedAt, setGameStartedAt] = useState(null);
    const [gameMap, setGameMap] = useState(null);
    // REQUIRED: Socket callbacks need latest room id
    const currentRoomIdRef = useRef(null);

    useEffect(() => {
        // SAFETY: Register listeners only when socket exists
        if (!socket) {
            return undefined;
        }

        function setActiveRoom(room) {
            // SYNC: Ref avoids stale closure in handlers
            currentRoomIdRef.current = room?.id ?? null;
            setCurrentRoom(room);
        }

        function isCurrentRoomPayload(payload) {
            // SAFETY: Ignore stale room events
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
            // SYNC: Clear previous match data before navigation
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
            // SAFETY: Init snapshot must be complete
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
            // SYNC: Initial snapshot hydrates the external game store
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
            // SAFETY: Delta update must contain arrays
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
            // SYNC: Deltas stay in gameStore and notify subscribers
            gameStore.applyUpdate(gameStateUpdatePayload);
        }

        function handleGameError(gameErrorPayload) {
            // SAFETY: Error payload must be readable
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
            // SYNC: Deleted room returns user to room page
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
            // SAFETY: End payload must include final snapshot
            if (!gameEndPayload || typeof gameEndPayload.roomId !== 'string' || typeof gameEndPayload.tick !== 'number' ||
                typeof gameEndPayload.durationSeconds !== 'number' || gameEndPayload.end !== true || typeof gameEndPayload.win !== 'boolean' ||
                typeof gameEndPayload.reason !== 'string' || !Array.isArray(gameEndPayload.entities) || !Array.isArray(gameEndPayload.playerData))
            {
                console.error("Invalid game:end payload:", gameEndPayload);
                return;
            }
            if (!isCurrentRoomPayload(gameEndPayload))
                return;
            // SYNC: Final snapshot freezes gameStore for result screen
            setGameStarted(false);
            setGameStartInfo(null);
            gameStore.reset({ ...gameEndPayload, ended: true });
            setGameStartedAt(null);
            setGameResult(gameEndPayload);
            setGameError('');
            setRoomStatus('finished');
            setRoomError('');
        }

        // REQUIRED: Pair every socket.on with socket.off
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
            // SYNC: Lightweight latency probe for debug UI
			socket.emit("debug:latency:check", {
			clientSentAt: Date.now(),
			});
		}, 15000);

        return () => clearInterval(interval);
    }, [socket]);

    useEffect(() => {
        if (!socket || !currentRoom || currentRoom.status !== 'started')
            return undefined;
        function requestGameResync() {
            // SYNC: Reconnect asks server for latest snapshot
            socket.emit('game:resync', { roomId: currentRoom.id });
        }
        requestGameResync();
        socket.on('connect', requestGameResync);
        return () => { socket.off('connect', requestGameResync); };
    }, [socket, currentRoom?.id, currentRoom?.status]);

    useEffect(() => {
        if (!currentUser) {
            // SAFETY: Logout clears room state
            resetRoom();
        }
    }, [currentUser]);

    function createRoom(event) {
        event.preventDefault();
        // SAFETY: Creating room requires auth and socket
        if (!socket || !currentUser) {
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('room:create', {
            roomName: roomNameInput.trim() || undefined,
        });
    }

    function joinRoom(event) {
        event.preventDefault();

        // SAFETY: Joining room requires auth and socket
        if (!socket || !currentUser) {
            return;
        }
        const roomId = roomIdInput.trim();
        if (!roomId) {
            // SAFETY: Empty room id cannot be joined
            setRoomStatus('error');
            setRoomError('Enter the room id');
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('room:join', {
            roomId,
        });
    }

    function resetRoom() {
        // SYNC: Reset room state and external game store together
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
        // SAFETY: Leave only active room
        if (!socket || !currentRoom) {
            return;
        }

        socket.emit('room:leave', {
            roomId: currentRoom.id,
        });
        resetRoom();
    }

    function leaveGame() {
        // DECISION: Leaving game returns to lobby
        if (!socket || !currentRoom)
            return;
        socket.emit('room:leave', {roomId: currentRoom.id});
        resetRoom();
        window.location.hash = '#/lobby';
    }

    function toggleReady() {
        // SAFETY: Ready state belongs to current room
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
        // SAFETY: Only current room can start
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
