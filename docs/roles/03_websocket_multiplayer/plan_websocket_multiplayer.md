# Role 3 - WebSocket / Multiplayer

## Mission

Gerer le temps reel : rooms, chat, ready system, lancement de partie, inputs
joueurs, diffusion de l'etat de jeu et deconnexions.

Ce role fait le pont entre le frontend, le gameplay et parfois le backend API.

## Responsabilites

- configurer Socket.IO cote serveur ;
- configurer Socket.IO cote client ;
- gerer les rooms ;
- gerer le chat live ;
- gerer le ready system ;
- lancer une partie depuis une room ;
- transmettre les inputs joueurs au gameplay ;
- recevoir ou relayer `game:state` ;
- diffuser l'etat aux clients ;
- gerer `game:end` ;
- gerer deconnexion et reconnexion simple ;
- documenter les payloads.

## Events principaux

```txt
room:create
room:join
room:leave
player:ready
chat:message
game:start
player:input
game:state
game:end
```

## Payloads a documenter

```txt
player:input
  playerId
  direction
  action
  timestamp

game:state
  players
  enemies
  projectiles
  xp
  resources
  objectiveState
  score

game:end
  roomId
  victory
  score
  playerStats
```

## Ordre de travail conseille

1. Connecter Socket.IO.
2. Tester connexion / deconnexion.
3. Creer / rejoindre / quitter une room.
4. Ajouter liste des joueurs.
5. Ajouter chat de room.
6. Ajouter ready system.
7. Lancer une partie depuis la room.
8. Envoyer `player:input`.
9. Diffuser `game:state`.
10. Gerer `game:end`.

## Regles importantes

- le client ne decide pas seul du score final ;
- les rooms doivent rester coherentes apres join / leave ;
- les events doivent avoir des noms stables ;
- les payloads doivent etre simples ;
- tout doit etre testable avec plusieurs navigateurs.

## Definition of done

- plusieurs clients rejoignent la meme room ;
- le lobby reste coherent ;
- le chat fonctionne en temps reel ;
- le ready system fonctionne ;
- une partie peut etre lancee depuis la room ;
- les inputs arrivent au gameplay ;
- l'etat de jeu revient aux clients ;
- les formats importants sont compris par l'equipe.

## Points a surveiller

- tester tot avec deux ou trois navigateurs ;
- eviter les joueurs dupliques ;
- gerer les deconnexions simples ;
- garder les events synchronises avec le frontend ;
- garder les contrats synchronises avec le gameplay.

## A savoir expliquer

- cycle d'une room ;
- cycle ready -> start -> game -> end ;
- role de chaque event ;
- comment plusieurs clients restent synchronises ;
- comment une fin de partie arrive jusqu'au backend.

## Mise a jour 2026-08-10

Ce role doit aussi couvrir le pont actuel entre room Socket.IO, inputs frontend
et game engine.

Points deja avances:

- rooms, ready, start, leave et deconnexion fonctionnent;
- inputs de mouvement et actions sont transmis au moteur;
- `game:state` synchronise les entites et `playerData`;
- `game:end` alimente la sauvegarde des statistiques.
