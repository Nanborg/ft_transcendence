import {useEffect, useRef} from 'react';

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