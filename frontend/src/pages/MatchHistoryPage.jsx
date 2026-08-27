import { PageHeading } from "../components/PageHeading";
import { useEffect, useState } from 'react';
import { fetchMatchHistory } from "../api/scores";

export function MatchHistoryPage({ title, description, accessToken }) {
    const [matches, setMatches] = useState([]);
    const [status, setStatus] = useState(accessToken ? 'loading' : 'idle');
    const [error, setError] = useState('');
    const [expandedMatchId, setExpandedMatchId] = useState(null);
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
                    setMatches(Array.isArray(data) ? data : []);
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
            {status === 'loading' && <p className="alert alert-info">Loading match history...</p>}
            {status === 'error' && <p className="alert alert-danger" role="alert">{error}</p>}
            {status === 'loaded' && matches.length === 0 && (
                <p>No matches played yet.</p>
            )}
            {status === 'loaded' && matches.length > 0 && (
                <ul className="match-history-list">
                    {matches.map(match => (
                        <li className="match-history-item" key={match.gameRunId}>
                            <button className="match-history-summary btn btn-outline-info" type="button" onClick={() => setExpandedMatchId(expandedMatchId === match.gameRunId ? null : match.gameRunId)}>
                                <span className="badge text-bg-info">{match.result}</span>
                                <span>{match.durationSeconds} seconds</span>
                                <span>{match.createdAt ? new Date(match.createdAt).toLocaleString() : '-'}</span>
                            </button>
                            {expandedMatchId === match.gameRunId && Array.isArray(match.players) && match.players.length > 0 && (
                                <ul className="match-history-players">
                                    {match.players.map(player => (
                                        <li key={player.userId}>
                                            <span>Deaths: {player.deaths ?? 0}</span>
                                            <span>Damage dealt: {player.damageDealt ?? 0}</span>
                                            <span>Damage received: {player.damageReceived ?? 0}</span>
                                            <span>Gold: {player.goldEarned ?? 0}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
//the majority of information are after the click
