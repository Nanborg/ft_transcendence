# Presentation reunion - proposition de projet



## Pitch court

Le projet propose est un jeu web cooperatif inspire de *Vampire Survivors*.

Les joueurs peuvent se connecter, rejoindre une room, discuter, se mettre ready, lancer une partie et survivre ensemble a des vagues d'ennemis.

La partie peut se jouer de 1 a 4 joueurs. A la fin, le score et les statistiques sont sauvegardes pour alimenter un historique et un leaderboard.

## Pourquoi ce projet

Ce projet est interessant parce que les modules se renforcent entre eux au lieu d'etre ajoutes artificiellement.

- Le jeu 2D donne une demo claire et visible.
- Le lobby sert vraiment a lancer une partie.
- Socket.IO sert au lobby, au chat et au jeu.
- La base de donnees sert aux users, messages, scores et historiques.
- Les profils et le leaderboard donnent une raison d'avoir des utilisateurs.
- La customisation et la gamification peuvent etre ajoutees sans changer toute l'architecture.

Le travail peut aussi etre separe proprement entre 5 personnes : interface, backend, WebSocket, jeu, auth/scores.

## Pourquoi JavaScript / TypeScript

Personne dans l'equipe n'est forcement tres a l'aise avec JavaScript au depart, mais pour ce projet c'est probablement le choix le plus coherent.

### Raisons principales

- Le projet est une application web : le navigateur impose deja JavaScript cote client.
- React permet de construire les pages et composants rapidement.
- Phaser est fait pour du jeu 2D dans le navigateur.
- Node.js permet de garder le backend dans le meme ecosysteme que le frontend.
- Fastify donne un backend simple, structure et plus leger qu'un gros framework.
- Socket.IO simplifie le temps reel, les rooms, le chat et les deconnexions.
- TypeScript ajoute du typage et aide a eviter les erreurs entre frontend, backend et events WebSocket.

### Avantage pour l'integration

Utiliser TypeScript sur plusieurs parties permet de mieux partager :

- les types de joueurs ;
- les types de rooms ;
- les payloads Socket.IO ;
- les formats de scores ;
- les formats de reponses API.

Cela limite les problemes ou une partie envoie une donnee que l'autre partie ne comprend pas.

## Pourquoi pas C++ partout

C++ reste une option interessante, surtout avec notre experience 42, mais l'utiliser partout rendrait ce projet plus lourd.

Les difficultes principales seraient :

- connecter proprement C++ avec le navigateur ;
- ajouter plus de services a lancer ;
- gerer plus de communication entre services ;
- augmenter le temps de debug reseau ;
- compliquer l'integration avec OAuth, WebSocket, DB et frontend.

Une option raisonnable est de commencer avec une game logic en TypeScript. Si le projet avance bien et qu'une personne veut vraiment travailler cette partie, un service C++ separe peut etre envisage plus tard pour une partie precise de simulation.

## Stack proposee

| Partie | Choix | Pourquoi |
|---|---|---|
| Frontend | React + TypeScript | Pages, composants, typage |
| Jeu 2D | Phaser.js | Rendu 2D adapte au navigateur |
| Backend | Node.js + Fastify | API simple et meme ecosysteme que le front |
| Temps reel | Socket.IO | Rooms, chat, sync multijoueur |
| Database | PostgreSQL ou MySQL | Donnees utilisateurs, parties, scores |
| ORM | Prisma | Schema lisible, migrations, requetes plus simples |
| Auth | OAuth 42 | Connexion adaptee au contexte 42 |
| DevOps | Docker Compose | Lancement reproductible pour l'equipe |

## Qui fait quoi dans la stack

L'idee est de ne pas multiplier les langages inutilement. La majorite du projet reste dans l'ecosysteme JavaScript / TypeScript, ce qui rend l'installation et l'integration plus simples.

| Langage / outil | Utilisation dans le projet | Pourquoi c'est abordable |
|---|---|---|
| TypeScript | Code principal du frontend, du backend et d'une partie de la logique jeu | Meme syntaxe globale que JavaScript, avec du typage pour eviter beaucoup d'erreurs |
| JavaScript | Base executee par le navigateur et par Node.js | Indispensable cote web, beaucoup d'exemples et de documentation |
| React | Construction des pages : Home, Login, Lobby, Profile, Leaderboard | Demarrage rapide avec des composants reutilisables |
| Phaser | Affichage du jeu 2D dans le navigateur | Moteur deja fait pour les scenes, sprites, inputs, collisions simples |
| Node.js | Execution du serveur backend | Permet d'utiliser le meme langage cote serveur et cote client |
| Fastify | Routes API REST | Framework leger : routes, plugins, validation, reponses HTTP |
| Socket.IO | Communication temps reel | Gere deja les connexions, rooms, events, deconnexions et reconnexions de base |
| Prisma | Acces a la base de donnees | Schema clair, migrations, requetes plus lisibles que du SQL partout |
| SQL | Stockage persistant via PostgreSQL ou MySQL | Donnees classiques : users, parties, scores, messages |
| Docker Compose | Lancement des services | Une commande pour lancer frontend, backend et DB de maniere reproductible |

### Repartition simple des responsabilites techniques

```txt
React + TypeScript
-> pages, boutons, formulaires, affichage lobby/profil/leaderboard

Phaser + TypeScript
-> rendu du jeu, joueur, ennemis, projectiles, HUD, inputs

Fastify + TypeScript
-> routes API, users, scores, history, leaderboard

Socket.IO + TypeScript
-> rooms, chat, ready system, lancement de partie, synchronisation

Prisma + SQL
-> schema DB, migrations, sauvegarde des users/messages/parties

Docker Compose
-> lancement local du projet complet
```

### Pourquoi ca peut rester simple a mettre en place

- On peut demarrer avec des templates standards : React, Fastify, Prisma et Docker Compose.
- Chaque partie peut etre testee seule au debut : page React, route API, event Socket.IO, scene Phaser.
- Les connexions entre parties sont progressives : d'abord API simple, ensuite WebSocket, ensuite jeu.
- TypeScript permet de partager des types entre plusieurs parties au lieu de deviner les formats.
- Docker Compose evite que chaque membre configure la DB ou les services differemment.
- On peut garder une premiere version minimale avant d'ajouter les features plus complexes.

## Decoupage equipe a 5

| Membre | Role | Responsabilites |
|---|---|---|
| Membre 1 | PM / Scrum Master + Front/UI + QA | Organisation, issues, pages simples, integration, tests, demo |
| Membre 2 | Backend API / DB | Fastify, Prisma, routes REST, schema DB |
| Membre 3 | WebSocket / Multiplayer | Rooms, chat, ready system, events temps reel |
| Membre 4 | Game Developer / Phaser | Gameplay, rendu, ennemis, armes, collisions |
| Membre 5 | Auth / Users / Scores | OAuth 42, profils, amis, scores, history, leaderboard |

## Modules vises

### Base 14 points

| Module | Type | Points |
|---|---:|---:|
| Complete web-based game | Major | 2 |
| Remote players | Major | 2 |
| Multiplayer 3+ | Major | 2 |
| Frontend + backend framework | Major | 2 |
| Real-time / WebSocket | Major | 2 |
| User interaction | Major | 2 |
| Standard user management | Major | 2 |

**Total minimum : 14 points**

### Objectif 18 points

| Module | Type | Points |
|---|---:|---:|
| Game statistics + match history | Minor | 1 |
| ORM | Minor | 1 |
| Game customization | Minor | 1 |
| Gamification system | Minor | 1 |

**Total vise : 18 points**

## Plan de production propose

1. Setup technique : repo, Docker, React, Fastify, DB, Prisma, Socket.IO.
2. Auth et users : OAuth 42, profil, session/token, debut friends.
3. Lobby et chat : rooms, join/leave, ready, messages.
4. Gameplay local : joueur, ennemis, armes, collisions, HP, score.
5. Multijoueur : inputs, synchronisation, lancement depuis room, fin de partie.
6. Scores et historique : sauvegarde des parties, stats, leaderboard.
7. Polish et bonus : customisation, achievements, XP, UI plus propre.
8. Preparation evaluation : README, demo, points, explication des roles.

## Risques principaux

| Risque | Pourquoi c'est important | Reduction |
|---|---|---|
| JS/TS nouveau pour l'equipe | Ralentissement au debut | Garder une architecture simple et partager les exemples |
| Multijoueur instable | Le projet repose beaucoup dessus | Tester tot avec plusieurs clients |
| OAuth 42 bloquant | Sans auth, les profils et scores bloquent | Prevoir un fallback dev local |
| Integration tardive | Les parties peuvent marcher seules mais pas ensemble | Integrer chaque semaine |
| Trop de features | Le projet peut devenir incomplet | Prioriser 14 points avant 18 |
| Gameplay trop ambitieux | Peut consommer tout le temps | Faire une version simple avant le polish |

## Decisions a prendre en reunion

A la fin de la reunion, l'equipe doit valider :

- est-ce qu'on part sur ce concept de jeu coop ?
- est-ce qu'on accepte la stack TypeScript / React / Fastify / Phaser ?
- est-ce qu'on vise d'abord 14 points puis 18 si la base est stable ?
- est-ce que le decoupage en 5 roles convient ?
- qui prend quel role ?
- quel est le premier objectif de la semaine ?

## Conclusion courte

Ce projet est ambitieux, mais il est coherent si on garde une base simple et si on integre regulierement.

Le choix JavaScript / TypeScript demande un apprentissage au depart, mais il simplifie beaucoup l'integration web, le jeu navigateur et le temps reel. Pour ce projet precis, c'est probablement plus rentable que de forcer C++ sur des parties qui devront de toute facon communiquer avec le navigateur.
