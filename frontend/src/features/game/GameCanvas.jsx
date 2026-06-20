import {useEffect, useRef} from 'react';

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
            color: '#22c55e',
        },
    ],
    objects: [],
};


export function GameCanvas({gameState}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas || !gameState) {
            return;
        }

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        gameState.players.forEach(player => {
            context.fillStyle = player.color;
            context.fillRect(player.x, player.y, player.size, player.size);
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