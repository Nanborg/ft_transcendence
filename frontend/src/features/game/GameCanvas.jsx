import { useEffect, useRef } from 'react';
import { ENTITY_TYPE, PLAYER_ACTION } from './gameProtocol';
import { drawDebugHitboxesIfEnabled, handleDebugHitboxKeyDown } from './debugHitboxes'; //test-nico-hitbox
import {
    CANVAS_WIDTH,
    MIN_CANVAS_HEIGHT,
    MAX_CANVAS_HEIGHT,
    INTERPOLATION_DURATION_MS,
    WALL_TILE_SOURCE_SIZE,
    wallRuinsSprite,
} from './canvas/spriteAssets';
import { getEntityType, getPlayerDirectionRow, getDirectionRowToward } from './canvas/spriteUtils';
import { getInterpolatedPosition, getFocusPosition, getCamera, worldToScreen } from './canvas/cameraUtils';
import { getPlayerSpriteTint, getPlayerAttackDuration } from './canvas/playerSprite';
import { drawGrid, drawGoldFeedbacks, drawShieldBreakEffects } from './canvas/effects';
import { drawEntity, drawStaticMapEntities } from './canvas/entityRenderer';
import gameSoilUrl from '../../assets/game/game_soil.png';

function drawMapBackgroundImage(context, image, camera, gameMap)
{
    // FALLBACK: Skip texture until image is loaded.
    if (!image?.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0)
        return;
    if (!(gameMap?.scale > 0))
        return;
    const textureWorldSize = gameMap.scale * 16;
    // PERF: Draw only visible repeated tiles.
    const texturePixls = textureWorldSize * camera.scale;
    const firstCol = Math.floor(camera.left / textureWorldSize);
    const lastCol = Math.floor(camera.right / textureWorldSize);
    const firstRow = Math.floor(camera.top / textureWorldSize);
    const lastRow = Math.floor(camera.bottom / textureWorldSize);
    for (let row = firstRow; row <= lastRow; row++)
    {
        for (let col = firstCol; col <= lastCol; col++)
        {
            const worldX = col * textureWorldSize;
            const worldY = row * textureWorldSize;
            const drawX = camera.offsetX + (worldX - camera.left) * camera.scale;
            const drawY = camera.offsetY + (worldY - camera.top) * camera.scale;
            context.drawImage(
                image,
                drawX,
                drawY,
                texturePixls,
                texturePixls
            );
        }
    }
}

function isMapWall(rows, row, col)
{
    // SAFETY: Mask lookup can ask outside grid.
    if (row < 0 || row >= rows.length)
        return false;
    const line = rows[row];
    if (typeof line !== 'string')
        return false;
    return line[col] === '#';
}

function getMapWallMask(rows, row, col)
{
    // DECISION: Bitmask selects wall autotile.
    let mask = 0;
    if (isMapWall(rows, row - 1, col))
        mask |= 1;
    if (isMapWall(rows, row, col + 1))
        mask |= 2;
    if (isMapWall(rows, row + 1, col))
        mask |= 4;
    if (isMapWall(rows, row, col - 1))
        mask |= 8;
    return mask;
}

function getActionCooldownKey(action)
{
    // SYNC: Cooldowns are stored by skill name.
    if (action === PLAYER_ACTION.MELEE)
        return 'melee';
    if (action === PLAYER_ACTION.RANGED)
        return 'ranged';
    return null;
}

function drawMapWalls(context, gameMap, camera)
{
    // SAFETY: Walls need map rows and scale.
    if (!Array.isArray(gameMap?.rows) || !(gameMap?.scale > 0))
        return;
    const rows = gameMap.rows;
    const tilePixels = gameMap.scale * camera.scale;
    const firstRow = Math.max(0, Math.floor(camera.top / gameMap.scale));
    const lastRow = Math.min(rows.length - 1, Math.ceil(camera.bottom / gameMap.scale));

    for (let row = firstRow; row <= lastRow; row++)
    {
        const line = rows[row];
        if (typeof line !== 'string')
            continue;
        const firstCol = Math.max(0, Math.floor(camera.left / gameMap.scale));
        const lastCol = Math.min(line.length - 1, Math.ceil(camera.right / gameMap.scale));
        for (let col = firstCol; col <= lastCol; col++)
        {
            const cell = line[col];
            const x = camera.offsetX + (col * gameMap.scale - camera.left) * camera.scale;
            const y = camera.offsetY + (row * gameMap.scale - camera.top) * camera.scale;
            if (cell === 'X')
                continue;

            if (cell !== '#')
                continue;

            if (!wallRuinsSprite.complete || wallRuinsSprite.naturalWidth <= 0)
            {
                // FALLBACK: Solid wall before sprite load.
                context.fillStyle = '#334155';
                context.fillRect(
                    x,
                    y,
                    tilePixels,
                    tilePixels
                );
                continue;
            }

            const mask = getMapWallMask(rows, row, col);
            const sourceColumn = mask % 4;
            const sourceRow = Math.floor(mask / 4);
            const wallPixels = tilePixels * 2;
            const wallOffset = (wallPixels - tilePixels) / 2;

            context.drawImage(
                wallRuinsSprite,
                sourceColumn * WALL_TILE_SOURCE_SIZE,
                sourceRow * WALL_TILE_SOURCE_SIZE,
                WALL_TILE_SOURCE_SIZE,
                WALL_TILE_SOURCE_SIZE,
                x - wallOffset,
                y - wallOffset,
                wallPixels,
                wallPixels
            );
        }
    }
}

export function GameCanvas({currentPlayerId, gameMap, gameEntities, deletedGameEntities = [], gamePlayerData, goldFeedbacks = [], socket})
{
    const canvasRef = useRef(null);
    const gameSoilImageRef = useRef(null);
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

    // DECISION: Canvas world uses fixed internal width.
    const width = CANVAS_WIDTH;
    let mapAspectRatio = 0.5625;
    if (gameMap?.width > 0 && gameMap?.height > 0)
    {
        mapAspectRatio = gameMap.height / gameMap.width;
    }

    const height = Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, Math.round(width * mapAspectRatio)));

    renderDataRef.current = {
        // SYNC: Render loop reads latest props from ref.
        currentPlayerId,
        gameMap,
        gamePlayerData: [],
        goldFeedbacks: [],
    };
    if (Array.isArray(gamePlayerData))
    {
        renderDataRef.current.gamePlayerData = gamePlayerData;
    }
    if (Array.isArray(goldFeedbacks))
    {
        renderDataRef.current.goldFeedbacks = goldFeedbacks;
    }

    useEffect(() =>
    {
        // REQUIRED: Background image loads outside render loop.
        const image = new Image();
        image.src = gameSoilUrl;
        gameSoilImageRef.current = image;
        return () =>
        {
            if (gameSoilImageRef.current === image)
                gameSoilImageRef.current = null;
        };
    }, []);

    useEffect(() =>
    {
        function handleKeyDown(event)
        {
            // DEBUG: Toggle hitboxes without UI controls.
            if (handleDebugHitboxKeyDown(event, debugHitboxesRef)) //test-nico-hitbox
                return;

            const players = renderDataRef.current.gamePlayerData;
            const myPlayer = players.find((p) => String(p.playerId) === String(currentPlayerId));
            if (myPlayer && myPlayer.alive === false)
            {
                // DECISION: Dead players can spectate alive ones.
                const alivePlayers = players.filter((p) => p.alive === true);

                if (alivePlayers.length > 0)
                {
                    if (event.key === 'd' || event.key === 'D')
                    {
                        spectatorIndexRef.current += 1;
                        if (alivePlayers.length <= spectatorIndexRef.current)
                        {
                            spectatorIndexRef.current = 0;
                        }
                    }
                    if (event.key === 'a' || event.key === 'A')
                    {
                        spectatorIndexRef.current -= 1;
                        if (spectatorIndexRef.current < 0)
                        {
                            spectatorIndexRef.current = alivePlayers.length - 1;
                        }
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
            // SYNC: Input event triggers local attack anim.
            const action = payload?.input?.action;
            if (typeof payload?.playerId === 'undefined' || (action !== PLAYER_ACTION.MELEE && action !== PLAYER_ACTION.RANGED))
                return;
            const cooldownKey = getActionCooldownKey(action);
            const playerData = renderDataRef.current.gamePlayerData.find((player) => String(player.playerId) === String(payload.playerId));
            const cooldown = Number(playerData?.cooldowns?.[cooldownKey]) || 0;
            if (cooldown > 0)
                // SAFETY: Cooldown blocks fake animations.
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
        // SYNC: Deleted shield entities become VFX.
        if (!Array.isArray(deletedGameEntities))
            return;
        if (deletedGameEntities.length === 0)
        {
            shieldBreakEffectsRef.current.clear();
            return;
        }
        const now = performance.now();
        deletedGameEntities.forEach((entity) =>
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
        // SYNC: Server snapshots update render tracks.
        if (!Array.isArray(gameEntities))
            return;

        const now = performance.now();
        const receivedEntityIds = new Set();
        let teleportDistance = 150;
        if (gameMap?.scale > 0)
        {
            // DECISION: Large jumps snap instead of lerp.
            teleportDistance = gameMap.scale * 3;
        }

        gameEntities.forEach((entity) =>
        {
            if (!entity || typeof entity.entityId !== 'number' || typeof entity.posX !== 'number' || typeof entity.posY !== 'number')
                return;

            receivedEntityIds.add(entity.entityId);

            const previousTrack = entityTracksRef.current.get(entity.entityId);

            if (previousTrack && previousTrack.targetX === entity.posX && previousTrack.targetY === entity.posY)
            {
                // PERF: Reuse track when position unchanged.
                previousTrack.directionRow = getPlayerDirectionRow(entity, previousTrack.directionRow);
                previousTrack.entity = entity;
                return;
            }

            const currentPosition = { x: entity.posX, y: entity.posY };
            if (previousTrack)
            {
                // SYNC: Continue from interpolated position.
                const interpolated = getInterpolatedPosition(previousTrack, now);
                currentPosition.x = interpolated.x;
                currentPosition.y = interpolated.y;
            }

            const distance = Math.hypot(entity.posX - currentPosition.x, entity.posY - currentPosition.y);

            const mustTeleport = !previousTrack || distance >= teleportDistance;
            const directionRow = getPlayerDirectionRow(entity, previousTrack?.directionRow ?? 0);
            let duration = INTERPOLATION_DURATION_MS;
            if (mustTeleport)
            {
                // SAFETY: Teleport avoids long wrong lerp.
                duration = 0;
            }

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
            // SYNC: Remove entities missing from snapshot.
            if (!receivedEntityIds.has(entityId))
            {
                entityTracksRef.current.delete(entityId);
            }
        });
    }, [gameEntities, gameMap?.scale]);

    useEffect(() =>
    {
        let animationFrameId;
        function render(now)
        {
            // PERF: One animation loop owns canvas drawing.
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const rect = canvas.getBoundingClientRect();
            const nextWidth = Math.max(1, Math.round(rect.width));
            const nextHeight = Math.max(1, Math.round(rect.height));
            if (canvas.width !== nextWidth || canvas.height !== nextHeight)
            {
                // SYNC: Canvas buffer follows CSS size.
                canvas.width = nextWidth;
                canvas.height = nextHeight;
            }
            const context = canvas.getContext('2d');
            const renderData = renderDataRef.current;
            const localPlayer = renderData.gamePlayerData.find((player) => String(player.playerId) === String(renderData.currentPlayerId));
            let localEntityId = localPlayer?.playerEntityId;
            if (typeof localEntityId !== 'number')
            {
                // FALLBACK: Focus first player if mapping missing.
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
                // SYNC: Camera follows player or spectator target.
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
            drawMapBackgroundImage(context, gameSoilImageRef.current, camera, renderData.gameMap);
            drawGrid(context, canvas, camera);
            drawMapWalls(context, renderData.gameMap, camera);
            drawStaticMapEntities({
                context,
                gameMap: renderData.gameMap,
                camera,
                now,
            });
            entityTracksRef.current.forEach((track) =>
            {
                const entityType = getEntityType(track.entity);
                if  (entityType === ENTITY_TYPE.WALL || entityType === ENTITY_TYPE.CHECKPOINT || entityType === ENTITY_TYPE.SPAWN_POINT)
                    // DECISION: Static map entities draw earlier.
                    return;
                const playerData = renderData.gamePlayerData.find((player) => String(player.playerEntityId) === String(track.entity.entityId));
                let playerId = playerData?.playerId ?? null;
                if (playerId === null && track.entity.entityId === localEntityId)
                {
                    playerId = renderData.currentPlayerId;
                }
                let playerSpriteTint = null;
                if (entityType === ENTITY_TYPE.PLAYER)
                {
                    // DECISION: Tint distinguishes players.
                    playerSpriteTint = getPlayerSpriteTint(track.entity.state?.playerId);
                }
                let attack = null;
                if (playerId !== null)
                {
                    attack = playerAttackRef.current.get(String(playerId));
                }
                if (attack && now - attack.startedAt >= getPlayerAttackDuration(attack.action))
                {
                    // SYNC: Attack animation expires locally.
                    playerAttackRef.current.delete(String(playerId));
                    attack = null;
                }
                const position = getInterpolatedPosition(track, now);
                const facesPlayer = entityType === ENTITY_TYPE.TANK_ROBOT || entityType === ENTITY_TYPE.BOSS;
                let renderDirectionRow = track.directionRow;
                if (facesPlayer)
                {
                    // DECISION: Heavy enemies face camera focus.
                    renderDirectionRow = getDirectionRowToward(position, focusPosition, track.directionRow);
                }
                let spriteDirectionRow = renderDirectionRow;
                if (attack)
                {
                    // SYNC: Attack keeps initial direction.
                    if (!Number.isInteger(attack.directionRow))
                    {
                        attack.directionRow = renderDirectionRow;
                    }
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
            drawGoldFeedbacks({ context, tracks: entityTracksRef.current, feedbacks: renderData.goldFeedbacks, camera, now });
            const myPlayer = renderData.gamePlayerData.find((p) => String(p.playerId) === String(renderData.currentPlayerId));
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
