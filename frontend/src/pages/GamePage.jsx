//import { GameCanvas, mockGameState } from "../features/game/GameCanvas";
import { GameCanvas } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';
import { PageHeading } from '../components/PageHeading';

export function GamePage({ title, description, gameState, gameEntities, gameResult, socket, currentRoom, gameStarted, gameError, onLeaveGame }) {
    //Nanborg
    // TODO(nanborg): Remove the mockGameState fallback once live game:state is required for rendering.
    // The game page should not show preview state after the backend emits authoritative game states.
    // TODO(nanborg): Show a clear waiting state while no live game:state has been received.
    // TODO(nanborg): Render game:end with victory/defeat, final score, player stats, and navigation.
    const renderedGameState = gameState;
    const hasRoom = Boolean(currentRoom);
    const hasLiveGameState = Boolean(gameState) || (Array.isArray(gameEntities) && gameEntities.length > 0);
    const isGameReady = hasRoom && gameStarted;
    const playerStats = Array.isArray(gameResult?.players) ? gameResult.players : [];

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
    if (gameError) {
        return (
            <>
                <PageHeading title={title} description={description} />

                <div className="game-panel">
                    <h2>Game error</h2>
                    <p className="room-error">{gameError}</p>

                    <button
                        type="button"
                        onClick={() => {
                            window.location.hash = '#/room';
                        }}
                    >
                        Back to room
                    </button>
                </div>
            </>
        );
    }
    if (gameResult) {
        return (
            <>
                <PageHeading title={title} description={description} />

                <div className="game-panel">
                    <h2>
                        {gameResult.victory
                            ? 'Mission completed'
                            : 'Mission failed'}
                    </h2>

                    <div className="game-hud">
                        <p>Reason: {gameResult.reason}</p>
                        <p>
                            Duration:{' '}
                            {typeof gameResult.durationMs === 'number'
                                ? `${Math.round(gameResult.durationMs / 1000)} seconds`
                                : 'Unavailable'}
                        </p>
                    </div>

                    {gameResult.score && (
                        <div className="game-hud">
                            <p>Team score: {gameResult.score.team}</p>
                            <p>Kills: {gameResult.score.kills}</p>
                            <p>
                                Resources: {gameResult.score.resources}
                            </p>
                        </div>
                    )}

                    <h3>Player statistics</h3>

                    {playerStats.length > 0 ? (
                        <table className="game-stats-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Score</th>
                                    <th>Kills</th>
                                    <th>Deaths</th>
                                    <th>Damage</th>
                                    <th>Resources</th>
                                    <th>State</th>
                                </tr>
                            </thead>

                            <tbody>
                                {playerStats.map((player) => (
                                    <tr
                                        key={
                                            player.id ??
                                            player.enginePlayerId
                                        }
                                    >
                                        <td>{player.username}</td>
                                        <td>{player.score}</td>
                                        <td>{player.kills}</td>
                                        <td>{player.deaths}</td>
                                        <td>{player.damageDone}</td>
                                        <td>
                                            {player.resourcesCollected}
                                        </td>
                                        <td>{player.state}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="game-muted">
                            No player statistics received.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            window.location.hash = '#/room';
                        }}
                    >
                        Back to room
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
    if (!hasLiveGameState) {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>Waiting for live game state</h2>
                    <p className="game-muted">The game started, but the server has not sent a game state yet.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}> Back to room </button>
                </div>
            </>
        );
    }
    return (
        <>
            <PageHeading title={title} description={description} />
            <div className="game-panel">
                <div className="game-hud">
                    <p>Live game state</p>
                    <p>Room: {currentRoom.name || currentRoom.id}</p>
                </div>
                <GameCanvas
                    gameState={renderedGameState}
                    gameEntities={gameEntities}
                />
                <button
                    type="button"
                    className="game-leave-button"
                    onClick={onLeaveGame}
                >
                    Leave game
                </button>
            </div>
        </>
    );
}
