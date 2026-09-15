
// WHY: Mock match history keeps profile pages populated without depending on live game records
// DECISION: Static records document the display contract used by match history components
export const mockMatchHistory = [
	{
		roomId: 'room-101',
		gameRunId: 'game-101',
		reason: 'finished',
		startedAt: '2026-06-26T12:00:00.000Z',
		endedAt: '2026-06-26T12:05:00.000Z',
		players:
		[
			{ userId: 'user-1', username: 'nico', score: 120, rank: 1, result: 'win' },
			{ userId: 'user-2', username: 'mae', score: 80, rank: 2, result: 'loss' },
		],
	},
	{
		roomId: 'room-102',
		gameRunId: 'game-102',
		reason: 'finished',
		startedAt: '2026-06-27T14:00:00.000Z',
		endedAt: '2026-06-27T14:04:00.000Z',
		players:
		[
			{ userId: 'user-1', username: 'nico', score: 65, rank: 2, result: 'loss' },
			{ userId: 'user-3', username: 'michel', score: 90, rank: 1, result: 'win' },
		],
	},
	{
		roomId: 'room-103',
		gameRunId: 'game-103',
		reason: 'finished',
		startedAt: '2026-06-28T18:30:00.000Z',
		endedAt: '2026-06-28T18:38:00.000Z',
		players:
		[
			{ userId: 'user-1', username: 'nico', score: 140, rank: 1, result: 'win' },
			{ userId: 'user-4', username: 'yann', score: 110, rank: 2, result: 'loss' },
		],
	},
];
// WHY: Mock match history keeps sample rows available for UI development
