import { GameCanvas } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';
import { MobileJoystick } from '../features/game/components/MobileJoystick';
import { PLAYER_ACTION } from '../features/game/gameProtocol';
import '../features/game/components/gameControls.css';
import { PageHeading } from '../components/PageHeading';
import { useCallback, useEffect, useRef, useState } from 'react';
import skillSprites from '../assets/game/skills/skill_color_by_lvl.png';
import goldIcon from '../assets/game/gold/gold_icon.png';
import healIcon from '../assets/game/checkpoint/heal.png';
import { useGameView } from '../features/game/useGameView';

function formatDuration(totalSeconds)
{
    // DECISION: Timer uses mm:ss for compact HUD
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useGameTimer(startedAt, enabled)
{
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() =>
    {
        // SAFETY: Stop timer until game is ready
        if (!enabled || typeof startedAt !== 'number')
        {
            setElapsedSeconds(0);
            return undefined;
        }
        function updateTimer()
        {
            // SYNC: Server start time is reference
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
const HEALTH_UPGRADE_COST = 50;
const HEALTH_UPGRADE_BONUS = 10;
const UPGRADE_STATS = {
    melee: {
        label: 'Damage',
        baseValue: 100,
        valuePerLevel: 30,
    },
    ranged: {
        label: 'Damage',
        baseValue: 100,
        valuePerLevel: 30,
    },
    shield: {
        label: 'Shield HP',
        baseValue: 5,
        valuePerLevel: 2,
    },
};

function getUpgradeValue(skill, level)
{
    // DECISION: UI mirrors upgrade formula
    const stat = UPGRADE_STATS[skill];
    return stat.baseValue + level * stat.valuePerLevel;
}

function SkillSlot({ skill, hotkey, lvl, cooldown, disabled, onPress, onRelease })
{
    // SAFETY: Clamp level before sprite lookup
    const safeLvl = Math.max(0, Math.min(3, lvl));
    const safeCooldown = Number.isFinite(cooldown) ? Math.max(0, cooldown) : 0;
    const onCooldown = safeCooldown > 0;
    const action = {melee: PLAYER_ACTION.MELEE, ranged: PLAYER_ACTION.RANGED, shield: PLAYER_ACTION.SHIELD}[skill];
    const pointerRef = useRef(null);
    const release = useCallback(() => {
        const pointer = pointerRef.current;
        pointerRef.current = null;
        if (pointer?.element.hasPointerCapture(pointer.id))
            pointer.element.releasePointerCapture(pointer.id);
        onRelease(action);
    }, [onRelease, action]);

    useEffect(() => {
        if (disabled)
            release();
        window.addEventListener('blur', release);
        return () => {
            window.removeEventListener('blur', release);
            release();
        };
    }, [disabled, release]);

    const cooldownText = safeCooldown.toFixed(2);
    const iconStyle = {
        // SYNC: Sprite sheet row follows skill level
        backgroundImage: `url(${skillSprites})`,
        backgroundPosition: `${SKILL_COLUMNS[skill] * 50}% ${safeLvl * (100 / 3)}%`,
    };
    return (
        <button
            type="button"
            className={`skill-slot ${onCooldown ? 'skill-cooldown-state' : 'skill-ready'}`}
            disabled={disabled}
            aria-disabled={disabled || onCooldown}
            aria-label={`${skill} (${hotkey})`}
            onPointerDown={event => {
                if (disabled || onCooldown || event.button !== 0 || pointerRef.current)
                    return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                pointerRef.current = {id: event.pointerId, element: event.currentTarget};
                onPress(action);
            }}
            onPointerUp={event => { if (pointerRef.current?.id === event.pointerId) release(); }}
            onPointerCancel={event => { if (pointerRef.current?.id === event.pointerId) release(); }}
            onLostPointerCapture={event => { if (pointerRef.current?.id === event.pointerId) release(); }}
            onKeyDown={event => {
                if (event.code !== 'Space' && event.code !== 'Enter')
                    return;
                event.preventDefault();
                if (!disabled && !onCooldown && !event.repeat)
                    onPress(action);
            }}
            onKeyUp={event => {
                if (event.code === 'Space' || event.code === 'Enter') {
                    event.preventDefault();
                    release();
                }
            }}
            onBlur={release}
            onContextMenu={event => event.preventDefault()}
        >
            <span className="skill-lvl">
                Lv {safeLvl}
            </span>
            <span className="skill-icon" style={iconStyle}>
                {onCooldown && <strong className="skill-cooldown">{cooldownText}</strong>}
            </span>
            <span className="skill-key">
                {hotkey}
            </span>
        </button>
    );
}

export function GamePage({
    title,
    description,
    currentPlayerId,
    gameMap,
    gameStore,
    gameStartedAt,
    gameResult,
    socket,
    chatInputFocused = false,
    currentRoom,
    gameStarted,
    gameError,
    onLeaveGame
})
{
    const hasRoom = Boolean(currentRoom);
    const roomStatus = currentRoom?.status;
    const isStarting = roomStatus === 'starting';
    const isPlaying = roomStatus === 'playing';
    const gameView = useGameView(gameStore, currentPlayerId);
    const hasLiveGameState = gameView.hasEntities;
    const isGameReady = hasRoom && isPlaying && gameStarted;
    const elapsedSeconds = useGameTimer(gameStartedAt, isGameReady);
    const playerStats = Array.isArray(gameResult?.playerData) ? gameResult.playerData : [];
    const currentPlayer = gameView.player;
    const currentGold = currentPlayer?.gold ?? 0;
    const currentPlayerEntityId = currentPlayer?.playerEntityId;
    const isAtCheckpoint = currentPlayer?.atACheckpoint === true;
    const playerHealth = gameView.health;
    const skillLevels = {
        melee: currentPlayer?.upgrades?.melee ?? 0,
        ranged: currentPlayer?.upgrades?.ranged ?? 0,
        shield: currentPlayer?.upgrades?.shield ?? 0,
    };

    const [pendingUpgrade, setPendingUpgrade] = useState(null);
    const [checkpointError, setCheckpointError] = useState('');
    const previousGoldRef = useRef(null);
    const [goldFeedbacks, setGoldFeedbacks] = useState([]);
    const [isCheckpointMenuOpen, setIsCheckpointMenuOpen] = useState(false);

    function renderUpgradeButton(skill, label, hotkey)
    {
        if (skill === 'health')
        {
            // DECISION: Health uses fixed checkpoint price
            const canAfford = currentGold >= HEALTH_UPGRADE_COST;
            const buttonClass = ['checkpoint-upgrade-card', 'checkpoint-upgrade-card--shield', !canAfford ? 'upgrade-unavailable' : '', ].filter(Boolean).join(' ');
            const iconStyle = { backgroundImage: `url(${healIcon})`, backgroundSize: '70%', backgroundPosition: 'center', };

            return (
                <button type="button" className={buttonClass} disabled={pendingUpgrade !== null || !canAfford} onClick={() => selectCheckpointUpgrade(skill)}>
                    <div className="upgrade-preview-icon" style={iconStyle} aria-hidden="true"/>
                    <strong className="checkpoint-upgrade-card__title">
                        {label} <span>[ {hotkey} ]</span>
                    </strong>
                    <span className="checkpoint-upgrade-card__level">
                        +{HEALTH_UPGRADE_BONUS} HP
                    </span>
                    <span className="checkpoint-upgrade-card__stat">
                        <small>Health</small>
                        <strong>
                            {playerHealth ?? 0} → {(playerHealth ?? 0) + HEALTH_UPGRADE_BONUS}
                        </strong>
                    </span>
                    <span className="checkpoint-upgrade-card__price">
                        {canAfford ? `${HEALTH_UPGRADE_COST} gold` : `Need ${HEALTH_UPGRADE_COST} gold`}
                    </span>
                </button>
            );
        }
        const level = skillLevels[skill] ?? 0;
        // SAFETY: Do not render upgrade above max
        const isMaxLevel = level >= MAX_SKILL_LEVEL;
        const nextLevel = Math.min(MAX_SKILL_LEVEL, level + 1);
        const cost = getUpgradeCost(level);
        const canAfford = currentGold >= cost;
        const canBuy = !isMaxLevel && canAfford;
        const stat = UPGRADE_STATS[skill];
        const currentValue = getUpgradeValue(skill, level);
        const nextValue = getUpgradeValue(skill, nextLevel);
        const buttonClass = [
            'checkpoint-upgrade-card',
            `checkpoint-upgrade-card--${skill}`,
            !canBuy ? 'upgrade-unavailable' : '',
        ].filter(Boolean).join(' ');
        const iconPosition = `${SKILL_COLUMNS[skill] * 50}% ${nextLevel * (100 / 3)}%`;
        // SYNC: Preview icon shows next level
        const iconStyle = { backgroundImage: `url(${skillSprites})`, backgroundPosition: iconPosition, };

        return (
            <button
                type="button"
                className={buttonClass}
                disabled={pendingUpgrade !== null || !canBuy}
                onClick={() => selectCheckpointUpgrade(skill)}
            >
                <div
                    className="upgrade-preview-icon"
                    style={iconStyle}
                    aria-hidden="true"
                />
                <strong className="checkpoint-upgrade-card__title">
                    {label} <span>[ {hotkey} ]</span>
                </strong>
                <span className="checkpoint-upgrade-card__level">
                    {isMaxLevel
                        ? `Level ${level} — MAX`
                        : `Level ${level} → ${nextLevel}`}
                </span>
                <span className="checkpoint-upgrade-card__stat">
                    <small>{stat.label}</small>
                    <strong>
                        {isMaxLevel
                            ? currentValue
                            : `${currentValue} → ${nextValue}`}
                    </strong>
                </span>
                <span className="checkpoint-upgrade-card__price">
                    {isMaxLevel
                        ? 'Fully upgraded'
                        : canAfford
                            ? `${cost} gold`
                            : `Need ${cost} gold`}
                </span>
            </button>
        );
    }
    useEffect(() =>
    {
        if (!socket)
            return undefined;
        function handleCheckpointError(payload)
        {
            // SAFETY: Ignore errors from other rooms
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
            // SYNC: Leaving checkpoint closes shop
            setPendingUpgrade(null);
            setCheckpointError('');
            setIsCheckpointMenuOpen(false);
        }
    }, [isAtCheckpoint]);

    useEffect(() => {
        previousGoldRef.current = null;
        setGoldFeedbacks([]);
    }, [gameStore, gameView.revision]);

    useEffect(() =>
    {
        if (typeof currentPlayerEntityId !== 'number')
            return;
        if (previousGoldRef.current === null)
        {
            // DECISION: First gold value sets baseline
            previousGoldRef.current = currentGold;
            return;
        }
        const delta = currentGold - previousGoldRef.current;
        previousGoldRef.current = currentGold;
        if (delta === 0)
            return;
        // SYNC: Gold delta animates above player
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

    useEffect(() =>
    {
        if (pendingUpgrade)
            // SYNC: New stats confirm upgrade response
            setPendingUpgrade(null);
    }, [currentGold, playerHealth, skillLevels.melee, skillLevels.ranged, skillLevels.shield]);

    function selectCheckpointUpgrade(upgrade)
    {
        // SAFETY: Upgrade only when shop is valid
        if (!socket || !currentRoom || !isAtCheckpoint || pendingUpgrade)
            return;
        setPendingUpgrade(upgrade);
        setCheckpointError('');
        socket.emit('checkpoint:upgrade', {
            roomId: currentRoom.id,
            upgrade,
        });
    }

    const toggleCheckpointMenu = useCallback(() => {
        if (isAtCheckpoint && !chatInputFocused && currentPlayer?.alive === true)
            setIsCheckpointMenuOpen(open => !open);
    }, [isAtCheckpoint, chatInputFocused, currentPlayer?.alive]);

    const movementEnabled = isGameReady && hasLiveGameState && currentPlayer?.alive === true &&
        !gameResult && !gameError && !chatInputFocused && !isCheckpointMenuOpen;
    const {setJoystickMovement, pressAction, releaseAction} = usePlayerInput({
        socket,
        roomId: currentRoom?.id,
        enabled: movementEnabled,
        actionsEnabled: movementEnabled,
    });

    useEffect(() =>
    {
        function handleKeyDown(event)
        {
            // SAFETY: Shop hotkeys only at checkpoint
            if (!isAtCheckpoint || chatInputFocused)
                return;
            if (event.key.toLowerCase() === 'e') {
                event.preventDefault();
                if (!event.repeat)
                    toggleCheckpointMenu();
                return;
            }
            if (isCheckpointMenuOpen) {
                const tryBuy = (skill) => {
                    // SAFETY: Hotkeys obey same affordability rules
                    if (skill === 'health') {
                        if (currentGold >= HEALTH_UPGRADE_COST)
                            selectCheckpointUpgrade(skill);
                        return;
                    }
                    const level = skillLevels[skill] ?? 0;
                    const cost = getUpgradeCost(level);
                    if (level < MAX_SKILL_LEVEL && currentGold >= cost) {
                        selectCheckpointUpgrade(skill);
                    }
                };

                if (event.key === "1")
                    tryBuy('melee');
                if (event.key === "2")
                    tryBuy('ranged');
                if (event.key === "3")
                    tryBuy('shield');
                if (event.key === "4")
                    tryBuy('health');
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isAtCheckpoint, isCheckpointMenuOpen, chatInputFocused, currentGold, skillLevels, selectCheckpointUpgrade, toggleCheckpointMenu]);

    if (!hasRoom)
    {
        // FALLBACK: Game route opened without room
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
        // FALLBACK: Show recoverable game error
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
        // DECISION: Final result replaces live canvas
        return (
            <div className="game-fullscreen">
                <PageHeading title={title} description={description} />
                <div className="game-fullscreen-panel">
                    <GameCanvas
                        currentPlayerId={currentPlayerId}
                        gameMap={gameMap}
                        gameStore={gameStore}
                        goldFeedbacks={goldFeedbacks}
                        socket={socket}
                    />
                    <section className="game-end-overlay" aria-label="Game result">
                        <div className="game-panel game-end-card">
                            <h2>{gameResult.win ? 'Mission completed' : 'Mission failed'}</h2>
                            <div className="game-hud">
                                <p>Reason: {gameResult.reason}</p>
                                <p>Duration: {typeof gameResult.durationSeconds === 'number' ? `${gameResult.durationSeconds} seconds` : 'Unavailable'}</p>
                            </div>
                            <h3>Player statistics</h3>
                            {playerStats.length > 0 ? (
                                <div className="game-end-table-wrap">
                                    <table className="game-stats-table table table-dark table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Player</th>
                                                <th>Deaths</th>
                                                <th>Damage dealt</th>
                                                <th>Damage received</th>
                                                <th>Total gold earned</th>
                                                <th>Life</th>
                                                <th>Connection</th>
                                                <th>  Melee   </th>
                                                <th>  Ranged  </th>
                                                <th>  Shield  </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {playerStats.map((player) => (
                                                <tr key={player.playerId}>
                                                    <td>{player.username ?? `Player ${player.playerId}`}</td>
                                                    <td>{player.deaths ?? 0}</td>
                                                    <td>{player.damageDealt ?? 0}</td>
                                                    <td>{player.damageReceived ?? 0}</td>
                                                    <td>{player.goldEarned ?? 0}</td>
                                                    <td>{player.alive ? 'Alive' : 'Dead'}</td>
                                                    <td>{player.disconnected ? 'Disconnected' : 'Connected'}</td>
                                                    <td>Lvl <br />{player.upgrades?.melee ?? 0} / 3</td>
                                                    <td>Lvl <br />{player.upgrades?.ranged ?? 0} / 3</td>
                                                    <td>Lvl <br />{player.upgrades?.shield ?? 0} / 3</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="game-muted">No player statistics received.</p>}
                            <div className="game-end-actions">
                                <button type="button" onClick={() => { window.location.hash = '#/room'; }}>Back to room</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }
    if (isStarting)
    {
        return (
            <>
                <PageHeading title={title} description={description} />
                <div className="game-panel">
                    <h2>Game starting...</h2>
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
                        <span className="game-hud-room">Room: {currentRoom.name || currentRoom.id}</span>
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
                        disabled={!movementEnabled}
                        onPress={pressAction}
                        onRelease={releaseAction}
                    />
                    <SkillSlot
                        skill="ranged"
                        hotkey="K"
                        lvl={skillLevels.ranged}
                        cooldown={currentPlayer?.cooldowns?.ranged ?? 0}
                        disabled={!movementEnabled}
                        onPress={pressAction}
                        onRelease={releaseAction}
                    />
                    <SkillSlot
                        skill="shield"
                        hotkey="L"
                        lvl={skillLevels.shield}
                        cooldown={currentPlayer?.cooldowns?.shield ?? 0}
                        disabled={!movementEnabled}
                        onPress={pressAction}
                        onRelease={releaseAction}
                    />
                </section>
                <div className="game-fullscreen-panel">
                <GameCanvas
                    currentPlayerId={currentPlayerId}
                    gameMap={gameMap}
                    gameStore={gameStore}
                    goldFeedbacks={goldFeedbacks}
                    socket={socket}
                />

                <MobileJoystick
                    key={currentRoom.id}
                    enabled={movementEnabled}
                    onMovement={setJoystickMovement}
                />

                {isAtCheckpoint && !isCheckpointMenuOpen && (
                    <div className="shop-prompt">
                        <span>Appuyer sur <kbd>E</kbd> ou</span>
                        <button
                            type="button"
                            onClick={toggleCheckpointMenu}
                            disabled={chatInputFocused || currentPlayer?.alive !== true}
                            aria-label="Ouvrir le shop"
                            aria-expanded={false}
                            aria-controls="game-shop"
                        >ici</button>
                    </div>
                )}

                {isAtCheckpoint && isCheckpointMenuOpen && (
                    <section
                        className="checkpoint-upgrade"
                        aria-label="Choose an upgrade"
                        id="game-shop"
                    >
                        <button type="button" className="shop-close" onClick={toggleCheckpointMenu}>
                            Fermer
                        </button>
                        <div className="checkpoint-upgrade-list">
                            {renderUpgradeButton('melee', 'Melee', '1')}
                            {renderUpgradeButton('ranged', 'Ranged', '2')}
                            {renderUpgradeButton('shield', 'Shield', '3')}
                            {renderUpgradeButton('health', 'Health', '4')}
                        </div>

                        {checkpointError && (
                            <p className="checkpoint-upgrade-status room-error">
                                {checkpointError}
                            </p>
                        )}
                    </section>
                )}
                <button type="button" className="game-leave-button" onClick={onLeaveGame}>Leave game</button>
            </div>
        </div>
    );
}
