import { GameCanvas } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';
import { PageHeading } from '../components/PageHeading';
import { useEffect, useRef, useState } from 'react';
import skillSprites from '../assets/game/skills/skill_color_by_lvl.png';
import goldIcon from '../assets/game/gold/gold_icon.png';

function formatDuration(totalSeconds)
{
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useGameTimer(startedAt, enabled)
{
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() =>
    {
        if (!enabled || typeof startedAt !== 'number')
        {
            setElapsedSeconds(0);
            return undefined;
        }
        function updateTimer()
        {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        }
        updateTimer();
        const intervalId = window.setInterval(updateTimer, 250);
        return () =>
        {
            window.clearInterval(intervalId);
        };
    }, [startedAt, enabled]);
    return elapsedSeconds;
}

const SKILL_COLUMNS = {
    melee: 0,
    ranged: 1,
    shield: 2,
};
const MAX_SKILL_LEVEL = 3;
function getUpgradeCost(level){return 100 + level * 150;}

function SkillSlot({ skill, hotkey, lvl, cooldown })
{
    const safeLvl = Math.max(0, Math.min(3, lvl));
    const safeCooldown = Number.isFinite(cooldown) ? Math.max(0, cooldown) : 0;
    const onCooldown = safeCooldown > 0;
    const cooldownText = safeCooldown.toFixed(2);
    const iconStyle = {
        backgroundImage: `url(${skillSprites})`,
        backgroundPosition: `${SKILL_COLUMNS[skill] * 50}% ${safeLvl * (100 / 3)}%`,
    };
    return (
        <div className={`skill-slot ${onCooldown ? 'skill-cooldown-state' : 'skill-ready'}`}>
            <span className="skill-lvl">
                Lv {safeLvl}
            </span>
            <div className="skill-icon" style={iconStyle}>
                {onCooldown && <strong className="skill-cooldown">{cooldownText}</strong>}
            </div>
            <span className="skill-key">
                {hotkey}
            </span>
        </div>
    );
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
})
{
    const hasRoom = Boolean(currentRoom);
    const roomStatus = currentRoom?.status;
    const isPreparing = roomStatus === 'preparing';
    const isPlaying = roomStatus === 'playing';
    const hasLiveGameState = Array.isArray(gameEntities) && gameEntities.length > 0;
    const isGameReady = hasRoom && isPlaying && gameStarted;
    const elapsedSeconds = useGameTimer(gameStartedAt, isGameReady);
    const playerStats = Array.isArray(gameResult?.playerData) ? gameResult.playerData : [];
    const currentPlayer = Array.isArray(gamePlayerData) ? gamePlayerData.find(player => String(player.playerId) === String(currentPlayerId)) : null;
    const currentGold = currentPlayer?.gold ?? 0;
    const currentPlayerEntityId = currentPlayer?.playerEntityId;
    const isAtCheckpoint = currentPlayer?.atACheckpoint === true;
    const currentPlayerEntity = currentPlayer && Array.isArray(gameEntities)
        ? gameEntities.find(entity =>
            entity.entityId === currentPlayer.playerEntityId
        )
        : null;
    const playerHealth = Number.isFinite(currentPlayerEntity?.health)
        ? Math.max(0, currentPlayerEntity.health)
        : null;
    const skillLevels = {
        melee: currentPlayer?.upgrades?.melee ?? 0,
        ranged: currentPlayer?.upgrades?.ranged ?? 0,
        shield: currentPlayer?.upgrades?.shield ?? 0,
    };

    const [pendingUpgrade, setPendingUpgrade] = useState(null);
    const [checkpointError, setCheckpointError] = useState('');
    const previousGoldRef = useRef(null);
    const [goldFeedbacks, setGoldFeedbacks] = useState([]);

    function renderUpgradeButton(skill, label)
    {
        const level = skillLevels[skill] ?? 0;
        const nextLevel = Math.min(MAX_SKILL_LEVEL, level + 1);
        const cost = getUpgradeCost(level);
        const canBuy = level < MAX_SKILL_LEVEL && currentGold >= cost;
        const buttonClass = canBuy ? '' : 'upgrade-unavailable';
        const iconPosition = `${SKILL_COLUMNS[skill] * 50}% ${nextLevel * (100 / 3)}%`;
        const iconStyle = { backgroundImage: `url(${skillSprites})`, backgroundPosition: iconPosition, };

        return (
            <button
                type="button"
                className={buttonClass}
                disabled={pendingUpgrade !== null || !canBuy}
                onClick={() => selectCheckpointUpgrade(skill)}
            >
                <strong>{label}</strong>
                <div className="upgrade-preview-icon" style={iconStyle} />
                <span>Level {level} -&gt; {nextLevel}</span>
                <span>{cost} gold</span>
            </button>
        );
    }

    useEffect(() =>
    {
        if (!socket)
            return undefined;
        function handleCheckpointError(payload)
        {
            if (payload?.roomId && payload.roomId !== currentRoom?.id)
                return;
            setPendingUpgrade(null);
            setCheckpointError(payload?.message || 'Unable to apply upgrade');
        }
        socket.on('checkpoint:error', handleCheckpointError);
        return () =>
        {
            socket.off('checkpoint:error', handleCheckpointError);
        };
    }, [socket, currentRoom?.id]);

    useEffect(() =>
    {
        if (!isAtCheckpoint)
        {
            setPendingUpgrade(null);
            setCheckpointError('');
        }
    }, [isAtCheckpoint]);

    useEffect(() =>
    {
        if (typeof currentPlayerEntityId !== 'number')
            return;
        if (previousGoldRef.current === null)
        {
            previousGoldRef.current = currentGold;
            return;
        }
        const delta = currentGold - previousGoldRef.current;
        previousGoldRef.current = currentGold;
        if (delta === 0)
            return;
        const feedback = {
            id: `${Date.now()}-${Math.random()}`,
            amount: Math.abs(delta),
            type: delta > 0 ? 'gain' : 'loss',
            createdAt: performance.now(),
            playerEntityId: currentPlayerEntityId,
        };
        setGoldFeedbacks(previous => [...previous, feedback]);
        window.setTimeout(() =>
        {
            setGoldFeedbacks(previous => previous.filter(item => item.id !== feedback.id));
        }, 1000);
    }, [currentGold, currentPlayerEntityId]);

    function selectCheckpointUpgrade(upgrade)
    {
        if (!socket || !currentRoom || !isAtCheckpoint || pendingUpgrade)
            return;
        setPendingUpgrade(upgrade);
        setCheckpointError('');
        socket.emit('checkpoint:upgrade', {
            roomId: currentRoom.id,
            upgrade,
        });
    }

    usePlayerInput({
        socket,
        roomId: currentRoom?.id,
        enabled: isGameReady,
        actionsEnabled: !isAtCheckpoint,
    });
    if (!hasRoom)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>No active room</h2>
                    <p className="game-muted">Join or create a room before opening the game.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/lobby'; }}>Go to lobby</button>
                </div>
            </>
        );
    }
    if (gameError)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>Game error</h2>
                    <p className="room-error">{gameError}</p>
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}>Back to room</button>
                </div>
            </>
        );
    }
    if (gameResult)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>{gameResult.win ? 'Mission completed' : 'Mission failed'}</h2>
                    <div className="game-hud">
                        <p>Reason: {gameResult.reason}</p>
                        <p>Duration: {typeof gameResult.durationSeconds === 'number' ? `${gameResult.durationSeconds} seconds` : 'Unavailable'}</p>
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
                                        <td>{player.disconnected ? 'Disconnected' : 'Connected'}</td>
                                        <td>Level {player.upgrades?.melee ?? 0} / {player.cooldowns?.melee ?? 0} ticks</td>
                                        <td>Level {player.upgrades?.ranged ?? 0} / {player.cooldowns?.ranged ?? 0} ticks</td>
                                        <td>Level {player.upgrades?.shield ?? 0} / {player.cooldowns?.shield ?? 0} ticks</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="game-muted">No player statistics received.</p>}
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}>Back to room</button>
                </div>
            </>
        );
    }
    if (isPreparing)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>Preparation de la partie...</h2>
                    <p className="game-muted">Le serveur prepare le moteur de jeu.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}>Back to room</button>
                </div>
            </>
        );
    }
    if (!isGameReady)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>Game not started</h2>
                    <p className="game-muted">Ready up and start the game from the room page.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}>Back to room</button>
                </div>
            </>
        );
    }
    if (!hasLiveGameState)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>Waiting for live game state</h2>
                    <p className="game-muted">The game started, but the server has not sent a game state yet.</p>
                    <button type="button" onClick={() => { window.location.hash = '#/room'; }}>Back to room</button>
                </div>
            </>
        );
    }
    return (
        <div className="game-fullscreen">
            <PageHeading title={title} description={description} />
                <section className="game-hud game-hud-live" aria-label="Game status">
                    <div className="game-hud-summary">
                        <span className="game-hud-status">
                            <span className="game-hud-status-dot" aria-hidden="true" />
                            Live
                        </span>
                        <span>Room: {currentRoom.name || currentRoom.id}</span>
                        <strong>{formatDuration(elapsedSeconds)}</strong>
                    </div>
                    <div className="game-hud-stats">
                        <div className="game-hud-stat">
                            <span>Health</span>
                            <strong>{playerHealth ?? '—'}</strong>
                        </div>
                        <div className="game-hud-stat game-hud-stat-gold">
                            <span>Gold</span>
                            <strong className="game-hud-gold">
                                <img src={goldIcon} alt="" aria-hidden="true" />
                                {currentGold}
                            </strong>
                        </div>
                    </div>
                </section>
                <section className="skill-bar" aria-label="Abilities">
                    <SkillSlot
                        skill="melee"
                        hotkey="J"
                        lvl={skillLevels.melee}
                        cooldown={currentPlayer?.cooldowns?.melee ?? 0}
                    />
                    <SkillSlot
                        skill="ranged"
                        hotkey="K"
                        lvl={skillLevels.ranged}
                        cooldown={currentPlayer?.cooldowns?.ranged ?? 0}
                    />
                    <SkillSlot
                        skill="shield"
                        hotkey="L"
                        lvl={skillLevels.shield}
                        cooldown={currentPlayer?.cooldowns?.shield ?? 0}
                    />
                </section>
                <div className="game-fullscreen-panel">
                <GameCanvas
                    currentPlayerId={currentPlayerId}
                    gameMap={gameMap}
                    gameEntities={gameEntities}
                    gamePlayerData={gamePlayerData}
                    goldFeedbacks={goldFeedbacks}
                    socket={socket}
                />
                {isAtCheckpoint && (
                    <section className="checkpoint-upgrade" aria-labelledby="checkpoint-upgrade-title">
                        <h2 id="checkpoint-upgrade-title">Choose an upgrade</h2>
                        <p>Select one ability to improve before continuing.</p>
                        <div className="checkpoint-upgrade-list">
                            {renderUpgradeButton('melee', 'Melee')}
                            {renderUpgradeButton('ranged', 'Ranged')}
                            {renderUpgradeButton('shield', 'Shield')}
                        </div>
                        {pendingUpgrade && <p>Applying {pendingUpgrade} upgrade…</p>}
                        {checkpointError && <p className="room-error">{checkpointError}</p>}
                    </section>
                )}
                <button type="button" className="game-leave-button" onClick={onLeaveGame}>Leave game</button>
            </div>
        </div>
    );
}
