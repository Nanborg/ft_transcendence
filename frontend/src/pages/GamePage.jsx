import { GameCanvas } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';
import { PageHeading } from '../components/PageHeading';
import { useEffect, useState } from 'react';

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useGameTimer(startedAt, enabled) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        if (!enabled || typeof startedAt !== 'number')
        {
            setElapsedSeconds(0);
            return undefined;
        }
        function updateTimer() {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        }
        updateTimer();
        const intervalId = window.setInterval(updateTimer, 250);
        return () => { window.clearInterval(intervalId); };
    }, [startedAt, enabled]);
    return elapsedSeconds;
}

export function GamePage({
    title,
    description,
    currentPlayerId,
    gameMap,
    gameEntities,
    gameStartedAt,
    gamePlayerData,
    gameResult,
    socket,
    currentRoom,
    gameStarted,
    gameError,
    onLeaveGame
}) {
    const hasRoom = Boolean(currentRoom);
    const hasLiveGameState = Array.isArray(gameEntities) && gameEntities.length > 0;
    const isGameReady = hasRoom && gameStarted;
    const elapsedSeconds = useGameTimer(gameStartedAt, isGameReady);
    const playerStats = Array.isArray(gameResult?.playerData) ? gameResult.playerData : [];

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
                        {gameResult.win
                            ? 'Mission completed'
                            : 'Mission failed'}
                    </h2>

                    <div className="game-hud">
                        <p>Reason: {gameResult.reason}</p>
                        <p>
                            Duration:{' '}
                            {typeof gameResult.durationSeconds === 'number'
                                ? `${gameResult.durationSeconds} seconds`
                                : 'Unavailable'}
                        </p>
                    </div>

                    <h3>Player statistics</h3>

                    {playerStats.length > 0 ? (
                        <table className="game-stats-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Deaths</th>
                                    <th>Damage dealt</th>
                                    <th>Damage received</th>
                                    <th>Life</th>
                                    <th>Connection</th>
                                    <th>Melee</th>
                                    <th>Ranged</th>
                                    <th>Shield</th>
                                </tr>
                            </thead>

                            <tbody>
                                 {playerStats.map((player) => (
                                    <tr key={player.playerId}>
                                        <td>{player.username ?? `Player ${player.playerId}`}</td>
                                        <td>{player.deaths ?? 0}</td>
                                        <td>{player.damageDealt ?? 0}</td>
                                        <td>{player.damageReceived ?? 0}</td>
                                        <td>{player.alive ? 'Alive' : 'Dead'}</td>
                                        <td>
                                            {player.disconnected
                                                ? 'Disconnected'
                                                : 'Connected'}
                                        </td>
                                        <td>
                                            Level {player.upgrades?.melee ?? 0}
                                            {' / '}
                                            {player.cooldowns?.melee ?? 0} ticks
                                        </td>
                                        <td>
                                            Level {player.upgrades?.ranged ?? 0}
                                            {' / '}
                                            {player.cooldowns?.ranged ?? 0} ticks
                                        </td>
                                        <td>
                                            Level {player.upgrades?.shield ?? 0}
                                            {' / '}
                                            {player.cooldowns?.shield ?? 0} ticks
                                        </td>
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
                    <p>Time: {formatDuration(elapsedSeconds)}</p>
                </div>
                <GameCanvas
                    currentPlayerId={currentPlayerId}
                    gameMap={gameMap}
                    gameEntities={gameEntities}
                    gamePlayerData={gamePlayerData}
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
