# Frontend UI

## Goal

- provide the browser interface;
- route pages;
- show game UI;
- show profile, friends and scores.

## What Exists

- React app;
- Vite setup;
- hash routing;
- page components;
- feature hooks;
- Bootstrap;
- custom CSS;
- split CSS files by feature/page;
- legal pages;
- global direct chat dock;
- canvas game rendering.

## Flow

- hash route changes;
- app selects page;
- page renders;
- hooks load data;
- API or Socket.IO updates state;
- UI refreshes.

## Key Files

- `frontend/src/app.jsx`
- `frontend/src/main.jsx`
- `frontend/src/routing/pages.js`
- `frontend/src/pages/`
- `frontend/src/features/`
- `frontend/src/styles.css`
- `frontend/src/styles/`
- `frontend/src/features/chat/`
- `frontend/src/features/game/canvas/`

## Manual Checks

- open each page;
- resize viewport;
- register/login;
- update profile;
- manage friends;
- create/join room;
- start game;
- check leaderboard/history;
- check Chrome console.

## Current Limitations

- form attributes need review;
- browser console must be cleaned;
- final console and form review still needed before evaluation.
