# Role 4 - Game Developer / Phaser

## Mission

Construire le jeu 2D jouable dans le navigateur : rendu Phaser, gameplay minimum, ennemis, armes, collisions, score et integration progressive avec le multijoueur.

## Responsabilites principales

- creer la scene Phaser ;
- afficher le joueur ;
- gerer les inputs ;
- afficher les ennemis ;
- creer les vagues ;
- gerer les armes automatiques ;
- gerer les collisions ;
- gerer les HP ;
- produire un score ;
- preparer l'integration multijoueur.

## Gameplay minimum

- 1 a 4 joueurs ;
- deplacement clavier ;
- ennemis qui spawnent par vagues ;
- armes automatiques ;
- collisions ;
- points de vie ;
- degats ;
- score ;
- mort ;
- fin de partie.

## Conditions de partie

| Type | Condition |
|---|---|
| Defaite | Tous les joueurs sont morts |
| Victoire | Au moins un joueur survit jusqu'a la fin du timer |

Exemple : survivre 5 minutes.

## Taches principales

### Prototype local

- scene Phaser ;
- joueur controllable ;
- camera ou zone de jeu ;
- ennemis simples ;
- arme automatique ;
- collisions ;
- HP ;
- score.

### Integration avec React

- monter Phaser dans la page Game ;
- nettoyer la scene quand on quitte la page ;
- eviter les doubles instances ;
- exposer les events utiles au frontend.

### Integration multijoueur

- recevoir les joueurs distants ;
- afficher leurs positions ;
- separer rendu local et etat serveur ;
- utiliser les events Socket.IO definis avec le role WebSocket.

## Definition of done

- le jeu se lance depuis l'application ;
- un joueur peut bouger ;
- les ennemis apparaissent ;
- le joueur peut prendre des degats ;
- une partie peut finir ;
- un score est produit ;
- le comportement est assez stable pour une demo.

## Points a surveiller

- garder un gameplay simple au debut ;
- eviter de bloquer le projet sur le balancing ;
- ne pas faire confiance au client pour le score final ;
- documenter les inputs et les donnees attendues par le serveur.

