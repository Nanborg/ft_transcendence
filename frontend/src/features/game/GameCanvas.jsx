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


export function GameCanvas({ gameState }) {
    const canvasRef = useRef(null);
    const width = gameState?.width || 800;
    const height = gameState?.height || 450;
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const objects = Array.isArray(gameState?.objects) ? gameState.objects : [];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !gameState) {
            return;
        }

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        players.forEach(player => {
            context.fillStyle = player.color;
            context.fillRect(player.x, player.y, player.size, player.size);
        });
        objects.forEach(object => {
            context.fillStyle = object.color;
            context.fillRect(object.x, object.y, object.size, object.size);
        });
    }, [gameState, players, objects]);
    return (
        <canvas
            ref={canvasRef}
            className="game-canvas"
            width={width}
            height={height}
            aria-label="Game preview" />
    );
}
