import { GameCanvas, mockGameState } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';

export function GamePage({ title, description, gameState, socket, currentRoom, gameStarted }) {
    const renderedGameState = gameState || mockGameState;
    const hasRoom = Boolean(currentRoom);
    const hasLiveGameState = Boolean(gameState);
    const isGameReady = hasRoom && gameStarted;

    usePlayerInput({
        socket, roomId: currentRoom?.id, enabled: gameStarted === true,
    });
    if (!hasRoom) {
        return (
            <>
                <p className="page-kicker">Frontend page</p>
                <h1 id="page-title">{title}</h1>
                <p>{description}</p>
                <div className="game-panel">
                    <h2>No active room</h2>
                    <p className="game-muted">Join or create a room before opening the game.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/lobby'; }}>
                        Go to lobby
                    </button>
                </div>
            </>
        );
    }
    if (!isGameReady) {
        return (
            <>
                <p className="page-kicker">Frontend page</p>
                <h1 id="page-title">{title}</h1>
                <p>{description}</p>
                <div className="game-panel">
                    <h2>Game not started</h2>
                    <p className="game-muted">Ready up and start the game from the room page.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}>
                        Back to room
                    </button>
                </div>
            </>
        );
    }
    return (
        <>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>
            <div className="game-panel">
                <div className="game-hud">
                    <p>{hasLiveGameState ? 'Live game state' : 'Preview game state'}</p>
                    <p>Room: {currentRoom.name || currentRoom.id}</p>
                </div>
                <GameCanvas gameState={renderedGameState} />
            </div>
        </>
    );
}