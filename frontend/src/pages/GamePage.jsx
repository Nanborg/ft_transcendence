import { GameCanvas, mockGameState } from "../features/game/GameCanvas";
import { usePlayerInput } from '../features/game/usePlayerInput';

export function GamePage({ title, description, gameState, socket, currentRoom, gameStarted }) {
    const renderedGameState = gameState || mockGameState;
    usePlayerInput({
        socket, roomId: currentRoom?.id, enabled: gameStarted === true,
    });
    return (
        <>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>
            <div className="game-panel">
                <GameCanvas gameState={renderedGameState} />
            </div>
        </>
    );
}