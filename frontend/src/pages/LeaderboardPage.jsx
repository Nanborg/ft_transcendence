import { PageHeading } from '../components/PageHeading';
//import { mockLeaderboard } from '../features/leaderboard/mockLeaderboard';
import { useEffect, useState } from 'react';
import { fetchLeaderBoard } from '../api/scores';
// TODO(nanborg): Replace mockLeaderboard with the scores API when leaderboard endpoint is ready.
function getWinRate(player) {
  const totalGames = player.wins + player.losses;
  if (totalGames === 0) {
    return '0%';
  }
  return `${Math.round((player.wins / totalGames) * 100)}%`;
}

// TODO(nanborg): Replace these temporary fields with the final stats returned by the scores/leaderboard API.
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
          setLeaderboard(data);
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
  return () => { cancelled = true; };
}, []);

return (
  <div className="leaderboard-panel">
    <PageHeading title={title} description={description} />
    {status === 'loading' && <p>Loading leaderboard...</p>}
    {status === 'error' && <p role="alert">{error}</p>}
    {status === 'loaded' && leaderboard.length === 0 && (<p>No leaderboard data yet.</p>)}
    {status === 'loaded' && leaderboard.length > 0 && (
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Win rate</th>
            <th>Total score</th>
            <th>Best score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map(player => (
            <tr key={player.userId}>
              <td>#{player.rank}</td>
              <td>{player.username}</td>
              <td>{player.wins}</td>
              <td>{player.losses}</td>
              <td>{getWinRate(player)}</td>
              <td>{player.totalScore}</td>
              <td>{player.bestScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
}
