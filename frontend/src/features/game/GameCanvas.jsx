//import { array } from 'node:stream/iter';
import { useEffect, useRef } from 'react';
//Nanborg
// TODO(nanborg): Remove this mock state after GamePage is wired to Socket.IO game:state.
// TODO(nanborg): Render the coop 2D game:state contract: players, enemies,
// projectiles, resources, objective, and score.
export const mockGameState = {
    status: 'mock',
    score: 0,
    width: 800,
    height: 450,
    players: [
        {
            id: 'player-1',
            name: 'Player 1',
            x: 120,
            y: 180,
            size: 28,
            color: '#22cc44',
        },
        {
            id: 'player-2',
            name: 'Player 2',
            x: 620,
            y: 220,
            size: 28,
            color: '#2aabee',
        },
    ],
    objects: [
        {
            id: 'object-1',
            type: 'ball',
            x: 390,
            y: 210,
            size: 16,
            color: '#facc11',
        },
    ],
};

const ENGINE_ENTITY_TYPE = Object.freeze({ PLAYER: 1, WALL: 2, });

function drawSquare(context, entity, color, fallbackSize = 20) {
    const size = entity.size || fallbackSize;
    context.fillStyle = color;
    context.fillRect(entity.x || 0, entity.y || 0, size, size);
}

function drawCircle(context, entity, color, fallbackSize = 8) {
    const size = entity.size || fallbackSize;
    context.fillStyle = color;
    context.beginPath();
    context.arc(entity.x || 0, entity.y || 0, size, 0, Math.PI * 2);
    context.fill();
}

export function GameCanvas({ gameState, gameEntities  }) {
    const canvasRef = useRef(null);
    const width = gameState?.map?.width || gameState?.width || 800;
    const height = gameState?.map?.height || gameState?.height || 450;
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const enemies = Array.isArray(gameState?.enemies) ? gameState.enemies : [];
    const projectiles = Array.isArray(gameState?.projectiles) ? gameState.projectiles : [];
    const resources = Array.isArray(gameState?.resources) ? gameState.resources : [];
    const incrementalEntities = !gameState && Array.isArray(gameEntities) ? gameEntities : [];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || (!gameState && incrementalEntities.length === 0)) {
            return;
        }

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        incrementalEntities.forEach(entity => {
            const color =
                (entity.typeId ?? entity.entityTypeId) === ENGINE_ENTITY_TYPE.PLAYER
                    ? '#22c55e'
                    : '#64748b';

            drawSquare(
                context,
                {
                    x: entity.posX,
                    y: entity.posY,
                    size: 10,
                },
                color,
                10
            );
        });
        resources.forEach(resource => {
            drawCircle(context, resource, '#facc11', 6);
        });
        enemies.forEach(enemy => {
            drawSquare(context, enemy, '#ef4444', 22);
        });
        projectiles.forEach(projectile => {
            drawCircle(context, projectile, '#7611fa', 6);
        });
        players.forEach(player => {
            drawSquare(context, player, player.color || '#22c55e', 24);
        });
    }, [gameState, players, enemies, projectiles, resources, incrementalEntities]);
    return (
        <canvas
            ref={canvasRef}
            className="game-canvas"
            width={width}
            height={height}
            aria-label="Game preview" />
    );
}
