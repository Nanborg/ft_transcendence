import { PageHeading } from '../components/PageHeading';
import { useEffect, useState } from 'react';
import { fetchLeaderBoard } from '../api/scores';

export function LeaderboardPage({ title, description }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaderboard() {
      setStatus('loading');
      setError('');
      try {
        const data = await fetchLeaderBoard();
        if (!cancelled) {
          setLeaderboard(Array.isArray(data) ? data : []);
          setStatus('loaded');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
          setStatus('error');
      }
    }
  }
  loadLeaderboard();
  return () => {
    cancelled = true;
  };
}, []);

return (
  <div className="leaderboard-panel">
    <PageHeading title={title} description={description} />
    {status === 'loading' && <p className="alert alert-info">Loading leaderboard...</p>}
    {status === 'error' && <p className="alert alert-danger" role="alert">{error}</p>}
    {status === 'loaded' && leaderboard.length === 0 && (<p>No leaderboard data yet.</p>)}
    {status === 'loaded' && leaderboard.length > 0 && (
      <table className="leaderboard-table table table-dark table-hover align-middle">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Players or Room</th>
            <th>Duration</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.gameRunId ?? entry.roomId ?? index}>
              <td>#{entry.rank ?? index + 1}</td>
              <td>{entry.players?.map((player) => player.username).join(', ') || entry.roomId}</td>
              <td>{entry.durationSeconds} seconds</td>
              <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
}
