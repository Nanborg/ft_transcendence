import { GameCanvas, mockGameState } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';
import { PageHeading } from '../components/PageHeading';

export function GamePage({ title, description, gameState, socket, currentRoom, gameStarted, gameEndInfo }) {
    //Nanborg
    // TODO(nanborg): Remove the mockGameState fallback once live game:state is required for rendering.
    // The game page should not show preview state after the backend emits authoritative game states.
    // TODO(nanborg): Show a clear waiting state while no live game:state has been received.
    // TODO(nanborg): Render game:end with victory/defeat, final score, player stats, and navigation.
    const renderedGameState = gameState || mockGameState;
    const hasRoom = Boolean(currentRoom);
    const hasLiveGameState = Boolean(gameState);
    const isGameReady = hasRoom && gameStarted;

    usePlayerInput({
        socket,
        roomId: currentRoom?.id,
        enabled: isGameReady,
    });
    if (!hasRoom) {
        return (
            <>
                <PageHeading title={title} description={description} />
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
                <PageHeading title={title} description={description} />
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
    if (gameEndInfo) {
        return (
            <>
            <PageHeading title={title} description={description} />
            <div>
                <h2>Victory / Defeat</h2>
                <p>Reason</p>
                <p>Team score</p>
                <ul>
                    <li>Player 1</li>
                    <li>Player 2</li>
                </ul>
            </div>
            </>
        );
    }
    return (
        <>
            <PageHeading title={title} description={description} />
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
