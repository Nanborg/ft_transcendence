import { PageHeading } from '../components/PageHeading';
import { ChatPanel } from '../features/chat/ChatPanel';

export function RoomPage({ title, description, socket, currentUser, room, chat}) {
  const {
    currentRoom,
    roomStatus,
    roomError,
    leaveRoom,
    toggleReady,
    startGame,
    gameStarted,
    gameStartInfo,
  } = room;

  const players = currentRoom?.players || [];
  const currentPlayer = players.find(player => String(player.id) === String(currentUser?.id),);
  const allPlayersReady = players.length > 0 && players.every(player => player.ready);
  const isDisabled = !socket || !currentUser || roomStatus === 'loading';
  const canStartGame = !isDisabled && currentRoom?.status === 'waiting' && allPlayersReady && !gameStarted;

  return (
    <>
      <PageHeading title={title} description={description} />

      <div className="room-panel">
        {!currentUser && (
          <p className="room-error alert alert-danger">Login first to view your room.</p>
        )}

        {currentRoom ? (
          <div className="room-current">
            <header className="room-summary">
              <div>
                <h2>{currentRoom.name || 'Current room'}</h2>
                <p className="room-muted">Room id: {currentRoom.id}</p>
              </div>
              <p className="room-status">
                Status: <span className="badge text-bg-info">{currentRoom.status}</span>
              </p>
            </header>

            <div className="room-players">
              <h3>Players</h3>

              {players.length > 0 ? (
                <ul>
                  {players.map(player => (
                    <li key={player.id}>
                      <span className="room-player-name">{player.name}</span>
                      <span className="room-player-meta badge text-bg-secondary">
                        {String(player.id) === String(currentRoom.ownerId) ? 'Owner' : 'Player'}
                      </span>
                      <span className={`room-player-meta badge ${player.ready ? 'text-bg-success' : 'text-bg-warning'}`}>
                        {player.ready ? 'Ready' : 'Not ready'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No players yet.</p>
              )}
            </div>
            <div className="room-actions">
              <button
                type="button"
                className="room-ready-button btn btn-success"
                onClick={toggleReady}
                disabled={isDisabled || !currentPlayer}
              >
                {currentPlayer?.ready ? 'Not ready' : 'Ready'}
              </button>
              {currentRoom.status === 'playing' ? (
                <button
                  type="button"
                  className="room-reconnect-button btn btn-outline-warning"
                  onClick={() => socket.emit('game:resync', { roomId: currentRoom.id })}
                  disabled={isDisabled}
                  style={{ backgroundColor: 'orange', color: 'white' }}
                >
                  Reconnect
                </button>
              ) : (
                <button
                  type="button"
                  className="room-start-button btn btn-primary"
                  onClick={startGame}
                  disabled={!canStartGame}
                >
                  Start game
                </button>
              )}
              <button className="btn btn-outline-light" type="button" onClick={leaveRoom}>
                Leave room
              </button>
            </div>
            {gameStarted && gameStartInfo && (
              <p className="room-started">
                Game starting: {gameStartInfo.status}
              </p>
            )}
            <ChatPanel
              chat={chat}
              disabled={isDisabled}
            />
          </div>
        ) : (
          <div className="room-empty">
            <h2>No active room</h2>
            <p>Create or join a room from the lobby first.</p>
            <button className="btn btn-primary" type="button" onClick={() => { window.location.hash = '#/lobby'; }}>
              Go to lobby
            </button>
          </div>
        )}

        {roomStatus === 'loading' && (
          <p className="room-loading alert alert-info">Room action in progress...</p>
        )}

        {roomError && (
          <p className="room-error alert alert-danger">{roomError}</p>
        )}
      </div>
    </>
  );
}
