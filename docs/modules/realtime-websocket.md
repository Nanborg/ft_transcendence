# Real-time WebSocket

## Goal

- synchronize rooms;
- synchronize chat;
- synchronize ready state;
- synchronize game state.

## What Exists

- Socket.IO server;
- Socket.IO client;
- JWT socket auth;
- room events;
- chat events;
- game events;
- reconnect/resync path.

## Flow

Connection:

- user logs in;
- frontend creates socket;
- access token is sent in `auth.token`;
- backend verifies token;
- backend assigns `socket.user`.

Events:

- frontend emits event;
- backend validates payload;
- backend updates room, database or engine;
- backend emits update;
- frontend updates UI.

```mermaid
sequenceDiagram
  participant Frontend
  participant SocketIO
  participant Backend
  participant Room
  Frontend->>SocketIO: connect with token
  SocketIO->>Backend: verify token
  Backend-->>Frontend: connected
  Frontend->>Backend: emit event
  Backend->>Room: update room/game state
  Backend-->>Frontend: emit update
```

## Key Files

- `backend/src/middlewares/socketAuth.js`
- `backend/src/socket/connections.js`
- `backend/src/socket/socketHandler.js`
- `frontend/src/app.jsx`
- `frontend/src/features/room/useRoom.js`
- `frontend/src/features/game/usePlayerInput.js`

## Socket Events

- `connection:replaced`
- `room:create`
- `room:join`
- `room:update`
- `room:error`
- `chat:message`
- `player:ready`
- `game:start`
- `game:resync`
- `game:state:init`
- `game:state:update`
- `game:end`
- `player:input`

## Validation

Automatic checks:

- missing token rejected;
- invalid token rejected;
- room payloads checked;
- player membership checked;
- player input checked.

## Manual Checks

- login;
- verify socket connects;
- create room;
- join from another client;
- send chat;
- start game;
- disconnect/reconnect;
- verify resync;
- verify WSS in Chrome.

## Current Limitations

- browser console must be checked;
- debug socket logs should be removed before final evaluation.
