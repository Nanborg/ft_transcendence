# Formats JSON V1 jeu

Statut: contrat V1 aligne avec le game engine.

But: garder un format simple a traiter par le moteur, le backend et le front.
Le backend ne doit pas inventer un format front trop different du moteur.

## Regles communes

- Tous les messages applicatifs sont en JSON.
- Tous les messages de jeu contiennent `roomId`.
- Le temps de reference est `tick`.
- Le temps reel en secondes sert surtout a l'affichage et a la sauvegarde.
- Le game engine ne gere pas le timer en secondes.
- Le backend est la source officielle du temps de partie en secondes.
- Le frontend peut afficher un timer local base sur `serverStartedAt`.
- Les entities moteur utilisent des IDs numeriques.
- Le front peut afficher selon `typeId`.
- Les donnees joueur qui ne sont pas des entities restent dans `playerData`.
- La creation et la modification d'entity passent par `entityUpdate`.
- La suppression d'entity passe par `entityDelete`.

## 1. Creation de room moteur

Envoye par le backend au moteur quand une room de jeu est creee.

```json
{
  "roomId": "room-123",
  "scale": 1000,
  "entities": [
    {
      "typeId": 42,
      "posX": 1800,
      "posY": 266,
      "velX": 0,
      "velY": 0,
      "state": {
        "blocking": true
      }
    }
  ]
}
```

Regles:

- `scale` sert de base commune pour les tailles, coordonnees et vitesses.
- `entityId` est ignore a la creation.
- Une entity est ignoree si son `typeId` n'est pas constructible par le moteur.
- Les joueurs, hitboxes et projectiles ne doivent pas etre spawnes depuis ce
  payload si le moteur les cree lui-meme.
- La map visuelle n'est pas envoyee au moteur.
- Le backend convertit la map en entities/colliders constructibles.

## 2. game:state:init

Envoye par le backend au frontend au debut d'une partie.

Le moteur peut produire ce message comme une resync normale apres creation de la
room.

```json
{
  "roomId": "room-123",
  "tick": 0,
  "serverStartedAt": 1750000000000,
  "end": false,
  "map": {
    "width": 50000,
    "height": 50000,
    "scale": 1000
  },
  "entities": [
    {
      "entityId": 42,
      "typeId": 6,
      "posX": 120,
      "posY": 300,
      "velX": 0,
      "velY": 30,
      "health": 400,
      "state": {
        "animation": "running",
        "direction": "NW"
      }
    }
  ],
  "playerData": [
    {
      "playerId": 12,
      "playerEntityId": 42,
      "username": "Nanborg",
      "deaths": 0,
      "alive": true,
      "disconnected": false,
      "upgrades": {
        "melee": 1,
        "ranged": 1,
        "shield": 1
      },
      "cooldowns": {
        "melee": 0,
        "ranged": 0,
        "shield": 0
      }
    }
  ]
}
```

Regles:

- `entities` contient l'etat moteur affichable.
- `playerData` contient les infos joueur qui ne doivent pas etre traitees comme
  des entities.
- `playerEntityId` relie un joueur a son entity moteur.
- `cooldowns` sont en ticks restants.
- `serverStartedAt` permet au front d'afficher un timer local pendant la partie.
- `map` contient les metadonnees statiques de la map envoyees au debut de
  partie et lors d'une resync.
- `map.width` et `map.height` sont exprimes dans le meme espace de coordonnees
  que les entities.
- `map.scale` sert a convertir les cases de la map en coordonnees moteur.

## 3. game:state:update

Envoye par le backend au frontend pendant la partie.

```json
{
  "roomId": "room-123",
  "tick": 42,
  "end": false,
  "entityUpdate": [
    {
      "entityId": 42,
      "typeId": 6,
      "posX": 140,
      "posY": 300,
      "velX": 20,
      "velY": 0,
      "health": 360,
      "state": {
        "animation": "running",
        "direction": "E"
      }
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
      "username": "Nanborg",
      "deaths": 0,
      "alive": true,
      "disconnected": false,
      "upgrades": {
        "melee": 1,
        "ranged": 1,
        "shield": 1
      },
      "cooldowns": {
        "melee": 0,
        "ranged": 12,
        "shield": 0
      }
    }
  ]
}
```

Regles front:

- `entityUpdate` cree l'entity si elle n'existe pas.
- `entityUpdate` met a jour l'entity si elle existe deja.
- `entityDelete` supprime l'entity de l'etat local.
- Si le front a besoin d'un etat complet, il demande `game:resync`.
- Si un update arrive en retard ou manque, TCP doit normalement garantir
  l'ordre et la livraison.

## 4. game:resync

Envoye par le frontend au backend pour redemander un snapshot complet.

```json
{
  "roomId": "room-123"
}
```

Reponse attendue:

```txt
backend -> frontend: game:state:init
```

## 5. game:end

Envoye par le backend au frontend quand la partie est terminee.

Le format reste proche de `game:state:init`, avec `end: true` et `win`.
Le backend calcule `durationSeconds` avec son heure de debut et son heure de fin.

```json
{
  "roomId": "room-123",
  "tick": 8540,
  "durationSeconds": 420,
  "end": true,
  "win": true,
  "reason": "boss_defeated",
  "entities": [
    {
      "entityId": 1,
      "typeId": 100,
      "posX": 2800,
      "posY": 2800,
      "velX": 0,
      "velY": 0,
      "health": 0,
      "state": {
        "animation": "dead",
        "direction": "S"
      }
    }
  ],
  "playerData": [
    {
      "playerId": 12,
      "playerEntityId": 42,
      "username": "Nanborg",
      "deaths": 1,
      "alive": true,
      "disconnected": false,
      "upgrades": {
        "melee": 2,
        "ranged": 1,
        "shield": 3
      },
      "cooldowns": {
        "melee": 0,
        "ranged": 0,
        "shield": 0
      }
    }
  ]
}
```

Valeurs possibles pour `reason`:

```txt
boss_defeated
all_players_dead
all_players_left
engine_error
```

## 6. game:error

Envoye par le backend au frontend si la partie rencontre une erreur.

```json
{
  "roomId": "room-123",
  "code": "ENGINE_UNAVAILABLE",
  "message": "Game engine unavailable"
}
```

Codes proposes:

```txt
ENGINE_UNAVAILABLE
INVALID_GAME_STATE
GAME_END_PROCESSING_FAILED
RESYNC_FAILED
ROOM_NOT_FOUND
PLAYER_NOT_IN_ROOM
```

## 7. Inputs frontend -> backend

### player:input movement

```json
{
  "roomId": "room-123",
  "input": {
    "kind": "movement",
    "up": false,
    "down": false,
    "left": false,
    "right": true,
    "direction": "E"
  }
}
```

### player:input ability

```json
{
  "roomId": "room-123",
  "input": {
    "kind": "ability",
    "ability": "ranged",
    "pressed": true,
    "direction": "E",
    "targetEntityId": 18
  }
}
```

Valeurs possibles pour `ability`:

```txt
melee
ranged
shield
```

Regles:

- `melee` se declenche une fois.
- `ranged` se declenche une fois.
- `shield` reste actif tant que `pressed` vaut `true`.
- `direction` doit etre envoyee pour que le moteur sache ou attaquer.
- `targetEntityId` est optionnel et sert si une touche de focus est ajoutee.

### player:input freeze

```json
{
  "roomId": "room-123",
  "input": {
    "kind": "freeze",
    "playerId": 12,
    "frozen": true
  }
}
```

Utilisation:

- mettre un joueur en pause moteur pendant une deconnexion ou un etat bloque ;
- remettre le joueur actif avec `frozen: false`.

### checkpoint:interact

```json
{
  "roomId": "room-123",
  "checkpointId": "checkpoint-1"
}
```

### checkpoint:upgrade

```json
{
  "roomId": "room-123",
  "checkpointId": "checkpoint-1",
  "ability": "ranged"
}
```

## 8. Match history response

Retour de `/scores/history` pour le joueur connecte.

```json
[
  {
    "gameRunId": 101,
    "roomId": "room-123",
    "result": "won",
    "reason": "boss_defeated",
    "durationSeconds": 420,
    "createdAt": 1750000420000,
    "players": [
      {
        "playerId": 12,
        "username": "Nanborg",
        "deaths": 1,
        "damageDealt": 4200,
        "damageReceived": 300,
        "upgrades": {
          "melee": 2,
          "ranged": 1,
          "shield": 3
        }
      }
    ]
  }
]
```

## 9. Leaderboard response

Retour de `/scores/leaderboard`.

Le leaderboard contient uniquement les parties victorieuses et trie par meilleur
temps.

```json
[
  {
    "rank": 1,
    "gameRunId": 101,
    "roomId": "room-123",
    "durationSeconds": 420,
    "createdAt": 1750000420000,
    "players": [
      {
        "playerId": 12,
        "username": "Nanborg"
      },
      {
        "playerId": 13,
        "username": "Princia"
      }
    ]
  }
]
```
