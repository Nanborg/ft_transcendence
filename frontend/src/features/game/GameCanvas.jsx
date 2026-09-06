import { useEffect, useRef } from 'react';
import { ENTITY_TYPE, PLAYER_ACTION } from './gameProtocol';
import { drawDebugHitboxesIfEnabled, handleDebugHitboxKeyDown } from './debugHitboxes'; //test-nico-hitbox
import {
    CANVAS_WIDTH,
    MIN_CANVAS_HEIGHT,
    MAX_CANVAS_HEIGHT,
    INTERPOLATION_DURATION_MS,
} from './canvas/spriteAssets';
import { getEntityType, getPlayerDirectionRow, getDirectionRowToward } from './canvas/spriteUtils';
import { getInterpolatedPosition, getFocusPosition, getCamera, worldToScreen } from './canvas/cameraUtils';
import { getPlayerSpriteTint, getPlayerAttackDuration } from './canvas/playerSprite';
import { drawGrid, drawGoldFeedbacks, drawShieldBreakEffects } from './canvas/effects';
import { drawEntity, drawStaticMapEntities } from './canvas/entityRenderer';

export function GameCanvas({currentPlayerId, gameMap, gameEntities, deletedGameEntities = [], gamePlayerData, goldFeedbacks = [], socket})
{
    const canvasRef = useRef(null);
    const entityTracksRef = useRef(new Map());
    const maxHealthRef = useRef(new Map());
    const playerAttackRef = useRef(new Map());
    const renderDataRef = useRef({
        currentPlayerId,
        gameMap,
        gamePlayerData,
    });
    const spectatorIndexRef = useRef(0);
    const shieldBreakEffectsRef = useRef(new Map());
    const debugHitboxesRef = useRef(false); //test-nico-hitbox

    const width = CANVAS_WIDTH;
    let mapAspectRatio = 0.5625;
    if (gameMap?.width > 0 && gameMap?.height > 0)
        mapAspectRatio = gameMap.height / gameMap.width;

    const height = Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, Math.round(width * mapAspectRatio)));

    renderDataRef.current = {
        currentPlayerId,
        gameMap,
        gamePlayerData: [],
        goldFeedbacks: [],
    };
    if (Array.isArray(gamePlayerData))
        renderDataRef.current.gamePlayerData = gamePlayerData;
    if (Array.isArray(goldFeedbacks))
        renderDataRef.current.goldFeedbacks = goldFeedbacks;

    useEffect(() =>
    {
        function handleKeyDown(event)
        {
            if (handleDebugHitboxKeyDown(event, debugHitboxesRef)) //test-nico-hitbox
                return;

            const players = renderDataRef.current.gamePlayerData;
            const myPlayer = players.find(p => String(p.playerId) === String(currentPlayerId));
            if (myPlayer && myPlayer.alive === false)
            {
                const alivePlayers = players.filter(p => p.alive === true);

                if (alivePlayers.length > 0)
                {
                    if (event.key === 'd' || event.key === 'D')
                    {
                        spectatorIndexRef.current += 1;
                        if (alivePlayers.length <= spectatorIndexRef.current)
                            spectatorIndexRef.current = 0;
                    }
                    if (event.key === 'a' || event.key === 'A')
                    {
                        spectatorIndexRef.current -= 1;
                        if (spectatorIndexRef.current < 0)
                            spectatorIndexRef.current = alivePlayers.length - 1;
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () =>
        {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPlayerId]);
    useEffect(() =>
    {
        if (!socket)
            return undefined;
        function handlePlayerInput(payload)
        {
            const action = payload?.input?.action;
            if (typeof payload?.playerId === 'undefined' || (action !== PLAYER_ACTION.MELEE && action !== PLAYER_ACTION.RANGED))
                return;
            playerAttackRef.current.set(String(payload.playerId), {action, startedAt: performance.now()});
        }
        socket.on('player:input', handlePlayerInput);
        return () =>
        {
            socket.off('player:input', handlePlayerInput);
            playerAttackRef.current.clear();
        };
    }, [socket]);

    useEffect(() =>
    {
        if (!Array.isArray(deletedGameEntities))
            return;
        if (deletedGameEntities.length === 0)
        {
            shieldBreakEffectsRef.current.clear();
            return;
        }
        const now = performance.now();
        deletedGameEntities.forEach(entity =>
        {
            if (
                !entity ||
                typeof entity.entityId !== 'number' ||
                getEntityType(entity) !== ENTITY_TYPE.LASER_SHIELD ||
                typeof entity.health !== 'number' ||
                entity.health > 0 ||
                typeof entity.posX !== 'number' ||
                typeof entity.posY !== 'number'
            )
            {
                return;
            }
            shieldBreakEffectsRef.current.set(entity.entityId, {
                posX: entity.posX,
                posY: entity.posY,
                startedAt: now,
            });
        });
    }, [deletedGameEntities]);

    useEffect(() =>
    {
        if (!Array.isArray(gameEntities))
            return;

        const now = performance.now();
        const receivedEntityIds = new Set();
        let teleportDistance = 150;
        if (gameMap?.scale > 0)
            teleportDistance = gameMap.scale * 3;

        gameEntities.forEach(entity =>
        {
            if (!entity || typeof entity.entityId !== 'number' || typeof entity.posX !== 'number' || typeof entity.posY !== 'number')
                return;

            receivedEntityIds.add(entity.entityId);

            const previousTrack = entityTracksRef.current.get(entity.entityId);

            if (previousTrack && previousTrack.targetX === entity.posX && previousTrack.targetY === entity.posY)
            {
                previousTrack.directionRow = getPlayerDirectionRow(entity, previousTrack.directionRow);
                previousTrack.entity = entity;
                return;
            }

            const currentPosition = { x: entity.posX, y: entity.posY };
            if (previousTrack)
            {
                const interpolated = getInterpolatedPosition(previousTrack, now);
                currentPosition.x = interpolated.x;
                currentPosition.y = interpolated.y;
            }

            const distance = Math.hypot(entity.posX - currentPosition.x, entity.posY - currentPosition.y);

            const mustTeleport = !previousTrack || distance >= teleportDistance;
            const directionRow = getPlayerDirectionRow(entity, previousTrack?.directionRow ?? 0);
            let duration = INTERPOLATION_DURATION_MS;
            if (mustTeleport)
                duration = 0;

            let fromX = currentPosition.x;
            let fromY = currentPosition.y;
            if (mustTeleport)
            {
                fromX = entity.posX;
                fromY = entity.posY;
            }

            entityTracksRef.current.set(entity.entityId, {
                entity,
                directionRow,
                fromX,
                fromY,
                targetX: entity.posX,
                targetY: entity.posY,
                startedAt: now,
                duration,
            });
        });
        entityTracksRef.current.forEach((track, entityId) =>
        {
            if (!receivedEntityIds.has(entityId))
                entityTracksRef.current.delete(entityId);
        });
    }, [gameEntities, gameMap?.scale]);

    useEffect(() =>
    {
        let animationFrameId;
        function render(now)
        {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const rect = canvas.getBoundingClientRect();
            const nextWidth = Math.max(1, Math.round(rect.width));
            const nextHeight = Math.max(1, Math.round(rect.height));
            if (canvas.width !== nextWidth || canvas.height !== nextHeight)
            {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
            }
            const context = canvas.getContext('2d');
            const renderData = renderDataRef.current;
            const localPlayer = renderData.gamePlayerData.find(player => String(player.playerId) === String(renderData.currentPlayerId));
            let localEntityId = localPlayer?.playerEntityId;
            if (typeof localEntityId !== 'number')
            {
                for (const track of entityTracksRef.current.values())
                {
                    if (getEntityType(track.entity) === ENTITY_TYPE.PLAYER)
                    {
                        localEntityId = track.entity.entityId;
                        break;
                    }
                }
            }
            const focusPosition = getFocusPosition({
                tracks: entityTracksRef.current,
                playerData: renderData.gamePlayerData,
                currentPlayerId: renderData.currentPlayerId,
                now,
                gameMap: renderData.gameMap,
                spectatorIndex: spectatorIndexRef.current,
            });
            const camera = getCamera({
                canvas,
                gameMap: renderData.gameMap,
                focusPosition,
            });
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#020617';
            context.fillRect(0, 0, canvas.width, canvas.height);
            drawGrid(context, canvas, camera);
            drawStaticMapEntities({
                context,
                gameMap: renderData.gameMap,
                camera,
                now,
            });
            const orderedPlayerIds = Array.from(entityTracksRef.current.values()).filter(track =>
                getEntityType(track.entity) === ENTITY_TYPE.PLAYER
            ).map(track => String(track.entity.entityId)).sort((firstId, secondId) =>
                firstId.localeCompare(secondId, 'en', {numeric: true}));
            entityTracksRef.current.forEach(track =>
            {
                const entityType = getEntityType(track.entity);
                const playerData = renderData.gamePlayerData.find(player => String(player.playerEntityId) === String(track.entity.entityId));
                let playerId = playerData?.playerId ?? null;
                if (playerId === null && track.entity.entityId === localEntityId)
                    playerId = renderData.currentPlayerId;
                let playerSpriteTint = null;
                if (entityType === ENTITY_TYPE.PLAYER)
                    playerSpriteTint = getPlayerSpriteTint(track.entity.entityId, orderedPlayerIds);
                let attack = null;
                if (playerId !== null)
                    attack = playerAttackRef.current.get(String(playerId));
                if (attack && now - attack.startedAt >= getPlayerAttackDuration(attack.action))
                {
                    playerAttackRef.current.delete(String(playerId));
                    attack = null;
                }
                const position = getInterpolatedPosition(track, now);
                const facesPlayer = entityType === ENTITY_TYPE.TANK_ROBOT || entityType === ENTITY_TYPE.BOSS;
                let renderDirectionRow = track.directionRow;
                if (facesPlayer)
                    renderDirectionRow = getDirectionRowToward(position, focusPosition, track.directionRow);
                let spriteDirectionRow = renderDirectionRow;
                if (attack)
                {
                    if (!Number.isInteger(attack.directionRow))
                        attack.directionRow = renderDirectionRow;
                    spriteDirectionRow = attack.directionRow;
                }
                drawEntity({
                    context,
                    entity: track.entity,
                    position,
                    camera,
                    now,
                    attack,
                    directionRow: spriteDirectionRow,
                    playerSpriteTint,
                    maxHealthRef,
                });
            });
            drawShieldBreakEffects({
                context,
                effects: shieldBreakEffectsRef.current,
                camera,
                now,
            });
            drawDebugHitboxesIfEnabled(debugHitboxesRef, context, entityTracksRef.current, renderData.gameMap, camera, now, worldToScreen, getInterpolatedPosition); //test-nico-hitbox
            drawGoldFeedbacks({context, tracks: entityTracksRef.current, feedbacks: renderData.goldFeedbacks, camera, now});
            const myPlayer = renderData.gamePlayerData.find(p => String(p.playerId) === String(renderData.currentPlayerId));
            if (myPlayer && myPlayer.alive === false)
            {
                context.fillStyle = 'red';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText('Death alive in: ' + myPlayer.death_cooldowns, canvas.width / 2, canvas.height / 2);
            }
            animationFrameId = requestAnimationFrame(render);
        }
        animationFrameId = requestAnimationFrame(render);
        return () =>
        {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="game-canvas"
            width={width}
            height={height}
            aria-label="Live game state"
        />
    );
}
