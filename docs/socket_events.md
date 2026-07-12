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
* la suppression automatique des rooms vides ;
* le retrait automatique des joueurs lors d'une déconnexion.

L'objectif de cette documentation est de servir de référence entre le frontend et le backend afin de garantir que les événements, les payloads et les réponses restent cohérents tout au long du projet.

---
<!-- Princiamf2
TODO -> update this document to use authenticated user ids instead of socket ids.
The current backend stores room owners and players with user.id, so the contract should not mention socket-id as the stable player identity.
-->
# Structure d'une room

Une room possède la structure suivante :

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

### Description des champs

| Champ     | Description                             |
| --------- | --------------------------------------- |
| id        | Identifiant unique de la room           |
| ownerId   | Socket ID du propriétaire de la room    |
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
  "playerName": "Michel"
}
```

### Validation

* `playerName` doit être une chaîne de caractères.

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
  "roomId": "room-123",
  "playerName": "Bob"
}
```

### Validation

* `roomId` doit être une chaîne de caractères.
* `playerName` doit être une chaîne de caractères.

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

# Événements Serveur → Client

## room:created

Envoyé uniquement au créateur de la room.

### Exemple

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

### Exemple

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

### Exemple

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
7. La logique de gameplay sera implémentée lors d'une étape ultérieure du projet.

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
```

Les commandes suivantes peuvent ensuite être exécutées directement dans la console du navigateur.

## Créer une room

```javascript
window.socket.emit("room:create", {
  playerName: "Michel"
});
```

## Rejoindre une room

```javascript
window.socket.emit("room:join", {
  roomId: "room-123",
  playerName: "Bob"
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
