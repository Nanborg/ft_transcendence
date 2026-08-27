*This project has been created as part of the 42 curriculum by nicolsan, yaoberso, mm-furi, ylabussi, malapoug.*

# ft_transcendence

## Description

ft_transcendence is a cooperative web application built around a real-time 2D multiplayer game.

The project includes user accounts, profiles, friends, lobby, rooms, chat, ready system, multiplayer gameplay, scores, match history and leaderboard.

## Documentation

Project documentation is available in `docs/`:

- `docs/00_plan_general.md`: global project plan
- `docs/01_regles_equipe.md`: team workflow rules
- `docs/roles/`: role plans and implementation guides

## Prerequisites

Install:

- Git
- Docker Desktop
- Docker Compose
- Node.js LTS
- npm

## Technologies

- Frontend: React with Vite.
- Frontend styling: Bootstrap for forms, buttons, navigation utilities and responsive UI primitives, extended by custom CSS in `frontend/src/styles.css`.
- Backend: Express with Socket.IO.
- Database: PostgreSQL with Prisma ORM.

Check local tools:

```bash
git --version
docker --version
docker compose version
node --version
npm --version
```

## Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Then replace local secrets in `.env`.

Never commit `.env`.

## Run

Create local HTTPS certificates once:

```bash
sh scripts/generate-dev-cert.sh
```

Start the project with Docker Compose:

```bash
docker compose up -d --build
```

Frontend is available at:

```txt
https://localhost
```

Stop services:

```bash
docker compose down
```

## Branch Workflow

Main branches:

- `main`: stable demo/release branch
- `dev`: integration branch

Work branches start from `dev`.

Recommended flow:

```txt
feature/... -> area/... -> dev -> main
```

Examples:

```txt
area/front
area/backend-api-db
area/websocket-multiplayer
area/gameplay-cpp
area/auth-users-scores
area/docker-setup
```

## Team

| Login | Initial area |
|---|---|
| nicolsan | PM / Scrum Master, Front/UI, QA |
| yaoberso | Backend API / Database |
| mm-furi | WebSocket / Multiplayer |
| ylabussi | Gameplay / C++ simulation |
| malapoug | Auth / Users / Scores |

The final roles and contributions will be updated during the project.

## AI Usage

AI may be used to help with planning, documentation, explanations, checklists and review support.

All AI-assisted content must be reviewed, tested and understood by the team before being used in the project.
