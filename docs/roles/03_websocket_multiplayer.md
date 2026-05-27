# Role 3 - WebSocket / Multiplayer

## Mission

Gerer toute la partie temps reel : rooms, chat, ready system, lancement de
partie, synchronisation des joueurs, lien avec le gameplay et deconnexions.

## Responsabilites principales

- configurer Socket.IO cote serveur ;
- configurer Socket.IO cote client ;
- gerer les rooms ;
- gerer le chat live ;
- gerer le ready check ;
- transmettre les inputs joueurs ;
- diffuser l'etat de jeu ;
- definir les contrats avec le gameplay ;
- gerer les deconnexions et une reconnexion simple.

## Events possibles

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

## Taches principales

### Rooms

- creer une room ;
- rejoindre une room ;
- quitter une room ;
- lister les joueurs ;
- limiter a 4 joueurs ;
- prevenir les autres joueurs quand l'etat change.

### Chat

- envoyer un message ;
- recevoir les messages de la room ;
- afficher l'auteur et la date ;
- connecter ensuite la sauvegarde DB si possible.

### Ready system

- passer un joueur ready / not ready ;
- verifier que tous les joueurs sont ready ;
- lancer la partie quand les conditions sont reunies.

### Synchronisation jeu

- recevoir les inputs ;
- transmettre les inputs au gameplay ;
- recevoir ou relayer l'etat de jeu ;
- diffuser l'etat de jeu ;
- gerer la fin de partie.

### Contrats gameplay

Formats a definir avec le role gameplay :

```txt
player:input
game:state
game:end
```

Le role WebSocket doit garder ces formats simples, documentes et faciles a
tester avec plusieurs clients.

## Definition of done

- plusieurs clients peuvent rejoindre la meme room ;
- les events sont nommes clairement ;
- le lobby reste coherent apres join / leave ;
- le chat fonctionne en temps reel ;
- une partie peut etre lancee depuis la room.
- les formats `player:input`, `game:state` et `game:end` sont compris par les
  roles concernes.

## Points a surveiller

- tester tot avec plusieurs navigateurs ;
- definir les payloads des events avec le frontend et le jeu ;
- eviter que le client decide seul des resultats importants ;
- gerer les deconnexions sans casser la room.
