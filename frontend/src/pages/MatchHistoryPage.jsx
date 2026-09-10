import { useEffect, useState } from 'react';
import { fetchMatchHistory } from '../api/scores';
import { PageHeading } from '../components/PageHeading';

export function MatchHistoryPage({ title, description })
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
			try {
				const data = await fetchMatchHistory();
				if (!cancelled)
				{
					let nextMatches = [];
					if (Array.isArray(data))
						nextMatches = data;
					setMatches(nextMatches);
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
		loadHistory();
		return () =>
		{
			cancelled = true;
		};
	}, []);
	let matchList = null;
	if (status === 'loaded' && matches.length > 0)
	{
		matchList = (
			<ul className="match-history-list">
				{matches.map((match) =>
				{
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
										<span>Deaths: {player.deaths ?? 0}</span>
										<span>Damage dealt: {player.damageDealt ?? 0}</span>
										<span>Damage received: {player.damageReceived ?? 0}</span>
										<span>Gold: {player.goldEarned ?? 0}</span>
									</li>
								))}
							</ul>
						);
					}
					return (
						<li className="match-history-item shell-window" key={match.gameRunId}>
							<button className="match-history-summary btn btn-outline-info" type="button" onClick={() => setExpandedMatchId(nextExpandedMatchId)}>
								<span className="badge text-bg-info">{match.result}</span>
								<span>{match.durationSeconds} seconds</span>
								<span>{createdAtLabel}</span>
							</button>
							{playerList}
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<div className="shell-screen shell-screen--history">
			<div className="match-history-panel">
				<PageHeading
					title={title}
					description={description}
					actions={[ { label: 'Leaderboard', href: '#/leaderboard' }, { label: 'Back to Menu', href: '#/' }, ]}
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
