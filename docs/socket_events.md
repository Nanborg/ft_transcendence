# Documentation des événements Socket.IO

Ce document résume tous les événements Socket.IO actuellement utilisés dans le système de rooms.

L'objectif est que n'importe quel membre du projet puisse rapidement comprendre :

- quels événements existent
- qui envoie quoi
- quelles données sont attendues
- quelles données sont renvoyées

---

# Client -> Serveur

## room:create

Permet de créer une nouvelle room.

Payload :

```json
{
  "playerName": "Michel"
}
```

---

## room:join

Permet de rejoindre une room existante.

Payload :

```json
{
  "roomId": "room-123",
  "playerName": "Bob"
}
```

---

## room:leave

Permet de quitter une room.

Payload :

```json
{
  "roomId": "room-123"
}
```

---

## player:ready

Permet de changer son état Ready / Not Ready.

Payload :

```json
{
  "roomId": "room-123"
}
```

---

## chat:message

Permet d'envoyer un message aux joueurs présents dans la même room.

Payload :

```json
{
  "roomId": "room-123",
  "message": "Salut tout le monde"
}
```

---

## game:start

Permet de démarrer une partie.

Conditions :

- la room doit exister
- le joueur doit appartenir à la room
- tous les joueurs doivent être ready

Payload :

```json
{
  "roomId": "room-123"
}
```

---

# Serveur -> Client

## room:created

Envoyé au créateur de la room.

Exemple :

```json
{
  "id": "room-123",
  "ownerId": "socket-id",
  "players": [
    {
      "id": "socket-id",
      "name": "Michel",
      "ready": false
    }
  ],
  "status": "waiting",
  "createdAt": 1780875004797
}
```

---

## room:update

Envoyé à tous les joueurs de la room lorsqu'un changement a lieu.

Exemple :

```json
{
  "id": "room-123",
  "ownerId": "socket-id",
  "players": [
    {
      "id": "socket-id",
      "name": "Michel",
      "ready": true
    },
    {
      "id": "socket-id-2",
      "name": "Bob",
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

Exemple :

```json
{
  "author": {
    "id": "socket-id",
    "name": "Michel"
  },
  "message": "Salut Bob",
  "timestamp": 1780875004797
}
```

---

## game:start

Envoyé à tous les joueurs lorsque la partie démarre.

Exemple :

```json
{
  "roomId": "room-123",
  "status": "starting",
  "players": [
    {
      "id": "socket-id",
      "name": "Michel",
      "ready": true
    }
  ],
  "timestamp": 1780875004797
}
```

---

## room:error

Envoyé lorsqu'une action est refusée.

Exemple :

```json
{
  "event": "player:ready",
  "message": "player is not in room"
}
```

Autre exemple :

```json
{
  "event": "game:start",
  "message": "All players must be ready"
}
```

---

# Cycle de vie d'une room

1. Un joueur crée une room avec `room:create`
2. Le serveur crée la room en mémoire
3. Le créateur reçoit `room:created`
4. Tous les joueurs de la room reçoivent `room:update`
5. D'autres joueurs peuvent rejoindre avec `room:join`
6. Les joueurs peuvent quitter avec `room:leave`
7. Un joueur déconnecté est automatiquement retiré de la room
8. Une room vide est automatiquement supprimée

---

# Cycle de vie d'une partie

1. Les joueurs rejoignent la même room
2. Les joueurs passent Ready via `player:ready`
3. Le serveur diffuse les mises à jour avec `room:update`
4. Lorsque tous les joueurs sont Ready, un joueur peut envoyer `game:start`
5. Le statut de la room passe de `waiting` à `starting`
6. Tous les joueurs reçoivent `game:start`
7. La logique de gameplay sera ajoutée dans une étape suivante

---

# Tests manuels

Pour que vous puissiez faire des testes manuels correctement, il va faloir que vous ajoutiez
s'est logs dans frontend/src/app.jsx.

    window.socket = socket;

    socket.on('room:created', (room) => {
      console.log('room created', room);
    });

    socket.on('room:update', (room) => {
      console.log('room update', room);
    });

    socket.on('room:error', (error) => {
      console.log('room error', error);
    });

    socket.on('chat:message', (message) => {
      console.log('chat message', message);
    });

Il faut les mettre avant le return de useEffect si le frontend n'a pas évoluer d'ici là.
Et biensûr les commandes suivant sont à taper dans la console du navigateur.

## Création d'une room

```js
window.socket.emit("room:create", {
  playerName: "Michel"
});
```

## Rejoindre une room

```js
window.socket.emit("room:join", {
  roomId: "room-123",
  playerName: "Bob"
});
```

## Quitter une room

```js
window.socket.emit("room:leave", {
  roomId: "room-123"
});
```

## Changer son état Ready

```js
window.socket.emit("player:ready", {
  roomId: "room-123"
});
```

## Envoyer un message

```js
window.socket.emit("chat:message", {
  roomId: "room-123",
  message: "Salut"
});
```

## Démarrer une partie

```js
window.socket.emit("game:start", {
  roomId: "room-123"
});
```