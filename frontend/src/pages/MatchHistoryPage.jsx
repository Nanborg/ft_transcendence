import { PageHeading } from "../components/PageHeading";
//import { mockMatchHistory } from "../features/matchHistory/mockMatchHistory";
import { useEffect, useState } from 'react';
import { fetchMatchHistory } from "../api/scores";

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

export function MatchHistoryPage({ title, description, accessToken, currentUser }) {
    const currentUserId = currentUser?.id;
    const [matches, setMatches] = useState([]);
    const [status, setStatus] = useState(accessToken ? 'loading' : 'idle');
    const [error, setError] = useState('');
    useEffect(() => {
        if (!accessToken) {
            setStatus('idle');
            setMatches([]);
            return undefined;
        }
        let cancelled = false;
        async function loadHistory() {
            setStatus('loading');
            setError('');
            try {
                const data = await fetchMatchHistory(accessToken);
                if (!cancelled) {
                    setMatches(data);
                    setStatus('loaded');
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError.message);
                    setStatus('error');
                }
            }
        }
        loadHistory();
        return () => {
            cancelled = true;
        };
    }, [accessToken]);
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
                        <li className="match-history-item" key={match.gameRunId}>
                            <span>{match.result}</span>
                            <span>{match.score} pts</span>
                            <span>{match.rank}</span>
                            <span>{new Date(match.endedAt).toLocaleString()}</span>
                        </li>

                    })}
                </ul>
            )}
        </div>
    );
}
