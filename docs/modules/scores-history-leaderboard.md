# Scores, Match History and Leaderboard

## Goal

- save game results;
- show match history;
- show leaderboard;
- feed profile stats.

## What Exists

- `GameRun` model;
- `PlayerRunStats` model;
- result saving service;
- history API;
- leaderboard API;
- match history page;
- leaderboard page;
- profile aggregate stats.

## Flow

Save:

- game ends;
- backend receives result;
- backend saves game run;
- backend saves player stats.

History:

- user opens match history;
- frontend calls history API;
- backend returns user games.

Leaderboard:

- frontend calls leaderboard API;
- backend returns winning runs;
- runs are sorted by shortest duration.

## Key Files

- `backend/src/services/gameService.js`
- `backend/src/routes/scores.js`
- `backend/prisma/schema.prisma`
- `frontend/src/pages/LeaderboardPage.jsx`
- `frontend/src/pages/MatchHistoryPage.jsx`
- `frontend/src/features/profile/ProfileDetails.jsx`

## API Contracts

- `GET /api/scores/history`
- `GET /api/scores/leaderboard`

## Manual Checks

- finish a game;
- open profile;
- verify stats changed;
- open match history;
- open leaderboard;
- test empty history user.

## To Verify

- real game-end persistence;
- leaderboard ordering;
- match detail display.

