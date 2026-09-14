import { PageHeading } from '../components/PageHeading';
import { useEffect, useState } from 'react';
import { fetchLeaderBoard } from '../api/scores';

// WHY: Leaderboard displays fastest successful games.
export function LeaderboardPage({ title, description })
{
	const [status, setStatus] = useState('loading');
	const [error, setError] = useState('');
	const [leaderboard, setLeaderboard] = useState([]);

	useEffect(() =>
	{
		let cancelled = false;
		async function loadLeaderboard()
		{
			// SYNC: Load once when page opens.
			setStatus('loading');
			setError('');
			try {
				const data = await fetchLeaderBoard();
				if (!cancelled)
				{
					// SAFETY: API must return an array.
					let nextLeaderboard = [];
					if (Array.isArray(data))
						nextLeaderboard = data;
					setLeaderboard(nextLeaderboard);
					setStatus('loaded');
				}
			} catch (loadError) {
				if (!cancelled)
				{
					// SAFETY: Ignore stale errors after unmount.
					setError(loadError.message);
					setStatus('error');
				}
			}
		}
		loadLeaderboard();
		return () =>
		{
			cancelled = true;
		};
	}, []);

	let leaderboardRows = null;
	if (status === 'loaded' && leaderboard.length > 0)
	{
		leaderboardRows = (
			<div className="leaderboard-table-wrap shell-window">
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
						{leaderboard.map((entry, index) =>
						{
							let rowKey = index;
							if (entry.roomId !== null && entry.roomId !== undefined)
								// FALLBACK: Room id keys old rows.
								rowKey = entry.roomId;
							if (entry.gameRunId !== null && entry.gameRunId !== undefined)
								// DECISION: Game run id is best key.
								rowKey = entry.gameRunId;
							let rank = index + 1;
							if (entry.rank !== null && entry.rank !== undefined)
								rank = entry.rank;
							let playersLabel = entry.roomId;
							if (Array.isArray(entry.players))
								// SYNC: Player names replace room id.
								playersLabel = entry.players.map((player) => player.username).join(', ') || entry.roomId;
							let createdAtLabel = '-';
							if (entry.createdAt)
								createdAtLabel = new Date(entry.createdAt).toLocaleString();
							return (
								<tr key={rowKey}>
									<td>#{rank}</td>
									<td>{playersLabel}</td>
									<td>{entry.durationSeconds} seconds</td>
									<td>{createdAtLabel}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}

	return (
		<div className="shell-screen shell-screen--leaderboard">
			<div className="leaderboard-panel">
				<PageHeading
					title={title}
					description={description}
					actions={[ { label: 'Match History', href: '#/match-history' }, { label: 'Back to Menu', href: '#/' }, ]}
				/>
				{status === 'loading' && <p className="alert alert-info">Loading leaderboard...</p>}
				{status === 'error' && <p className="alert alert-danger" role="alert">{error}</p>}
				{status === 'loaded' && leaderboard.length === 0 && <p>No leaderboard data yet.</p>}
				{leaderboardRows}
			</div>
		</div>
	);
}
