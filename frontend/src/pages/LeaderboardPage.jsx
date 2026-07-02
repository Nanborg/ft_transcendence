import { PageHeading } from '../components/PageHeading';
import { mockLeaderboard } from '../features/leaderboard/mockLeaderboard';

// TODO: replace mockLeaderboard with the scores API when leaderboard endpoint is ready.
function getWinRate(player) {
  const totalGames = player.wins + player.losses;
  if (totalGames === 0) {
    return '0%';
  }
  return `${Math.round((player.wins / totalGames) * 100)}%`;
}

// TODO: replace these temporary fields with the final stats returned by the scores/leaderboard API.
export function LeaderboardPage({ title, description }) {
    return (
        <div className="leaderboard-panel">
            <PageHeading title={title} description={description} />
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Win rate</th>
                    </tr>
                </thead>
                <tbody>
                    {mockLeaderboard.map(player => (
                        <tr key={player.username}>
                            <td>#{player.rank}</td>
                            <td>{player.username}</td>
                            <td>{player.wins}</td>
                            <td>{player.losses}</td>
                            <td>{getWinRate(player)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}