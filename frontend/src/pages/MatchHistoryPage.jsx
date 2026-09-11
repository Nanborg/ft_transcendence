import { useEffect, useState } from 'react';
import { fetchMatchHistory } from '../api/scores';
import { PageHeading } from '../components/PageHeading';

export function MatchHistoryPage({ title, description, loadMatches = fetchMatchHistory, compact = false })
{
    const [matches, setMatches] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [expandedMatchId, setExpandedMatchId] = useState(null);
    useEffect(() =>
    {
        let cancelled = false;
        async function loadHistory()
        {
            setStatus('loading');
            setError('');
            try
            {
                const data = await loadMatches();
                if (!cancelled)
                {
                    let nextMatches = [];
                    if (Array.isArray(data))
                        nextMatches = data;
                    setMatches(nextMatches);
                    setStatus('loaded');
                }
            }
            catch (loadError)
            {
                if (!cancelled)
                {
                    setError(loadError.message);
                    setStatus('error');
                }
            }
        }
        loadHistory();
        return () =>
        {
            cancelled = true;
        };
    }, [loadMatches]);
    let matchList = null;
    if (status === 'loaded' && matches.length > 0)
    {
        matchList = (
            <ul className="match-history-list">
                {matches.map((match) =>
                {
                    const resultClass = `match-history-result--${match.result}`;
                    let createdAtLabel = '-';
                    if (match.createdAt)
                        createdAtLabel = new Date(match.createdAt).toLocaleString();
                    let nextExpandedMatchId = match.gameRunId;
                    if (expandedMatchId === match.gameRunId)
                        nextExpandedMatchId = null;
                    let playerList = null;
                    if (expandedMatchId === match.gameRunId && Array.isArray(match.players) && match.players.length > 0)
                    {
                        playerList = (
                            <ul className="match-history-players">
                                {match.players.map((player) => (
                                    <li key={player.userId}>
                                        <a className="match-history-player-name" href={`#/profile/${player.userId}`}>{player.username || `User #${player.userId}`}</a>
                                        <span className="match-history-stat match-history-stat--danger">Deaths: {player.deaths ?? 0}</span>
                                        <span className="match-history-stat match-history-stat--damage">Damage dealt: {player.damageDealt ?? 0}</span>
                                        <span className="match-history-stat match-history-stat--shield">Damage received: {player.damageReceived ?? 0}</span>
                                        <span className="match-history-stat match-history-stat--gold">Gold: {player.goldEarned ?? 0}</span>
                                    </li>
                                ))}
                            </ul>
                        );
                    }
                    return (
                        <li className={`match-history-item shell-window ${resultClass}`} key={match.gameRunId}>
                            <button className="match-history-summary" type="button" onClick={() => setExpandedMatchId(nextExpandedMatchId)}>
                                <span className={`match-history-result ${resultClass}`}>{match.result}</span>
                                <span className="match-history-duration">{match.durationSeconds} seconds</span>
                                <span className="match-history-date">{createdAtLabel}</span>
                            </button>
                            {playerList}
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className={compact ? "match-history-embedded" : "shell-screen shell-screen--history"}>
            <div className={compact ? "match-history-panel shell-window" : "match-history-panel"}>
                <PageHeading
                    title={title}
                    description={description}
                    actions={[
                        { label: 'Leaderboard', href: '#/leaderboard' },
                        { label: 'Back to Menu', href: '#/' },
                    ]}
                />
                {status === 'loading' && <p className="alert alert-info">Loading match history...</p>}
                {status === 'error' && <p className="alert alert-danger" role="alert">{error}</p>}
                {status === 'loaded' && matches.length === 0 && <p>No matches played yet.</p>}
                {matchList}
            </div>
        </div>
    );
}
//the majority of information are after the click
