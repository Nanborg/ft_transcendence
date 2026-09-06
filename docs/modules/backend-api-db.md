# Backend API and Database

## Goal

- serve API routes;
- store project data;
- keep relations between users, rooms and scores;
- support the frontend and Socket.IO server.

## What Exists

- Express backend;
- Prisma ORM;
- PostgreSQL database;
- migrations;
- health route;
- user routes;
- friend routes;
- score routes.
- room persistence;
- chat messages;
- direct messages, blocks and game invitations.

## Flow

- browser calls `/api/...`;
- Nginx proxies to backend;
- Express handles the route;
- Prisma reads or writes database;
- backend returns JSON.

## Key Files

- `backend/src/server.js`
- `backend/src/db.js`
- `backend/src/routes/`
- `backend/src/services/`
- `backend/src/socket/`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`

## API Contracts

- `GET /api/health`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/friends`
- `POST /api/friends/:id`
- `PATCH /api/friends/:id/accept`
- `DELETE /api/friends/:id`
- `GET /api/scores/history`
- `GET /api/scores/leaderboard`

## Validation

Automatic checks:

- auth middleware on protected routes;
- friend id parsing;
- avatar URL checks;
- user search checks;
- Prisma unique constraints.

## Manual Checks

- start Docker;
- call health route;
- create user;
- login;
- create room;
- add/remove friend;
- finish game;
- check history and leaderboard.

## To Verify

- migrations on clean database;
- API errors in demo flow;
- database persistence after restart.
