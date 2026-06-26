import { useEffect, useRef } from 'react';

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !gameState) {
            return;
        }

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        //Nanborg
        // TODO -> validate or normalize gameState before drawing.
        // The real game:state may arrive late or miss players/objects during reconnects.
        gameState.players.forEach(player => {
            context.fillStyle = player.color;
            context.fillRect(player.x, player.y, player.size, player.size);
        });
        gameState.objects.forEach(object => {
            context.fillStyle = object.color;
            context.fillRect(object.x, object.y, object.size, object.size);
        });
    }, [gameState]);
    return (
        <canvas
            ref={canvasRef}
            className="game-canvas"
            width={gameState.width}
            height={gameState.height}
            aria-label="Game preview" />
    );
}