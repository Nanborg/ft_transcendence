import { PageHeading } from '../components/PageHeading';
import { ChatPanel } from '../features/chat/ChatPanel';

export function RoomPage({ title, description, socket, currentUser, room, chat })
{
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
  const currentPlayer = players.find((player) => String(player.id) === String(currentUser?.id));
  const allPlayersReady = players.length > 0 && players.every((player) => player.ready);
  const isDisabled = !socket || !currentUser || roomStatus === 'loading';
  const canStartGame = !isDisabled && currentRoom?.status === 'waiting' && allPlayersReady && !gameStarted;
  const pageActions = [
    { label: 'Back to Lobby', href: '#/lobby' },
  ];
  if (currentRoom?.status === 'playing' || gameStarted)
    pageActions.push({ label: 'Enter Game', href: '#/game' });
  pageActions.push({ label: 'Main Menu', href: '#/' });

  let currentRoomContent = (
    <div className="room-empty shell-window">
      <h2>No active room</h2>
      <p>Create or join a room from the lobby first.</p>
      <button className="btn btn-primary" type="button" onClick={() => { window.location.hash = '#/lobby'; }}>Go to lobby</button>
    </div>
  );
  if (currentRoom)
  {
    let playerList = <p>No players yet.</p>;
    if (players.length > 0)
    {
      playerList = (
        <ul>
          {players.map((player) =>
          {
            let ownerLabel = 'Player';
            if (String(player.id) === String(currentRoom.ownerId))
              ownerLabel = 'Owner';
            let readyClass = 'text-bg-warning';
            let readyLabel = 'Not ready';
            if (player.ready)
            {
              readyClass = 'text-bg-success';
              readyLabel = 'Ready';
            }
            return (
              <li key={player.id}>
                <span className="room-player-name">{player.name}</span>
                <span className="room-player-meta badge text-bg-secondary">{ownerLabel}</span>
                <span className={`room-player-meta badge ${readyClass}`}>{readyLabel}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    let readyLabel = 'Ready';
    if (currentPlayer?.ready)
      readyLabel = 'Not ready';
    let startButton = (
      <button type="button" className="room-start-button btn btn-primary" onClick={startGame} disabled={!canStartGame}>Start game</button>
    );
    if (currentRoom.status === 'playing')
    {
      startButton = (
        <button type="button" className="room-reconnect-button btn btn-outline-warning" onClick={() => socket.emit('game:resync', { roomId: currentRoom.id })} disabled={isDisabled} style={{ backgroundColor: 'orange', color: 'white' }}>Reconnect</button>
      );
    }
    let gameStartedLabel = null;
    if (gameStarted && gameStartInfo)
      gameStartedLabel = <p className="room-started">Game starting: {gameStartInfo.status}</p>;
    currentRoomContent = (
      <div className="room-current">
        <header className="room-summary shell-window">
          <div>
            <h2>{currentRoom.name || 'Current room'}</h2>
            <p className="room-muted">Room id: {currentRoom.id}</p>
          </div>
          <p className="room-status">Status: <span className="badge text-bg-info">{currentRoom.status}</span></p>
        </header>

        <div className="room-players shell-window">
          <h3>Players</h3>
          {playerList}
        </div>
        <div className="room-actions shell-window">
          <button type="button" className="room-ready-button btn btn-success" onClick={toggleReady} disabled={isDisabled || !currentPlayer}>{readyLabel}</button>
          {startButton}
          <button className="btn btn-outline-light" type="button" onClick={leaveRoom}>Leave room</button>
        </div>
        {gameStartedLabel}
        <ChatPanel chat={chat} disabled={isDisabled} />
      </div>
    );
  }

  return (
    <div className="shell-screen shell-screen--room">
      <PageHeading
        title={title}
        description={description}
        actions={pageActions}
      />

      <div className="room-panel">
        {!currentUser && <p className="room-error alert alert-danger">Login first to view your room.</p>}
        {currentRoomContent}

        {roomStatus === 'loading' && <p className="room-loading alert alert-info">Room action in progress...</p>}

        {roomError && <p className="room-error alert alert-danger">{roomError}</p>}
      </div>
    </div>
  );
}
