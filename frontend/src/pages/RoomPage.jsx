//import { useRoom } from '../features/room/useRoom';

/*export function RoomPage({ title, description, socket, currentUser
}) {
*/
export function RoomPage({ title, description, socket, currentUser, room, }) {
  const {
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
    gameStarted,
    gameStartInfo,
    roomNameInput,
    setRoomNameInput
  } = room;
  /*= useRoom(socket, currentUser);*/

  const players = currentRoom?.players || [];
  const currentPlayer = players.find(player => String(player.id) === String(currentUser?.id),);
  /*const currentPlayer = players.find(player => player.id === socket?.id);*/
  const allPlayersReady = players.length > 0 && players.every(player => player.ready);
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
            {currentRoom.name && (
              <p>Room name: {currentRoom.name}</p>
            )}
            <p>Status: {currentRoom.status}</p>

            <div className="room-players">
              <h3>Players</h3>

              {players.length > 0 ? (
                <ul>
                  {players.map(player => (
                    <li key={player.id}>
                      <span className="room-player-name">{player.name}</span>
                      <span className="room-player-meta">
                        {String(player.id) === String(currentRoom.ownerId) ? 'Owner' : 'Player'} -
                        {player.ready ? ' Ready' : ' Not ready'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No players yet.</p>
              )}
            </div>
            <button
              type="button"
              className="room-ready-button"
              onClick={toggleReady}
              disabled={isDisabled || !currentPlayer}>
              {currentPlayer?.ready ? 'Not ready' : 'Ready'}
            </button>
            <button
              type="button"
              className="room-start-button"
              onClick={startGame}
              disabled={isDisabled || !allPlayersReady || gameStarted}
            >
              Start game
            </button>
            {gameStarted && gameStartInfo && (
              <p className="room-started">
                Game starting: {gameStartInfo.status}
              </p>
            )}
            <div className="room-chat">
              <h3>Chat</h3>
              <ul className="room-chat-messages">
                {chatMessages.map(chatMessage => (
                  <li key={`${chatMessage.timestamp}-${chatMessage.author.id}`}>
                    <span className="room-chat-author">
                      {chatMessage.author.name}:
                    </span>
                    <span className="room-chat-message">
                      {chatMessage.message}
                    </span>
                  </li>
                ))}
              </ul>
              <form className="room-chat-form" onSubmit={sendChatMessage}>
                <label htmlFor="room-chat-message">Message</label>
                <input
                  id="room-chat-message"
                  type="text"
                  value={chatInput}
                  onChange={event => setChatInput(event.target.value)}
                  placeholder="write a message"
                  disabled={isDisabled}
                />
                <button type="submit" disabled={isDisabled || !chatInput.trim()}>
                  Send
                </button>
              </form>
            </div>
            <button type="button" onClick={leaveRoom}>
              Leave room
            </button>

          </div>
        ) : (
          <div className="room-actions">
            <form className="room-form" onSubmit={createRoom}>
              <label htmlFor="room-name">Room name</label>
              <input
                id="room-name"
                type="text"
                value={roomNameInput}
                onChange={event => setRoomNameInput(event.target.value)}
                placeholder="Enter a room name"
                disabled={isDisabled}
              />
              <button type="submit" disabled={isDisabled}>
                Create room
              </button>
            </form>
            <form className="room-form" onSubmit={joinRoom}>
              <label htmlFor="room-id">Room id or name</label>
              <input
                id="room-id"
                type="text"
                value={roomIdInput}
                onChange={event => setRoomIdInput(event.target.value)}
                placeholder="Enter room id or name"
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