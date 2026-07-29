import { useEffect, useRef } from 'react';

const ENGINE_ENTITY_TYPE = Object.freeze({
    PLAYER: 1,
    WALL: 2,
});

const INTERPOLATION_DURATION_MS = 100;
const TELEPORT_DISTANCE = 150;

function drawSquare(context, entity, color, fallbackSize = 20) {
    const size = entity.size || fallbackSize;

    context.fillStyle = color;
    context.fillRect(
        entity.x || 0,
        entity.y || 0,
        size,
        size
    );
}

function drawCircle(context, entity, color, fallbackSize = 8) {
    const size = entity.size || fallbackSize;

    context.fillStyle = color;
    context.beginPath();
    context.arc(
        entity.x || 0,
        entity.y || 0,
        size,
        0,
        Math.PI * 2
    );
    context.fill();
}

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

export function GameCanvas({ gameState, gameEntities }) {
    const canvasRef = useRef(null);
    const entityTracksRef = useRef(new Map());
    const gameStateRef = useRef(gameState);

    const width =
        gameState?.map?.width ||
        gameState?.width ||
        800;

    const height =
        gameState?.map?.height ||
        gameState?.height ||
        450;

    gameStateRef.current = gameState;

    useEffect(() => {
        if (!Array.isArray(gameEntities))
            return;

        const now = performance.now();
        const receivedEntityIds = new Set();

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
                distance >= TELEPORT_DISTANCE;

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
    }, [gameEntities]);

    useEffect(() => {
        let animationFrameId;

        function render(now) {
            const canvas = canvasRef.current;

            if (!canvas)
                return;

            const context = canvas.getContext('2d');
            const currentGameState = gameStateRef.current;

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            context.fillStyle = '#000000';
            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            entityTracksRef.current.forEach(track => {
                const position =
                    getInterpolatedPosition(track, now);

                const color =
                    (
                        track.entity.typeId ??
                        track.entity.entityTypeId
                    ) === ENGINE_ENTITY_TYPE.PLAYER
                        ? '#22c55e'
                        : '#64748b';

                drawSquare(
                    context,
                    {
                        x: position.x,
                        y: position.y,
                        size: 10,
                    },
                    color,
                    10
                );
            });

            const resources = Array.isArray(
                currentGameState?.resources
            )
                ? currentGameState.resources
                : [];

            const enemies = Array.isArray(
                currentGameState?.enemies
            )
                ? currentGameState.enemies
                : [];

            const projectiles = Array.isArray(
                currentGameState?.projectiles
            )
                ? currentGameState.projectiles
                : [];

            const players = Array.isArray(
                currentGameState?.players
            )
                ? currentGameState.players
                : [];

            resources.forEach(resource => {
                drawCircle(context, resource, '#facc11', 6);
            });

            enemies.forEach(enemy => {
                drawSquare(context, enemy, '#ef4444', 22);
            });

            projectiles.forEach(projectile => {
                drawCircle(
                    context,
                    projectile,
                    '#7611fa',
                    6
                );
            });

            players.forEach(player => {
                drawSquare(
                    context,
                    player,
                    player.color || '#22c55e',
                    24
                );
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