import {useEffect, useState} from 'react'

function getPlayerName(currentUser) {
    return currentUser?.name || currentUser?.email || 'Player' ;
}

export function useRoom(socket, currentUser) {
    const [roomIdInput, setRoomIdInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomStatus, setRoomStatus] = useState('idle');
    const [roomError, setRoomError] = useState('');

    useEffect(() => {
        if(!socket) {
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

        socket.on('room:created', handleRoomCreated);
        socket.on('room:update', handleRoomUpdate);
        socket.on('room:error', handleRoomError);

        return () => {
        socket.off('room:created', handleRoomCreated);
        socket.off('room:update', handleRoomUpdate);
        socket.off('room:error', handleRoomError);
        };
    }, [socket]);

    function createRoom() {
        if (!socket || !currentUser) {
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('room:create', {
            playerName: getPlayerName(currentUser),
        });
    }

    function joinRoom(event) {
        event.preventDefault();

        if (!socket || !currentUser) {
            return;
        }
        const roomId = roomIdInput.trim();
        if (!roomId){
            setRoomStatus('error');
            setRoomError('Enter the room id');
            return;
        }
        setRoomStatus('loading');
        setRoomError('');
        socket.emit('room:join', {
            roomId,
            playerName: getPlayerName(currentUser),
        });
    }

    function leaveRoom() {
        if (!socket || !currentRoom) {
            return;
        }

        socket.emit('room:leave', {
            roomId: currentRoom.id,
        });
        setCurrentRoom(null);
        setRoomStatus('idle');
        setRoomError('');
        setRoomIdInput('');
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
    };
}