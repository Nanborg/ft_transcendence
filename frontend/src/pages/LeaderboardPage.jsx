import { PageHeading } from '../components/PageHeading';
import { useEffect, useState } from 'react';
import { fetchLeaderBoard } from '../api/scores';

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
			setStatus('loading');
			setError('');
			try {
				const data = await fetchLeaderBoard();
				if (!cancelled)
				{
					let nextLeaderboard = [];
					if (Array.isArray(data))
						nextLeaderboard = data;
					setLeaderboard(nextLeaderboard);
					setStatus('loaded');
				}
			} catch (loadError) {
				if (!cancelled)
				{
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
								rowKey = entry.roomId;
							if (entry.gameRunId !== null && entry.gameRunId !== undefined)
								rowKey = entry.gameRunId;
							let rank = index + 1;
							if (entry.rank !== null && entry.rank !== undefined)
								rank = entry.rank;
							let playersLabel = entry.roomId;
							if (Array.isArray(entry.players))
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
