# Privacy Policy

## Context

ft_transcendence is:

- a 42 student project;
- a local demo/evaluation app;
- not a public production service.

## Data Stored

The app may store:

- account id;
- username;
- email;
- hashed password;
- OAuth 42 id;
- optional avatar URL;
- friends;
- room owner;
- room players;
- ready state;
- refresh tokens;
- token expiry;
- token revoked flag;
- game results;
- match history;
- deaths;
- damage dealt;
- damage received;
- gold earned;
- upgrade levels.

## Data Usage

Data is used for:

- login;
- session refresh;
- logout;
- profiles;
- friends;
- rooms;
- chat;
- ready system;
- gameplay sync;
- leaderboard;
- match history;
- progression;
- badges.

The app does not use:

- advertising tracking;
- data selling.

## Authentication

Password accounts:

- passwords are hashed;
- passwords are not stored as plain text.

Token sessions:

- access tokens are short-lived;
- refresh tokens are stored server-side;
- refresh tokens can be revoked;
- refresh tokens are replaced on refresh.

OAuth 42:

- 42 token is used to fetch the 42 profile;
- local account is created or linked;
- the app then creates its own JWT tokens.

## Retention

Data remains until:

- database reset;
- Docker volume removal;
- manual cleanup by the team.

## Access

During development:

- team members may inspect local data;
- this can happen for debugging;
- this can happen during evaluation preparation.
