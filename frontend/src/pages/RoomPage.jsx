import { useRoom } from '../features/room/useRoom';

export function RoomPage({ title, description, socket, currentUser    
}) {
    const {
        roomIdInput,
        setRoomIdInput,
        currentRoom,
        roomStatus,
        roomError,
        createRoom,
        joinRoom,
        leaveRoom
    } = useRoom(socket, currentUser);

    const idDisabled = !socket || !currentUser || roomStatus === 'loading';
    return(
        <>page to write</>
    )
}