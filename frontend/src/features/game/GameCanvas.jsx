import { useEffect, useRef } from 'react';
import { ENTITY_TYPE } from './gameProtocol';

const CANVAS_WIDTH = 800;
const MIN_CANVAS_HEIGHT = 450;
const MAX_CANVAS_HEIGHT = 800;
const VIEW_WIDTH_IN_TILES = 20;
const INTERPOLATION_DURATION_MS = 100;
const STATIC_MAP_ENTITY_TYPES = new Set([
    ENTITY_TYPE.WALL,
    ENTITY_TYPE.CHECKPOINT,
    ENTITY_TYPE.SPAWN_POINT,
]);

function getInterpolatedPosition(track, now) {
    if (track.duration === 0) {
        return {
            x: track.targetX,
            y: track.targetY,
        };
    }

    const progress = Math.min(
        1,
        (now - track.startedAt) / track.duration
    );

    return {
        x:
            track.fromX +
            (track.targetX - track.fromX) * progress,
        y:
            track.fromY +
            (track.targetY - track.fromY) * progress,
    };
}

function getEntityType(entity) {
    return entity.typeId ?? entity.entityTypeId;
}

function getFocusPosition({
    tracks,
    playerData,
    currentPlayerId,
    now,
    gameMap,
}) {
    const localPlayer = playerData.find(
        player =>
            String(player.playerId) ===
            String(currentPlayerId)
    );

    const localEntityId = localPlayer?.playerEntityId;

    if (typeof localEntityId === 'number') {
        const localTrack = tracks.get(localEntityId);

        if (localTrack)
            return getInterpolatedPosition(localTrack, now);
    }

    for (const track of tracks.values()) {
        if (getEntityType(track.entity) === ENTITY_TYPE.PLAYER)
            return getInterpolatedPosition(track, now);
    }

    return {
        x: (gameMap?.width ?? 0) / 2,
        y: (gameMap?.height ?? 0) / 2,
    };
}

function getCamera({
    canvas,
    gameMap,
    focusPosition,
}) {
    const worldWidth =
        gameMap?.width > 0
            ? gameMap.width
            : canvas.width;

    const worldHeight =
        gameMap?.height > 0
            ? gameMap.height
            : canvas.height;

    const tileSize =
        gameMap?.scale > 0
            ? gameMap.scale
            : Math.max(1, worldWidth / 50);

    const wantedViewWidth = Math.min( worldWidth, tileSize * VIEW_WIDTH_IN_TILES);
    const wantedViewHeight = wantedViewWidth * (canvas.height / canvas.width);
    const scale = Math.min( canvas.width / wantedViewWidth, canvas.height / wantedViewHeight);
    const viewportWidth = canvas.width / scale;
    const viewportHeight = canvas.height / scale;
    const maxLeft = Math.max(0, worldWidth - viewportWidth);
    const maxTop = Math.max(0, worldHeight - viewportHeight);

    const left = Math.max(
        0,
        Math.min(
            maxLeft,
            focusPosition.x - viewportWidth / 2
        )
    );

    const top = Math.max(
        0,
        Math.min(
            maxTop,
            focusPosition.y - viewportHeight / 2
        )
    );

    return {
        left,
        top,
        right: left + viewportWidth,
        bottom: top + viewportHeight,
        scale,
        offsetX: (canvas.width - viewportWidth * scale) / 2,
        offsetY: (canvas.height - viewportHeight * scale) / 2,
        tileSize,
    };
}

function worldToScreen(position, camera) {
    return {
        x: camera.offsetX + (position.x - camera.left) * camera.scale,
        y: camera.offsetY + (position.y - camera.top) * camera.scale,
    };
}

function drawGrid(context, canvas, camera) {
    const tilePixels = camera.tileSize * camera.scale;

    if (tilePixels < 4)
        return;

    const firstColumn =
        Math.ceil(camera.left / camera.tileSize);
    const lastColumn =
        Math.floor(camera.right / camera.tileSize);
    const firstRow =
        Math.ceil(camera.top / camera.tileSize);
    const lastRow =
        Math.floor(camera.bottom / camera.tileSize);

    context.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    context.lineWidth = 1;
    context.beginPath();

    for (
        let column = firstColumn;
        column <= lastColumn;
        column += 1
    ) {
        const x =
            camera.offsetX + (column * camera.tileSize - camera.left) * camera.scale;

        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }

    for (
        let row = firstRow;
        row <= lastRow;
        row += 1
    ) {
        const y =
            camera.offsetY + (row * camera.tileSize - camera.top) * camera.scale;

        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
    }

    context.stroke();
}

function drawDiamond(context, x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y - radius);
    context.lineTo(x + radius, y);
    context.lineTo(x, y + radius);
    context.lineTo(x - radius, y);
    context.closePath();
    context.fill();
}

function drawEntity({
    context,
    entity,
    position,
    camera,
}) {
    const type = getEntityType(entity);
    const screen = worldToScreen(position, camera);
    const tilePixels = camera.tileSize * camera.scale;
    const entityPixels = Math.max(
        8,
        Math.min(48, tilePixels)
    );

    const margin = tilePixels * 2;

    if (
        screen.x < -margin ||
        screen.y < -margin ||
        screen.x > context.canvas.width + margin ||
        screen.y > context.canvas.height + margin
    ) {
        return;
    }

    context.save();

    switch (type) {
        case ENTITY_TYPE.WALL:
            context.fillStyle = '#334155';
            context.strokeStyle = '#64748b';
            context.lineWidth = 1;
            context.fillRect(
                screen.x - tilePixels / 2,
                screen.y - tilePixels / 2,
                tilePixels,
                tilePixels
            );
            context.strokeRect(
                screen.x - tilePixels / 2,
                screen.y - tilePixels / 2,
                tilePixels,
                tilePixels
            );
            break;

        case ENTITY_TYPE.PLAYER:
            context.shadowColor = '#22c55e';
            context.shadowBlur = 12;
            context.fillStyle = '#22c55e';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.34,
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.WALKING_ROBOT:
            context.fillStyle = '#ef4444';
            context.fillRect(
                screen.x - entityPixels * 0.3,
                screen.y - entityPixels * 0.3,
                entityPixels * 0.6,
                entityPixels * 0.6
            );
            break;

        case ENTITY_TYPE.SHOOTING_ROBOT:
            drawDiamond(
                context,
                screen.x,
                screen.y,
                entityPixels * 0.38,
                '#f97316'
            );
            break;

        case ENTITY_TYPE.TANK_ROBOT:
            context.fillStyle = '#eab308';
            context.strokeStyle = '#fef08a';
            context.lineWidth = 3;
            context.fillRect(
                screen.x - entityPixels * 0.42,
                screen.y - entityPixels * 0.42,
                entityPixels * 0.84,
                entityPixels * 0.84
            );
            context.strokeRect(
                screen.x - entityPixels * 0.42,
                screen.y - entityPixels * 0.42,
                entityPixels * 0.84,
                entityPixels * 0.84
            );
            break;

        case ENTITY_TYPE.BOSS:
            context.shadowColor = '#d946ef';
            context.shadowBlur = 18;
            drawDiamond(
                context,
                screen.x,
                screen.y,
                entityPixels * 0.8,
                '#a855f7'
            );
            break;

        case ENTITY_TYPE.LASER_SLASH:
            context.strokeStyle = '#fb7185';
            context.lineWidth = 5;
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.6,
                -Math.PI * 0.75,
                Math.PI * 0.25
            );
            context.stroke();
            break;

        case ENTITY_TYPE.LASER_PROJECTILE:
            context.shadowColor = '#22d3ee';
            context.shadowBlur = 10;
            context.fillStyle = '#67e8f9';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                Math.max(3, entityPixels * 0.12),
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.LASER_SHIELD:
            context.shadowColor = '#60a5fa';
            context.shadowBlur = 12;
            context.strokeStyle = '#93c5fd';
            context.lineWidth = 4;
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.55,
                0,
                Math.PI * 2
            );
            context.stroke();
            break;

        case ENTITY_TYPE.BOSS_PROJECTILE:
            context.shadowColor = '#c084fc';
            context.shadowBlur = 12;
            context.fillStyle = '#d8b4fe';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                Math.max(4, entityPixels * 0.18),
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.CHECKPOINT:
            context.shadowColor = '#facc15';
            context.shadowBlur = 14;
            drawDiamond(
                context,
                screen.x,
                screen.y,
                entityPixels * 0.35,
                '#facc15'
            );
            break;

        case ENTITY_TYPE.SPAWN_POINT:
            context.strokeStyle = '#38bdf8';
            context.lineWidth = 3;
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.3,
                0,
                Math.PI * 2
            );
            context.stroke();
            break;

        default:
            context.fillStyle = '#94a3b8';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.2,
                0,
                Math.PI * 2
            );
            context.fill();
    }

    context.restore();
}

function drawStaticMapEntities({
    context,
    gameMap,
    camera,
}) {
    if (!Array.isArray(gameMap?.entities))
        return;
    gameMap.entities.forEach(entity => {
        if (
            !entity ||
            !STATIC_MAP_ENTITY_TYPES.has(getEntityType(entity)) ||
            typeof entity.posX !== 'number' ||
            typeof entity.posY !== 'number'
        ) {
            return;
        }
        drawEntity({
            context,
            entity,
            position: {
                x: entity.posX,
                y: entity.posY,
            },
            camera,
        });
    });
}

export function GameCanvas({
    currentPlayerId,
    gameMap,
    gameEntities,
    gamePlayerData,
}) {
    const canvasRef = useRef(null);
    const entityTracksRef = useRef(new Map());
    const renderDataRef = useRef({
        currentPlayerId,
        gameMap,
        gamePlayerData,
    });

    const width = CANVAS_WIDTH;
    const mapAspectRatio =
        gameMap?.width > 0 && gameMap?.height > 0
            ? gameMap.height / gameMap.width
            : 0.5625;

    const height = Math.max(
        MIN_CANVAS_HEIGHT,
        Math.min(
            MAX_CANVAS_HEIGHT,
            Math.round(width * mapAspectRatio)
        )
    );

    renderDataRef.current = {
        currentPlayerId,
        gameMap,
        gamePlayerData: Array.isArray(gamePlayerData)
            ? gamePlayerData
            : [],
    };

    useEffect(() => {
        if (!Array.isArray(gameEntities))
            return;

        const now = performance.now();
        const receivedEntityIds = new Set();
        const teleportDistance =
            gameMap?.scale > 0
                ? gameMap.scale * 3
                : 150;

        gameEntities.forEach(entity => {
            if (
                !entity ||
                typeof entity.entityId !== 'number' ||
                typeof entity.posX !== 'number' ||
                typeof entity.posY !== 'number'
            ) {
                return;
            }

            receivedEntityIds.add(entity.entityId);

            const previousTrack =
                entityTracksRef.current.get(entity.entityId);

            if (
                previousTrack &&
                previousTrack.targetX === entity.posX &&
                previousTrack.targetY === entity.posY
            ) {
                previousTrack.entity = entity;
                return;
            }

            const currentPosition = previousTrack
                ? getInterpolatedPosition(previousTrack, now)
                : {
                    x: entity.posX,
                    y: entity.posY,
                };

            const distance = Math.hypot(
                entity.posX - currentPosition.x,
                entity.posY - currentPosition.y
            );

            const mustTeleport =
                !previousTrack ||
                distance >= teleportDistance;

            entityTracksRef.current.set(entity.entityId, {
                entity,
                fromX: mustTeleport
                    ? entity.posX
                    : currentPosition.x,
                fromY: mustTeleport
                    ? entity.posY
                    : currentPosition.y,
                targetX: entity.posX,
                targetY: entity.posY,
                startedAt: now,
                duration: mustTeleport
                    ? 0
                    : INTERPOLATION_DURATION_MS,
            });
        });

        entityTracksRef.current.forEach((track, entityId) => {
            if (!receivedEntityIds.has(entityId))
                entityTracksRef.current.delete(entityId);
        });
    }, [gameEntities, gameMap?.scale]);

    useEffect(() => {
        let animationFrameId;
        function render(now) {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const rect = canvas.getBoundingClientRect();
            const nextWidth = Math.max(1, Math.round(rect.width));
            const nextHeight = Math.max(1, Math.round(rect.height));
            if ( canvas.width !== nextWidth || canvas.height !== nextHeight)
                {
                    canvas.width = nextWidth;
                    canvas.height = nextHeight;
                }
            const context = canvas.getContext('2d');
            const renderData = renderDataRef.current;
            const focusPosition = getFocusPosition({
                tracks: entityTracksRef.current,
                playerData: renderData.gamePlayerData,
                currentPlayerId:
                    renderData.currentPlayerId,
                now,
                gameMap: renderData.gameMap,
            });
            const camera = getCamera({
                canvas,
                gameMap: renderData.gameMap,
                focusPosition,
            });
            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
            context.fillStyle = '#020617';
            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
            drawGrid(context, canvas, camera);
            drawStaticMapEntities({
                context,
                gameMap: renderData.gameMap,
                camera,
            });
            entityTracksRef.current.forEach(track => {
                drawEntity({
                    context,
                    entity: track.entity,
                    position: getInterpolatedPosition(
                        track,
                        now
                    ),
                    camera,
                });
            });
            animationFrameId =
                requestAnimationFrame(render);
        }
        animationFrameId = requestAnimationFrame(render);
        return () => {
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
