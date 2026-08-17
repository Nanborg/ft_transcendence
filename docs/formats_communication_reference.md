# Reference unique des formats de communication (LEAN)

Date de mise a jour: 2026-08-10
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
    "roomId": "room-123",
    "result": "win",
    "durationSeconds": 249,
    "createdAt": "2026-08-10T12:00:00.000Z",
    "players": [
      {
        "playerId": 12,
        "username": "alice",
        "deaths": 1,
        "damageDealt": 3200,
        "damageReceived": 600,
        "upgrades": {
          "melee": 1,
          "ranged": 0,
          "shield": 2
        }
      }
    ]
  }
]
```

#### GET /scores/leaderboard -> 200

```json
[
  {
    "rank": 1,
    "gameRunId": 101,
    "roomId": "room-123",
    "durationSeconds": 249,
    "createdAt": "2026-08-10T12:00:00.000Z",
    "players": [
      {
        "playerId": 12,
        "username": "alice"
      }
    ]
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
    "action": 0
  }
}
```

Actions:
- `0`: none
- `1`: melee
- `2`: ranged
- `3`: shield

`checkpoint:upgrade`:

```json
{
  "roomId": "room-123",
  "upgrade": "melee"
}
```

Upgrades possibles: `melee`, `ranged`, `shield`.

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
  "entities": [
    {
      "entityId": 2657,
      "typeId": 9,
      "posX": 120,
      "posY": 180,
      "velX": 1,
      "velY": 0,
      "health": 80,
      "state": 1
    }
  ],
  "timestamp": 1751556500016
}
```

- `game:end`:

```json
{
  "roomId": "room-123",
  "status": "ended",
  "tick": 30000,
  "victory": true,
  "reason": "objective_complete",
  "durationSeconds": 249,
  "players": [
    {
      "enginePlayerId": 1,
      "deaths": 1,
      "damageDealt": 3200,
      "damageReceived": 600,
      "upgrades": {
        "melee": 1,
        "ranged": 0,
        "shield": 2
      },
      "alive": true
    }
  ],
  "timestamp": 1751556599000
}
```

- `room:error`:

```json
{ "event": "player:input", "message": "Invalid payload" }
```

## 5) Backend <-> moteur (JSON)

Reference moteur: `docs/V_1/formats_json_v1_game.md`.

`playerId`, `entityId` et `typeId` sont les trois systemes d'identification pour respectivement:
- les joueurs uniquement;
- toutes les entites, y compris batiments, projectiles, joueurs, etc.;
- le type de ces entites, defini manuellement et commun avec les assets du client.

### 5.1 Backend -> moteur

Le champ `type` est un nombre.

Types d'input attendus:

- room create `"type" = 0`: id de room + fichier d'entites.
- room destroy `"type" = 1`: id de room.
- room start `"type" = 2`: id de room.
- room stop `"type" = 3`: id de room.
- ping `"type" = 100`: aucun autre champ n'est attendu.
- sync `"type" = 101`: demande d'etat complet.
- player join `"type" = 110`: id du joueur en question `"playerId" = 8`.
- player leave `"type" = 111`: id du joueur en question `"playerId" = 8`.
- player move `"type" = 112`: id du joueur en question `"playerId" = 8`, vecteur `"velX"` / `"velY"`.
- player action `"type" = 113`: id du joueur en question `"playerId" = 8`, action `"action" = 1`.

Input pour creer une room:

```json
{
  "type": 0,
  "roomId": "room-123",
  "entitiesFile": "assets/maps/level1.entities"
}
```

Input pour deplacer joueur 4:

```json
{
  "type": 112,
  "playerId": 4,
  "velX": 1,
  "velY": 0
}
```

Input pour action joueur 4:

```json
{
  "type": 113,
  "playerId": 4,
  "action": 1
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
- `"type" = "entityDelete"`: quand une entite est supprimee. Le champ `entity.entityId` contient l'id de l'entite en question.
- `"type" = "playerData"`: stats d'un joueur pendant ou en fin de partie.
- `"type" = "gameEnd"`: pour signaler la condition de fin du jeu.

Format d'un objet `entity`:

```json
{
  "entityId": 2657,
  "typeId": 9,
  "posX": 0,
  "posY": 0,
  "velX": 0,
  "velY": 0,
  "health": 100,
  "state": 1
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
