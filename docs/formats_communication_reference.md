# Reference unique des formats de communication (LEAN)

Date de mise a jour: 2026-07-10
Statut: source de verite equipe

Objectif:
- Garder uniquement les contrats critiques entre composants.
- Eviter les divergences front/backend/socket/moteur.

## 1) Decisions figees

1. Tous les echanges applicatifs sont en JSON.
2. Noms de champs en camelCase.
3. Horodatage en millisecondes Unix (`timestamp`).
4. Frontend <-> backend: JSON HTTP + JSON Socket.IO.
5. Backend <-> moteur: JSON (pas de binaire).
6. Le frontend ne pousse jamais un score officiel.

## 2) Format d'erreur standard

HTTP:

```json
{ "error": "Message lisible" }
```

Socket.IO:

```json
{ "event": "nom:event", "message": "Message lisible" }
```

## 3) HTTP critiques (Frontend <-> Backend)

Base URL: `/api`

### 3.1 Auth

#### POST /register

Request cible:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret"
}
```

Note transitoire:
- `name` peut etre accepte temporairement pendant migration front, mais la cible finale est `username`.

Success 201:

```json
{
  "message": "Register success",
  "userId": 12,
  "username": "alice"
}
```

#### POST /login

Request:

```json
{
  "username": "alice",
  "password": "secret"
}
```

Success 200:

```json
{
  "message": "Connection success",
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### POST /token

Request:

```json
{ "token": "refreshToken" }
```

Success 200:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Errors cibles:
- `401` token absent
- `403` token invalide/inconnu/expire/revoque

#### DELETE /logout

Request:

```json
{ "token": "refreshToken" }
```

Success cible:
- `204` (idempotent recommande)

### 3.2 Users/Friends

#### GET /users/me -> 200

```json
{
  "id": 12,
  "username": "alice",
  "email": "alice@example.com",
  "avatar": "..."
}
```

#### PATCH /users/me -> 200

Request:

```json
{ "username": "alice2", "avatar": "..." }
```

#### GET /users/search?search=ali -> 200

```json
[
  { "id": 12, "username": "alice", "email": "alice@example.com", "avatar": "..." }
]
```

#### GET /friends -> 200

```json
[
  { "id": 13, "username": "bob" }
]
```

#### POST /friends/:id -> 200

```json
{ "message": "Ami ajoute avec succes !" }
```

#### DELETE /friends/:id -> 200

```json
{ "message": "Ami retire avec succes !" }
```

### 3.3 Scores (cible)

#### GET /scores/history -> 200

```json
[
  {
    "gameRunId": 101,
    "endedAt": 1751556599000,
    "result": "win",
    "score": 12,
    "rank": 1
  }
]
```

#### GET /scores/leaderboard -> 200

```json
[
  {
    "userId": 12,
    "username": "alice",
    "wins": 10,
    "totalScore": 230,
    "rank": 1
  }
]
```

## 4) Socket.IO critiques (Frontend <-> Backend)

Auth handshake: Bearer access token valide

### 4.1 Client -> Server

```json
{ "event": "room:create", "payload": { "roomName": "room-alpha" } }
{ "event": "room:join", "payload": { "roomId": "room-123" } }
{ "event": "room:leave", "payload": { "roomId": "room-123" } }
{ "event": "player:ready", "payload": { "roomId": "room-123" } }
{ "event": "game:start", "payload": { "roomId": "room-123" } }
```

`player:input`:

```json
{
  "roomId": "room-123",
  "input": {
    "up": true,
    "down": false,
    "left": false,
    "right": true,
    "action": false
  }
}
```

### 4.2 Server -> Client

- `room:created` payload room
- `room:update` payload room
- `room:removed`:

```json
{ "roomId": "room-123" }
```

- `game:start`:

```json
{
  "roomId": "room-123",
  "status": "starting",
  "players": [],
  "timestamp": 1751556500000
}
```

- `player:input`:

```json
{
  "playerId": 12,
  "input": {
    "up": true,
    "down": false,
    "left": false,
    "right": true,
    "action": false
  },
  "timestamp": 1751556500000
}
```

- `game:state`:

```json
{
  "roomId": "room-123",
  "status": "running",
  "tick": 1043,
  "map": {
    "width": 1600,
    "height": 900
  },
  "players": [
    {
      "id": 12,
      "enginePlayerId": 1,
      "username": "alice",
      "x": 120,
      "y": 180,
      "velocityX": 1,
      "velocityY": 0,
      "hp": 80,
      "maxHp": 100,
      "xp": 15,
      "level": 1,
      "score": 120,
      "state": "alive"
    }
  ],
  "enemies": [
    {
      "id": 42,
      "enemyType": "basic",
      "x": 500,
      "y": 300,
      "velocityX": -1,
      "velocityY": 0,
      "hp": 20,
      "state": "alive"
    }
  ],
  "projectiles": [
    {
      "id": 99,
      "ownerId": 12,
      "x": 220,
      "y": 180,
      "velocityX": 5,
      "velocityY": 0,
      "damage": 10
    }
  ],
  "resources": [
    {
      "id": 7,
      "resourceType": "xp",
      "x": 640,
      "y": 420,
      "amount": 5
    }
  ],
  "objective": {
    "type": "survive",
    "status": "running",
    "progress": 45,
    "target": 100
  },
  "score": {
    "team": 230,
    "kills": 8,
    "resources": 12
  },
  "timestamp": 1751556500016
}
```

- `game:end`:

```json
{
  "roomId": "room-123",
  "status": "ended",
  "tick": 30000,
  "durationMs": 249000,
  "victory": true,
  "reason": "objective_complete",
  "score": {
    "team": 1200,
    "kills": 42,
    "resources": 31
  },
  "players": [
    {
      "id": 12,
      "enginePlayerId": 1,
      "username": "alice",
      "score": 650,
      "kills": 24,
      "deaths": 1,
      "damageDone": 3200,
      "resourcesCollected": 18,
      "rank": 1,
      "state": "alive"
    },
    {
      "id": 18,
      "enginePlayerId": 2,
      "username": "bob",
      "score": 550,
      "kills": 18,
      "deaths": 2,
      "damageDone": 2600,
      "resourcesCollected": 13,
      "rank": 2,
      "state": "dead"
    }
  ],
  "finalState": {
    "objective": {
      "type": "survive",
      "status": "completed",
      "progress": 100,
      "target": 100
    }
  },
  "timestamp": 1751556599000
}
```

- `room:error`:

```json
{ "event": "player:input", "message": "Invalid payload" }
```

## 5) Backend <-> moteur (JSON)

### 5.1 Backend -> moteur

`player_input`:

```json
{
  "type": "player_input",
  "roomId": "room-123",
  "enginePlayerId": 1,
  "tick": 1042,
  "input": {
    "up": true,
    "down": false,
    "left": false,
    "right": true,
    "action": false
  },
  "timestamp": 1751556500000
}
```

`player_join`:

```json
{
  "type": "player_join",
  "roomId": "room-123",
  "enginePlayerId": 1,
  "timestamp": 1751556500000
}
```

`player_leave`:

```json
{
  "type": "player_leave",
  "roomId": "room-123",
  "enginePlayerId": 1,
  "timestamp": 1751556500000
}
```

### 5.2 Moteur -> Backend

`game_state`:

```json
{
  "type": "game_state",
  "roomId": "room-123",
  "tick": 1043,
  "entities": [
    {
      "id": 42,
      "entityType": "player",
      "x": 120,
      "y": 180,
      "velocityX": 1,
      "velocityY": 0,
      "size": 28,
      "teamId": 1,
      "state": "alive"
    }
  ],
  "timestamp": 1751556500016
}
```

`game_end`:

```json
{
  "type": "game_end",
  "roomId": "room-123",
  "tick": 30000,
  "reason": "score_limit",
  "players": [
    { "enginePlayerId": 1, "score": 12, "rank": 1 },
    { "enginePlayerId": 2, "score": 7, "rank": 2 }
  ],
  "timestamp": 1751556599000
}
```

## 6) Ce qui n'est pas dans ce fichier

1. Details UX frontend.
2. Messages chat produit detailes.
3. Details runtime interne moteur non exposes au backend.

Ces points peuvent vivre dans des docs specialisees.

## 7) Regle de changement

1. Toute evolution de contrat passe ici d'abord.
2. Validation equipe avant implementation.
3. Puis mise a jour code + tests.
