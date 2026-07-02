import { PageHeading } from "../components/PageHeading";
import { mockMatchHistory } from "../features/matchHistory/mockMatchHistory";

function getCurrentPlayer(match, currentUserId) {
    return match.players.find(player => player.userId === currentUserId);
}

function getOtherPlayers(match, currentUserId) {
    return match.players.filter(player => player.userId !== currentUserId);
}

function formatOtherPlayers(players) {
    if (players.length === 0) {
        return 'No other players';
    }

    return players
        .map(player => `${player.username}: ${player.score} pts`)
        .join(', ');
}

export function MatchHistoryPage({ title, description }) {
    const currentUserId = 'user-1';
    const matches = mockMatchHistory;
    const status = 'loaded';
    const error = '';
    return (
        <div className="match-history-panel">
            <PageHeading title={title} description={description} />
            {status === 'loading' && <p>Loading match history...</p>}
            {status === 'error' && <p role="alert">{error}</p>}
            {status === 'loaded' && matches.length === 0 && (
                <p>No matches played yet.</p>
            )}
            {status === 'loaded' && matches.length > 0 && (
                <ul className="match-history-list">
                    {matches.map(match => {
                        const currentPlayer = getCurrentPlayer(match, currentUserId);
                        const otherPlayers = getOtherPlayers(match, currentUserId);
                        const otherPlayersSummary = formatOtherPlayers(otherPlayers);

                        return (
                            <li className="match-history-item" key={match.gameRunId}>
                                <span>{currentPlayer ? currentPlayer.result : 'unknown'}</span>
                                <span>{currentPlayer ? `${currentPlayer.score} pts` : '-'}</span>
                                <span>{currentPlayer ? `#${currentPlayer.rank}` : '-'}</span>
                                <span>{otherPlayersSummary}</span>
                                <span>{match.endedAt}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
