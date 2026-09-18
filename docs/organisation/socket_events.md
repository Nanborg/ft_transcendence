# Documentation du système de rooms Socket.IO

## Présentation

Ce document décrit l'ensemble des événements Socket.IO actuellement utilisés par le système de rooms multijoueur.

Le système permet actuellement :

* la création de rooms en mémoire ;
* la gestion des joueurs dans une room ;
* la gestion du propriétaire (owner) de la room ;
* le système Ready / Not Ready ;
* le chat entre joueurs ;
* le démarrage d'une partie ;
* les inputs de gameplay ;
* les mises à jour `game:state` / `game:end` ;
* la suppression automatique des rooms vides ;
* le retrait automatique des joueurs lors d'une déconnexion.

L'objectif de cette documentation est de servir de référence entre le frontend et le backend afin de garantir que les événements, les payloads et les réponses restent cohérents tout au long du projet.

# Structure d'une room

Une room possède la structure suivante :

```json
{
  "id": "room-123",
  "ownerId": 12,
  "players": [
    {
      "id": 12,
      "username": "Michel",
      "ready": false
    }
  ],
  "status": "waiting",
  "createdAt": 1780875004797
}
```

### Description des champs

| Champ     | Description                             |
| --------- | --------------------------------------- |
| id        | Identifiant unique de la room           |
| ownerId   | User ID du propriétaire de la room      |
| players   | Liste des joueurs présents dans la room |
| status    | État actuel de la room                  |
| createdAt | Date de création de la room (timestamp) |

---

# Événements Client → Serveur

## room:create

Permet de créer une nouvelle room.

### Payload

```json
{
  "roomName": "room-alpha"
}
```

### Validation

* `roomName` doit être une chaîne de caractères.

### Effets

* Création d'une room.
* Ajout du créateur comme premier joueur.
* Attribution du rôle de propriétaire au créateur.

### Événements émis

* `room:created`
* `room:update`

---

## room:join

Permet de rejoindre une room existante.

### Payload

```json
{
  "roomId": "room-123"
}
```

### Validation

* `roomId` doit être une chaîne de caractères.

### Erreurs possibles

```json
{
  "event": "room:join",
  "message": "Room not found"
}
```

```json
{
  "event": "room:join",
  "message": "Invalid payload"
}
```

### Événements émis

* `room:update`

---

## room:leave

Permet de quitter une room.

### Payload

```json
{
  "roomId": "room-123"
}
```

### Validation

* `roomId` doit être une chaîne de caractères.

### Effets

* Retire le joueur de la room.
* Supprime automatiquement la room si elle devient vide.

### Événements émis

* `room:update`

---

## player:ready

Permet de changer son état Ready / Not Ready.

### Payload

```json
{
  "roomId": "room-123"
}
```

### Validation

* `roomId` doit être une chaîne de caractères.
* Le joueur doit appartenir à la room.

### Événements émis

* `room:update`

---

## chat:message

Permet d'envoyer un message à tous les joueurs présents dans la room.

### Payload

```json
{
  "roomId": "room-123",
  "message": "Salut tout le monde"
}
```

### Validation

* `roomId` doit être une chaîne de caractères.
* `message` doit être une chaîne non vide.
* Le joueur doit appartenir à la room.

### Événements émis

* `chat:message`

---

## game:start

Permet de démarrer une partie.

### Payload

```json
{
  "roomId": "room-123"
}
```

### Conditions

* La room doit exister.
* Le joueur doit appartenir à la room.
* La room doit contenir au moins un joueur.
* Tous les joueurs doivent être Ready.

### Événements émis

* `game:start`

### Erreurs possibles

```json
{
  "event": "game:start",
  "message": "All players must be ready"
}
```

---

## player:input

Permet d'envoyer les inputs de déplacement et d'action pendant une partie.

### Payload

```json
{
  "roomId": "room-123",
  "input": {
    "up": false,
    "down": false,
    "left": false,
    "right": true,
    "action": 0
  }
}
```

Actions:

* `0`: aucune action
* `1`: melee
* `2`: ranged
* `3`: shield

---

## checkpoint:upgrade

Permet d'acheter une amélioration depuis un checkpoint.

### Payload

```json
{
  "roomId": "room-123",
  "upgrade": "melee"
}
```

Valeurs possibles: `melee`, `ranged`, `shield`.

---

# Événements Serveur → Client

## room:created

Envoyé uniquement au créateur de la room.

### Exemple

```json
{
  "id": "room-123",
  "ownerId": 12,
  "players": [
    {
      "id": 12,
      "username": "Michel",
      "ready": false
    }
  ],
  "status": "waiting",
  "createdAt": 1780875004797
}
```

---

## room:update

Envoyé à tous les joueurs de la room lorsqu'un changement survient.

Déclenché lors :

* de la création d'une room ;
* de l'arrivée d'un joueur ;
* du départ d'un joueur ;
* d'un changement d'état Ready ;
* d'une déconnexion.

### Exemple

```json
{
  "id": "room-123",
  "ownerId": 12,
  "players": [
    {
      "id": 12,
      "username": "Michel",
      "ready": true
    },
    {
      "id": 13,
      "username": "Bob",
      "ready": false
    }
  ],
  "status": "waiting",
  "createdAt": 1780875004797
}
```

---

## chat:message

Envoyé à tous les joueurs de la room.

### Exemple

```json
{
  "author": {
    "id": 12,
    "username": "Michel"
  },
  "message": "Salut Bob",
  "timestamp": 1780875004797
}
```

---

## game:start

Envoyé à tous les joueurs lorsque la partie démarre.

### Exemple

```json
{
  "roomId": "room-123",
  "status": "starting",
  "players": [
    {
      "id": 12,
      "username": "Michel",
      "ready": true
    }
  ],
  "timestamp": 1780875004797
}
```

---

## game:state

Envoyé pendant la partie pour synchroniser les entités et les données joueurs.

### Exemple

```json
{
  "roomId": "room-123",
  "tick": 42,
  "entityUpdate": [
    {
      "entityId": 42,
      "typeId": 6,
      "posX": 140,
      "posY": 300,
      "velX": 20,
      "velY": 0,
      "health": 360,
      "state": 1
    }
  ],
  "entityDelete": [
    {
      "entityId": 99
    }
  ],
  "playerData": [
    {
      "playerId": 12,
      "playerEntityId": 42,
      "deaths": 0,
      "alive": true,
      "disconnected": false
    }
  ]
}
```

---

## game:end

Envoyé quand la partie est terminée.

### Exemple

```json
{
  "roomId": "room-123",
  "tick": 8540,
  "durationSeconds": 420,
  "end": true,
  "win": true,
  "reason": "boss_defeated",
  "playerData": [
    {
      "playerId": 12,
      "deaths": 1,
      "damageDealt": 4200,
      "damageReceived": 300,
      "alive": true,
      "disconnected": false
    }
  ]
}
```

---

## room:error

Envoyé lorsqu'une action ne peut pas être exécutée.

### Exemple

```json
{
  "event": "player:ready",
  "message": "Player is not in room"
}
```

### Exemple

```json
{
  "event": "game:start",
  "message": "All players must be ready"
}
```

---

# Cycle de vie d'une room

1. Un joueur envoie `room:create`.
2. Le serveur crée une room en mémoire.
3. Le créateur reçoit `room:created`.
4. Tous les joueurs de la room reçoivent `room:update`.
5. D'autres joueurs peuvent rejoindre la room avec `room:join`.
6. Les joueurs peuvent quitter la room avec `room:leave`.
7. Les joueurs déconnectés sont automatiquement retirés de la room.
8. Une room vide est automatiquement supprimée.

---

# Cycle de vie d'une partie

1. Les joueurs rejoignent la même room.
2. Les joueurs passent Ready via `player:ready`.
3. Le serveur diffuse les mises à jour avec `room:update`.
4. Lorsque tous les joueurs sont Ready, un joueur peut envoyer `game:start`.
5. Le statut de la room passe de `waiting` à `starting`.
6. Tous les joueurs reçoivent `game:start`.
7. Le backend diffuse les mises à jour `game:state`.
8. Le backend diffuse `game:end` quand la partie est terminée.

---

# Tests manuels

Afin de faciliter les tests manuels, exposez l'instance Socket.IO dans la console du navigateur :

```javascript
window.socket = socket;
```

Ajoutez également les listeners suivants dans le frontend :

```javascript
socket.on("room:created", console.log);
socket.on("room:update", console.log);
socket.on("room:error", console.log);
socket.on("chat:message", console.log);
socket.on("game:start", console.log);
socket.on("game:state", console.log);
socket.on("game:end", console.log);
```

Les commandes suivantes peuvent ensuite être exécutées directement dans la console du navigateur.

## Créer une room

```javascript
window.socket.emit("room:create", {
  roomName: "room-alpha"
});
```

## Rejoindre une room

```javascript
window.socket.emit("room:join", {
  roomId: "room-123"
});
```

## Quitter une room

```javascript
window.socket.emit("room:leave", {
  roomId: "room-123"
});
```

## Changer son état Ready

```javascript
window.socket.emit("player:ready", {
  roomId: "room-123"
});
```

## Envoyer un message

```javascript
window.socket.emit("chat:message", {
  roomId: "room-123",
  message: "Salut"
});
```

## Démarrer une partie

```javascript
window.socket.emit("game:start", {
  roomId: "room-123"
});
```

## Envoyer un input

```javascript
window.socket.emit("player:input", {
  roomId: "room-123",
  input: {
    up: false,
    down: false,
    left: false,
    right: true,
    action: 0
  }
});
```
