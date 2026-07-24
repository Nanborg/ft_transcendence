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

#### POST /signin

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
  "message": "Sign up success",
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

Reference moteur: `engine_io.md`.

`playerId`, `entityId` et `typeId` sont les trois systemes d'identification pour respectivement:
- les joueurs uniquement;
- toutes les entites, y compris batiments, projectiles, joueurs, etc.;
- le type de ces entites, defini manuellement et commun avec les assets du client.

### 5.1 Backend -> moteur

Le champ `type` est un nombre.

Types d'input attendus:

- ping `"type" = 0`: aucun autre champ n'est attendu.
- player join `"type" = 1`: id du joueur en question `"playerId" = 8`.
- player leave `"type" = 2`: id du joueur en question `"playerId" = 8`.
- player move `"type" = 3`: id du joueur en question `"playerId" = 8`, vecteur direction dans laquelle avancer `"X" = 22, "Y" = 7`.
- build `"type" = 4`: id du joueur en question `"playerId" = 8`, position de la nouvelle entite `"X" = 22, "Y" = 7`, type de la nouvelle entite `"typeId" = 2`.
- delete `"type" = 5`: id du joueur en question `"playerId" = 8`, id de l'entite a supprimer `"entityId" = 150`.

Inputs prevus:

- attaque corps-a-corps (`"type" = 6`)
- attaque a distance (`"type" = 7`)
- attaque ciblee (`"type" = 8`)
- game start (`"type" = 9`)
- game stop (`"type" = 10`)

Input pour construire un batiment de type 6 a la position x,y = (10, -5) en tant que joueur 12:

```json
{
  "type": 4,
  "playerId": 12,
  "X": 10,
  "Y": -5,
  "typeId": 6
}
```

Input pour deplacer joueur 4 dans la direction x,y = (21, 13):

```json
{
  "type": 3,
  "playerId": 4,
  "X": 21,
  "Y": 13
}
```

### 5.2 Moteur -> Backend

Champs toujours presents:

- `type`: le type de message.
- `tick`: nombre correspondant au tick ou le message a ete envoye.

Le moteur peut envoyer plusieurs types de messages:

- `"type" = "ping"`: reponse aux inputs ping, envoie un ensemble de donnees de monitoring:
  - `uspt`: microsecondes par tick.
  - `entities`: nombre d'entites existantes.
  - `nextEntityId`: id de la prochaine entite creee.
- `"type" = "entityUpdate"`: quand une entite change d'etat, aussi utilise a la creation d'une entite. Le nouvel etat de l'entite est stocke dans le champ `entity`.
- `"type" = "entityDelete"`: quand une entite est supprimee. Le champ `entityId` contient l'id de l'entite en question.
- `"type" = "gameEnd"`: pour signaler la condition de fin du jeu, pas encore implemente.

Format d'un objet `entity`:

```json
{
  "entityId": 2657,
  "typeId": 9,
  "posX": 0,
  "posY": 0,
  "velX": 0,
  "velY": 0
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
