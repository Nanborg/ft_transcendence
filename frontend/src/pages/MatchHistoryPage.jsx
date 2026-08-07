import { PageHeading } from "../components/PageHeading";
import { useEffect, useState } from 'react';
import { fetchMatchHistory } from "../api/scores";

export function MatchHistoryPage({ title, description, accessToken }) {
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
            {status === 'loading' && <p>Loading match history...</p>}
            {status === 'error' && <p role="alert">{error}</p>}
            {status === 'loaded' && matches.length === 0 && (
                <p>No matches played yet.</p>
            )}
            {status === 'loaded' && matches.length > 0 && (
                <ul className="match-history-list">
                    {matches.map(match => (
                        <li className="match-history-item" key={match.gameRunId}>
                            <span>{match.won ? 'won' : 'lost'}</span>
                            <span>{match.durationSeconds} seconds</span>
                            <span>{match.createdAt ? new Date(match.createdAt).toLocaleString() : '-'}</span>
                        </li>

                    ))}
                </ul>
            )}
        </div>
    );
}
