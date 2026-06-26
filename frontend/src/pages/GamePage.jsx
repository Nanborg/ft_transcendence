import { GameCanvas, mockGameState } from "../features/game/GameCanvas";

export function GamePage({ title, description }) {
    return (
        <>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>
            <div className="game-panel">
                {/* Nanborg */}
                {/* TODO -> replace mockGameState with the real game:state event from the Socket.IO backend. */}
                {/* The canvas should render server-authoritative state, not local mock data. */}
                <GameCanvas gameState={mockGameState} />
            </div>
        </>
    );
}