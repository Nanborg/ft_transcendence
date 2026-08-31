*This project has been created as part of the 42 curriculum by nicolsan, yaoberso, mm-furi, ylabussi, malapoug.*

# ft_transcendence

42 project.

Main goal:

- cooperative 2D multiplayer web game;
- real-time rooms and gameplay;
- user accounts and profiles;
- friends, chat, scores and history.

Team:

- `nicolsan`
- `yaoberso`
- `mm-furi`
- `ylabussi`
- `malapoug`

## Status

This README describes the current repo.

It should be reviewed by the team in PR.

Review goal:

- verify each claimed module;
- verify each status;
- verify each technical decision;
- correct outdated parts;
- update before final submission.

Some parts may still change before final delivery.

## Run

Install:

- Git
- Docker Desktop
- Docker Compose
- Node.js LTS
- npm

Create `.env`:

```bash
cp .env.example .env
```

Then:

- fill required secrets;
- never commit `.env`.

Create HTTPS certs:

```bash
sh scripts/generate-dev-cert.sh
```

Start:

```bash
docker compose up -d --build
```

Open:

```txt
https://localhost:4242
```

Stop:

```bash
docker compose down
```

## Technologies

| Area | Tech | Role |
|---|---|---|
| Frontend | React + Vite | UI and pages |
| Styling | Bootstrap + custom CSS | UI base + game style |
| Backend | Express | REST API |
| Real-time | Socket.IO | rooms, chat, game sync |
| Database | PostgreSQL | persistent data |
| ORM | Prisma | schema and migrations |
| Proxy | Nginx | HTTPS entrypoint |
| Game | C++ | gameplay simulation |
| Deploy | Docker Compose | local multi-service run |

## Architecture

```txt
Browser
  |
  | HTTPS / WSS
  v
Nginx :4242
  |-- /           -> React frontend :5173
  |-- /api        -> Express backend :3000
  |-- /socket.io  -> Socket.IO backend :3000

Backend
  |-- Prisma -> PostgreSQL
  |-- Socket.IO -> rooms/chat/game events
  |-- service bridge -> C++ game engine
```

Main folders:

- `frontend/`: React app.
- `backend/`: API, Socket.IO, Prisma, game bridge.
- `game_engine/`: C++ simulation.
- `nginx/`: HTTPS proxy.
- `docs/`: documentation.
- `docs/modules/`: module docs.

## Module Docs

- [Auth and User Management](docs/modules/auth-users.md)
- [Backend API and Database](docs/modules/backend-api-db.md)
- [Docker, Nginx and HTTPS](docs/modules/docker-nginx-https.md)
- [Frontend UI](docs/modules/frontend-ui.md)
- [Gameplay and Game Engine](docs/modules/gameplay-game-engine.md)
- [Lobby, Rooms and Chat](docs/modules/lobby-rooms-chat.md)
- [Privacy Policy and Terms of Service](docs/modules/privacy-terms.md)
- [Profiles and Friends](docs/modules/profiles-friends.md)
- [Real-time WebSocket](docs/modules/realtime-websocket.md)
- [Scores, Match History and Leaderboard](docs/modules/scores-history-leaderboard.md)

## Claimed Modules

Only demonstrated modules should be counted.

| Module | Type | Pts | Status | Notes |
|---|---|---:|---|---|
| Complete web-based game | Major | 2 | Implemented | Needs full demo. |
| Remote players | Major | 2 | To prove | Needs remote/multi-browser test. |
| Multiplayer 3+ | Major | 2 | Implemented | Rooms allow 4 players. |
| Frontend + backend framework | Major | 2 | Implemented | React, Express, Prisma. |
| Real-time WebSocket | Major | 2 | Implemented | Needs console/WSS check. |
| User interaction | Major | 2 | Implemented | Profiles, friends, chat, rooms. |
| Standard user management | Major | 2 | Partial | Validation and online status incomplete. |
| Game stats + history | Minor | 1 | Partial | Needs real game-end proof. |
| OAuth 42 | Minor | 1 | Implemented | Needs real credential test. |
| ORM | Minor | 1 | Implemented | Prisma present. |
| Game customization | Minor | 1 | Partial | Checkpoint upgrades exist. |
| Gamification | Minor | 1 | Partial | Badges/progression exist. |

Possible static total:

- 7 Major = 14 pts.
- 5 Minor = 5 pts.
- Total possible = 19 pts.

Important:

- partial modules may count as 0;
- demo decides final score;
- do not overclaim incomplete modules.

## Modules of Choice

### Game Customization

Why:

- adds player choices;
- uses gold as a resource;
- changes gameplay stats.

What exists:

- melee upgrade;
- ranged upgrade;
- shield upgrade;
- health upgrade;
- checkpoint menu;
- C++ engine effects;
- saved upgrade stats.

Technical parts:

- frontend checkpoint UI;
- Socket.IO upgrade event;
- backend room/player/checkpoint checks;
- C++ gold, health and damage update;
- end-game persistence.

Risk:

- evaluators may expect map/character/difficulty selection;
- present this as checkpoint-based gameplay customization.

### Gamification

Why:

- adds progression outside one match;
- improves profiles;
- reuses real gameplay stats.

What exists:

- profile progress bars;
- badge tiers;
- games played badges;
- wins badges;
- damage badges;
- gold badges.

Risk:

- no separate `Achievement` model;
- badges are derived from stats;
- thresholds must be explained.

### Real-time WebSocket

Why:

- instant room updates;
- instant chat;
- live gameplay sync.

What exists:

- authenticated Socket.IO;
- room events;
- chat events;
- ready/start events;
- game state updates;
- reconnect/resync path.

Risk:

- console debug remains;
- WSS must be verified in Chrome.

## Technical Decisions

### React + Vite

Chosen for:

- component UI;
- stateful pages;
- simple build;
- fast development.

Trade-off:

- hash routing is simple;
- less powerful than React Router.

### Bootstrap + custom CSS

Chosen for:

- forms;
- buttons;
- navigation;
- tables;
- responsive base.

Custom CSS:

- game layout;
- canvas UI;
- project visual style.

Trade-off:

- more control;
- consistency must be checked manually.

### Express

Chosen for:

- simple REST API;
- clear route files;
- easy team explanation.

Trade-off:

- validation consistency is manual.

### Socket.IO

Chosen for:

- room state;
- chat;
- ready/start;
- game sync;
- reconnect support.

Trade-off:

- socket lifecycle must be clean;
- browser console must be checked.

### Prisma + PostgreSQL

Chosen for:

- relational data;
- migrations;
- model relations;
- persistent stats.

Trade-off:

- migrations must replay on a clean DB.

### Nginx HTTPS

Chosen for:

- single HTTPS entrypoint;
- `/api` routing;
- `/socket.io` routing;
- frontend proxy.

Trade-off:

- local certs may need browser acceptance.

### C++ Game Engine

Chosen for:

- real gameplay simulation;
- stronger technical challenge;
- separation from web backend.

Trade-off:

- harder debugging;
- state crosses frontend, backend and C++.

## Database Schema

Schema:

- `backend/prisma/schema.prisma`

Models:

- `User`: username, email, password, OAuth id, avatar.
- `Room`: room owner and status.
- `RoomPlayer`: user in room, ready state.
- `RefreshToken`: token, expiry, revoked flag.
- `GameRun`: result, duration, room.
- `PlayerRunStats`: deaths, damage, gold, upgrades.

## Validation and Security

Rule:

- frontend validation helps UX;
- backend validation is mandatory;
- direct API calls must be rejected if invalid.

Current status:

| Area | Frontend | Backend | Remaining |
|---|---|---|---|
| Register/login | Partial | Partial | formats, lengths, types |
| Profile | Partial | Partial | username rules |
| Avatar URL | Partial | Good partial | frontend constraints |
| Friends | Partial | Partial | positive integer checks |
| Rooms | Partial | Partial | length limits |
| Chat | Partial | Partial | max length |
| Player input | Implemented | Validated | runtime tests |
| Checkpoint upgrades | Implemented | Validated | runtime tests |

Known code tasks:

- add missing form `name`;
- add `autocomplete`;
- add frontend constraints;
- strengthen backend auth validation;
- clean debug logs.

## Privacy and Terms

Docs:

- [Privacy Policy](docs/privacy-policy.md)
- [Terms of Service](docs/terms-of-service.md)
- [Privacy/Terms module notes](docs/modules/privacy-terms.md)

Current status:

- Markdown docs exist;
- content is not placeholder;
- content matches current app behavior;
- frontend pages are not integrated yet.

Remaining code task:

- make Privacy and Terms accessible from the app UI.

## Browser Console Checklist

Test in Chrome:

- register;
- login;
- logout;
- OAuth return;
- profile view/update;
- friends add/remove/list;
- room create/join;
- chat;
- ready/start;
- game movement;
- attacks;
- checkpoint upgrades;
- end screen;
- match history;
- leaderboard.

Known risks:

- frontend debug logs;
- `window.socket`;
- `debug:latency`;
- missing form `name`;
- missing autocomplete;
- WebSocket close-before-established warning.

## Team

| Login | Main area |
|---|---|
| nicolsan | PM, Scrum Master, frontend UI, QA |
| yaoberso | Backend API, database, Prisma |
| mm-furi | WebSocket, rooms, multiplayer sync |
| ylabussi | Gameplay, C++ simulation |
| malapoug | Auth, users, scores |

Each member should explain:

- global architecture;
- auth/token flow;
- room/socket flow;
- game engine bridge;
- DB schema;
- Docker/Nginx;
- own module;
- one teammate module.

## Branch Workflow

Branches:

- `main`: stable demo/release.
- `dev`: integration.

Flow:

```txt
feature/... -> area/... -> dev -> main
```

Examples:

- `area/front`
- `area/backend-api-db`
- `area/websocket-multiplayer`
- `area/gameplay-cpp`
- `area/auth-users-scores`
- `area/docker-setup`

## AI Usage

AI tools were used as support.

Used for:

- planning;
- documentation;
- explanations;
- checklists;
- review support;
- test ideas;
- bug investigation;
- patch suggestions;
- learning examples.

Team responsibility:

- final features were chosen by the team;
- code was adapted to our project;
- final code must be understood by the team;
- the team remains responsible for the final project.
