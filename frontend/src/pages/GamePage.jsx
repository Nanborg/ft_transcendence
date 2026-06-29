import { GameCanvas, mockGameState } from "../features/game/GameCanvas";

export function GamePage({ title, description }) {
    return (
        <>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>
            <div className="game-panel">
                <GameCanvas gameState={mockGameState} />
            </div>
        </>
    );
}