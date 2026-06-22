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

  const isDisabled = !socket || !currentUser || roomStatus === 'loading';

  return (
    <>
      <p className="page-kicker">Frontend page</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>

      <div className="room-panel">
        {!currentUser && (
          <p className="room-error">Login first to create or join a room.</p>
        )}

        {currentRoom ? (
          <div className="room-current">
            <h2>Current room</h2>
            <p>Room id: {currentRoom.id}</p>
            <p>Status: {currentRoom.status}</p>
            <button type="button" onClick={leaveRoom}>
              Leave room
            </button>
          </div>
        ) : (
          <div className="room-actions">
            <button type="button" onClick={createRoom} disabled={isDisabled}>
              Create room
            </button>

            <form className="room-form" onSubmit={joinRoom}>
              <label htmlFor="room-id">Room id</label>
              <input
                id="room-id"
                type="text"
                value={roomIdInput}
                onChange={event => setRoomIdInput(event.target.value)}
                placeholder="Enter room id"
                disabled={isDisabled}
              />
              <button type="submit" disabled={isDisabled}>
                Join room
              </button>
            </form>
          </div>
        )}

        {roomStatus === 'loading' && (
          <p className="room-loading">Room action in progress...</p>
        )}

        {roomError && (
          <p className="room-error">{roomError}</p>
        )}
      </div>
    </>
  );
}