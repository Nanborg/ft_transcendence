# Plan general - ft_transcendence

## 1. Vision commune du projet

Le projet est une application web complete autour d'un jeu cooperatif 2D qui
melange survie, exploration, progression, ressources et defense de zone, dans l'esprit RPG.

L'objectif n'est pas seulement de faire un mini-jeu, mais de construire une
experience complete :

- connexion utilisateur ;
- profil ;
- amis ;
- lobby ;
- rooms ;
- chat ;
- ready system ;
- lancement de partie ;
- jeu coop 1 a 4 joueurs ;
- sauvegarde des scores ;
- historique des parties ;
- leaderboard ;
- progression gameplay.

La premiere boucle jouable doit rester simple et defendable : plusieurs joueurs
apparaissent sur une map 2D, se deplacent, affrontent des menaces, gagnent du
score, progressent pendant la partie, puis les resultats sont sauvegardes dans
l'application.

Les idees d'exploration, de ressources, de defense, d'automatisation legere et
de mini-MMO font partie de la direction du projet. Elles sont organisees en
etapes progressives pour que chaque ajout repose sur une version deja jouable.

## 2. Concept final du gameplay

Le gameplay vise une version hybride qui rassemble les idees principales de
l'equipe autour d'une meme boucle jouable :

1. controle d'un personnage sur une map 2D ;
2. dangers, ennemis et survie ;
3. progression courte pendant la partie ;
4. exploration et ressources simples ;
5. defense de zone ;
6. automatisation legere, boss, biomes et polish.

Le concept final possible :

> 1 a 4 joueurs explorent une map 2D, affrontent des vagues d'ennemis,
> recuperent XP et ressources, ameliorent leur personnage, construisent quelques
> defenses simples, puis protegent une zone centrale le plus longtemps possible.

Le point de depart doit deja contenir les pieces utilisees par tout le concept :
deplacement, map, interactions, ennemis, score et multijoueur. Ces elements
servent autant aux combats qu'a l'exploration, a la collecte, aux defenses et
aux interactions de groupe.

## 3. Gameplay par couches

### Couche 1 - Map et personnage

Objectif : avoir quelque chose de visible et controlable.

- map 2D simple ;
- un joueur affiche ;
- deplacement clavier ;
- camera ou vue centree ;
- limites de map.

Resultat attendu : on lance le jeu et on peut bouger.

### Couche 2 - Monde jouable

Objectif : donner une vraie sensation d'espace.

- obstacles ;
- collisions ;
- zones simples ;
- HUD minimal ;
- vie du joueur ;
- timer.

Resultat attendu : le joueur se deplace dans un espace coherent.

### Couche 3 - Premiers dangers

Objectif : rendre la map vivante et creer une premiere pression de jeu.

- ennemis qui apparaissent ;
- ennemis qui suivent le joueur ;
- contact = degats ;
- HP joueur ;
- mort ;
- score base sur le temps de survie ou les ennemis elimines.

Resultat attendu : le jeu devient jouable en solo et permet deja de tester
collisions, degats, mort et score.

### Couche 4 - Combat automatique

Objectif : avoir la boucle principale.

- arme automatique ;
- projectiles ;
- cooldown ;
- degats aux ennemis ;
- ennemis qui meurent ;
- score par kill.

Boucle obtenue :

```txt
bouger -> eviter -> tirer automatiquement -> tuer -> survivre
```

### Couche 5 - XP et upgrades

Objectif : ajouter de la progression pendant la partie.

- orbes XP ;
- niveau ;
- choix d'amelioration ;
- ameliorations simples.

Exemples d'upgrades :

- vitesse ;
- degats ;
- cadence ;
- HP max ;
- taille de projectile ;
- regeneration lente.

Boucle obtenue :

```txt
tuer -> recuperer XP -> level up -> choisir upgrade -> survivre plus longtemps
```

### Couche 6 - Coop 1 a 4 joueurs

Objectif : passer du prototype solo a la vraie experience commune du projet.

- plusieurs joueurs sur la meme map ;
- HP separes ;
- score commun ou score mixte ;
- ennemis qui ciblent le joueur le plus proche ;
- mort individuelle ;
- fin si tous les joueurs sont morts ;
- lancement depuis une room.

Resultat attendu : jusqu'a 4 joueurs peuvent jouer ensemble.

### Couche 7 - Exploration et ressources simples

Objectif : ajouter les idees d'exploration, de recolte et de mini-MMO avec un
scope controle.

- 1 ou 2 ressources maximum au debut ;
- recolte sur la map ;
- drop par certains ennemis ;
- inventaire tres simple ;
- utilisation des ressources pendant la partie ;
- points d'interet sur la map.

Exemples :

- energie ;
- metal ;
- fragments.

### Couche 8 - Defense de zone et construction legere

Objectif : ajouter l'idee de base et de construction sans partir sur un systeme
trop lourd.

- zone centrale a proteger ;
- murs simples ;
- tourelles simples ;
- reparations ;
- vagues ennemies plus fortes ;
- ameliorations simples avec les ressources.

Nouvelle boucle :

```txt
explorer -> collecter -> ameliorer -> defendre -> survivre plus longtemps
```

### Couche 9 - Automatisation legere, boss, biomes et polish

Objectif : faire evoluer les ressources et la defense vers des systemes plus
vivants.

- production automatique tres simple ;
- generateurs ou collecteurs basiques ;
- boss toutes les X minutes ;
- types d'ennemis ;
- zones ou biomes ;
- effets visuels ;
- sons ;
- achievements ;
- statistiques detaillees ;
- customisation.

Cette partie reste dimensionnee pour garder une partie lisible et rapide a
tester.

## 4. Socle commun a rendre stable

Le socle commun correspond a une application ou :

- un utilisateur peut se connecter ;
- un utilisateur peut acceder a son profil ;
- plusieurs joueurs peuvent rejoindre une room ;
- les joueurs peuvent discuter dans une room ;
- les joueurs peuvent se mettre ready ;
- une partie peut etre lancee depuis le lobby ;
- le jeu se lance dans le navigateur ;
- 1 a 4 joueurs peuvent participer ;
- des ennemis apparaissent ;
- les joueurs peuvent survivre, prendre des degats et mourir ;
- une partie produit un score ;
- les resultats sont sauvegardes ;
- un historique ou un leaderboard affiche ces resultats.

Les enrichissements gameplay se branchent sur ce socle : ils doivent rester
visibles en partie, utiles au groupe et simples a demontrer.

## 5. Modules vises

### Base prioritaire - 14 points

| Categorie | Module | Type | Points | Role dans le projet |
|---|---|---:|---:|---|
| Gaming & UX | Complete web-based game | Major | 2 | Le jeu coop porte la boucle principale |
| Gaming & UX | Remote players | Major | 2 | Les joueurs peuvent jouer depuis plusieurs machines |
| Gaming & UX | Multiplayer 3+ | Major | 2 | Le jeu vise 1 a 4 joueurs |
| Web | Framework frontend + backend | Major | 2 | React + Fastify structurent l'application |
| Web | Real-time features / WebSocket | Major | 2 | Rooms, chat, ready et synchro temps reel |
| Web | User interaction | Major | 2 | Chat, profils, amis et interactions sociales |
| User Management | Standard user management | Major | 2 | Comptes, profils, avatars, statut |

Total : 14 points.

### Extensions possibles - 18 points

| Categorie | Module | Type | Points | Role dans le projet |
|---|---|---:|---:|---|
| User Management | Game statistics + match history | Minor | 1 | Historique et stats par partie |
| Web | ORM | Minor | 1 | Prisma pour gerer la DB proprement |
| Gaming & UX | Game customization | Minor | 1 | Personnages, armes, difficulte ou map |
| Gaming & UX | Gamification system | Minor | 1 | Achievements, XP profil, badges |

Total vise : 18 points.

## 6. Stack technique

| Partie | Choix | Role |
|---|---|---|
| Frontend | React + TypeScript | Pages, UI, lobby, profil, leaderboard, affichage jeu |
| Styling | Tailwind CSS ou CSS simple | Interface claire et rapide a maintenir |
| Backend API | Fastify + Node.js | Auth, users, friends, scores, history |
| Temps reel | Socket.IO | Rooms, chat, ready, inputs, etats de partie |
| Gameplay simulation | C++ | Deplacements, collisions, ennemis, combat, score |
| Database | PostgreSQL ou MySQL | Donnees persistantes |
| ORM | Prisma | Migrations, modeles, relations |
| Auth | OAuth 42 | Connexion utilisateur |
| DevOps | Docker Compose | Lancement complet du projet |
| Tests | Checklists + tests simples | Validation avant merge et demo |

## 7. Architecture cible

```txt
Browser
  React UI
    - Login
    - Profile
    - Friends
    - Lobby
    - Room
    - Chat
    - Game screen
    - Leaderboard
    - Match history

  Game display
    - rendu 2D
    - HUD
    - joueurs
    - ennemis
    - projectiles
    - feedback visuel

  Socket.IO client
    - room events
    - chat events
    - ready events
    - player inputs
    - game state

Backend Fastify
  REST API
    - auth
    - users
    - friends
    - scores
    - matches
    - leaderboard

  Socket.IO server
    - rooms
    - chat
    - ready system
    - game session lifecycle
    - input routing
    - state broadcast

  C++ gameplay module/service
    - simulation tick
    - player movement
    - enemy AI
    - collisions
    - combat
    - score
    - end game result

Database
  - users
  - friends
  - messages
  - game runs
  - player stats
  - achievements
```

Le point important est de garder des contrats clairs entre les parties.

Exemples de donnees entre Socket.IO et le gameplay :

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
  timer
  score

game:end
  roomId
  duration
  victory
  score
  playerStats
```

## 8. Repartition equipe

La repartition est organisee par domaines pour garder des responsabilites
lisibles et faciliter l'integration.

| Membre | Role principal | Responsabilites |
|---|---|---|
| Membre 1 | Scrum Master + Front/UI + QA | Organisation, suivi, front, integration, tests, demo |
| Membre 2 | Backend API / DB | Fastify, Prisma, schema DB, routes REST |
| Membre 3 | WebSocket / Multiplayer / Game integration | Rooms, chat, ready, synchro, contrat avec le jeu |
| Membre 4 | Gameplay simulation | boucle de jeu, collisions, ennemis, degats, score |
| Membre 5 | Game / Auth / Scores selon besoin | soutien gameplay, OAuth, profils, scores, history |

Decoupage possible cote gameplay :

| Zone jeu | Responsable possible | Contenu |
|---|---|---|
| Simulation core | Game dev 1 | boucle tick, entites, collisions, combat |
| Gameplay content | Game dev 2 | ennemis, armes, upgrades, vagues, balancing |
| Integration multiplayer | Game dev 3 / WebSocket | inputs, game state, room -> partie, fin de partie |

Le Scrum Master peut rester sur :

- organisation ;
- issues ;
- planning ;
- front ;
- pages simples ;
- integration UI ;
- QA ;
- tests manuels ;
- preparation de la demo.

Le front reste central pour assembler les parties visibles du projet et suivre
la qualite globale de l'experience.

## 9. Soutien croise

Chaque membre garde un role principal, mais doit pouvoir aider au moins une
partie voisine.

Exemples :

| Partie principale | Soutien utile |
|---|---|
| Front / QA | tester les rooms, scores, profils et game screen |
| Backend API / DB | aider Auth / Scores sur les routes et le schema |
| WebSocket | aider le jeu sur les formats input/state |
| Gameplay core | aider WebSocket a definir les donnees temps reel |
| Auth / Scores | aider Front sur Profile, Friends, Leaderboard |

Le soutien doit etre concret :

- relire une PR ;
- tester une branche ;
- documenter un bug ;
- aider a definir un format de donnees ;
- corriger une integration simple ;
- verifier qu'une feature est demonstrable.

## 10. Phases de travail

### Phase 1 - Setup technique

Objectif : avoir un projet qui demarre chez tout le monde.

Taches :

- creer la structure du repo ;
- installer le frontend ;
- installer le backend ;
- connecter Socket.IO ;
- configurer la base de donnees ;
- configurer Prisma ;
- configurer Docker Compose ;
- ajouter `.env.example` ;
- documenter les commandes de lancement.

Resultat attendu : chaque membre peut lancer les services principaux.

### Phase 2 - API, auth et users

Objectif : avoir des utilisateurs reels ou un fallback dev utilisable.

Taches :

- preparer les routes utilisateur ;
- integrer OAuth 42 ;
- creer ou recuperer un utilisateur en DB ;
- gerer session ou token ;
- afficher la page Login ;
- afficher la page Profile ;
- preparer les premiers endpoints friends / scores.

Resultat attendu : un utilisateur peut se connecter et voir son profil.

### Phase 3 - Lobby, rooms et chat

Objectif : preparer le lancement d'une partie multijoueur.

Taches :

- creer une room ;
- rejoindre une room ;
- quitter une room ;
- lister les joueurs ;
- afficher le statut ready ;
- envoyer et recevoir les messages de chat ;
- tester avec plusieurs navigateurs.

Resultat attendu : plusieurs utilisateurs peuvent etre dans la meme room,
chatter et se mettre ready.

### Phase 4 - Prototype gameplay local

Objectif : obtenir un jeu jouable avant la synchronisation complete.

Taches :

- afficher une map ;
- afficher un joueur ;
- gerer les deplacements ;
- ajouter collisions simples ;
- faire apparaitre des ennemis ;
- ajouter une arme automatique ;
- gerer degats, HP et mort ;
- produire un score.

Resultat attendu : une partie locale jouable existe et produit un resultat.

### Phase 5 - Contrat backend / gameplay

Objectif : definir clairement les donnees echangees entre le backend temps reel
et le gameplay.

Taches :

- definir les inputs envoyes au jeu ;
- definir le format de l'etat de jeu ;
- definir le format de fin de partie ;
- choisir le mode de communication avec le module gameplay ;
- creer un premier appel minimal ;
- documenter les events importants.

Resultat attendu : le backend sait envoyer des inputs et recevoir un etat de
jeu exploitable.

### Phase 6 - Jeu coop 1 a 4 joueurs

Objectif : transformer le prototype en vraie partie coop.

Taches :

- connecter les inputs joueurs ;
- synchroniser les positions ;
- synchroniser les ennemis ;
- synchroniser les HP ;
- synchroniser le score ;
- gerer le lancement depuis la room ;
- gerer la fin de partie ;
- gerer une deconnexion simple.

Resultat attendu : jusqu'a 4 joueurs peuvent jouer ensemble depuis plusieurs
navigateurs ou machines.

### Phase 7 - Scores, historique et leaderboard

Objectif : rendre les parties persistantes.

Taches :

- sauvegarder une partie ;
- sauvegarder les stats par joueur ;
- afficher l'historique personnel ;
- afficher le leaderboard ;
- verifier les donnees avec plusieurs parties de test.

Resultat attendu : apres une partie, les resultats sont visibles dans
l'application.

### Phase 8 - Exploration, ressources et defense

Objectif : developper l'exploration, les ressources, la defense et
l'automatisation a partir des systemes deja poses.

Taches possibles :

- ressources simples ;
- inventaire leger ;
- points d'interet sur la map ;
- zone centrale a defendre ;
- murs ;
- tourelles ;
- production automatique tres simple ;
- boss ;
- biomes ;
- customisation ;
- achievements ;
- XP profil ;
- badges.

Resultat attendu : le projet gagne en richesse avec une map plus interessante,
des choix de groupe et des objectifs plus varies.

### Phase 9 - Stabilisation et evaluation

Objectif : rendre le projet stable, clair et defendable.

Taches :

- corriger les bugs visibles ;
- nettoyer les pages ;
- verifier la console navigateur ;
- finaliser le README ;
- documenter les modules valides ;
- calculer les points ;
- preparer un script de demo ;
- tester le lancement depuis zero ;
- verifier que chaque membre sait expliquer sa partie.

Resultat attendu : l'equipe peut faire une demonstration claire.

## 11. Sous-taches par domaine

### Frontend

- structure des pages ;
- navigation ;
- page Login ;
- page Profile ;
- page Friends ;
- page Lobby ;
- page Room ;
- composant Chat ;
- Game screen ;
- HUD ;
- Leaderboard ;
- Match History ;
- affichage des erreurs ;
- loading states ;
- integration avec API et Socket.IO.

### Backend API

- structure Fastify ;
- configuration env ;
- routes users ;
- routes friends ;
- routes matches ;
- routes leaderboard ;
- gestion auth ;
- validation des donnees ;
- erreurs propres ;
- liaison Prisma.

### Database

Tables probables :

- User ;
- Friend ;
- Message ;
- GameRoom si besoin ;
- GameRun ;
- PlayerRunStats ;
- Achievement ;
- UserAchievement.

Donnees a sauvegarder pour une partie :

- date ;
- duree ;
- resultat ;
- score total ;
- joueurs presents ;
- kills par joueur ;
- niveau atteint ;
- personnage utilise ;
- difficulte ;
- map.

### Socket.IO

Events probables :

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

Responsabilites :

- rooms ;
- chat ;
- ready system ;
- lancement ;
- diffusion etat jeu ;
- deconnexion ;
- reconnexion simple.

### Gameplay

Responsabilites :

- boucle de simulation ;
- entites ;
- joueurs ;
- ennemis ;
- projectiles ;
- collisions ;
- degats ;
- HP ;
- score ;
- XP ;
- upgrades ;
- vagues ;
- fin de partie.

Le gameplay recoit des donnees simples et renvoie un etat de jeu simple.

## 12. Priorites

### Priorite 1 - Indispensable

- Docker Compose ;
- frontend React ;
- backend Fastify ;
- base de donnees ;
- authentification ;
- Socket.IO ;
- lobby ;
- chat de room ;
- ready system ;
- gameplay minimum ;
- multijoueur ;
- score de fin de partie.

### Priorite 2 - Consolidation

- profils utilisateurs ;
- amis ;
- historique des parties ;
- leaderboard ;
- reconnexion simple ;
- interface plus claire ;
- README ;
- script de demo ;
- checklist bugs.

### Priorite 3 - Enrichissement gameplay

- ressources simples ;
- defense de zone ;
- automatisation legere ;
- customisation ;
- achievements ;
- XP de profil ;
- badges ;
- boss ;
- biomes ;
- polish visuel.

## 13. Points de controle

### Controle hebdomadaire

- lancer le projet depuis la branche principale ;
- merger les petites branches terminees ;
- tester le lobby avec plusieurs clients ;
- tester une partie complete si possible ;
- mettre a jour les issues ;
- noter les bugs bloquants ;
- verifier que personne n'est bloque trop longtemps.

### Controle avant merge

- la branche compile ou demarre ;
- les routes ou events ajoutes sont documentes ;
- les erreurs evidentes sont gerees ;
- l'integration avec au moins une autre partie est testee ;
- les changements ne cassent pas la demo existante.

### Controle avant demo

- repartir d'un environnement propre ;
- lancer Docker Compose ;
- creer ou connecter un utilisateur ;
- rejoindre une room ;
- envoyer un message ;
- lancer une partie ;
- finir une partie ;
- afficher score, historique ou leaderboard ;
- verifier qu'aucune erreur importante n'apparait dans la console.

## 14. Definition of done globale

Une fonctionnalite est consideree terminee quand :

- elle est utilisable depuis l'interface ou via un endpoint clair ;
- elle fonctionne avec les autres parties concernees ;
- elle gere au moins les erreurs principales ;
- elle a ete testee par une autre personne ;
- elle est assez stable pour etre montree en demo ;
- les bugs connus sont notes.

## 15. Risques et reductions

| Risque | Impact | Reduction |
|---|---|---|
| Gameplay trop large | Le projet web prend du retard | Avancer par couches jouables |
| Gameplay mal decoupe | Conflits et blocages | Separer core, contenu et integration |
| Multijoueur instable | Modules majeurs difficiles a demontrer | Tester tot avec plusieurs clients |
| OAuth 42 bloquant | Connexion impossible | Prevoir un fallback dev local |
| DB mal pensee | Scores et history difficiles | Faire le schema tot et simple |
| Integration tardive | Bugs difficiles a corriger | Integrer chaque semaine |
| Branches trop longues | Merges compliques | Issues courtes, branches courtes, reviews regulieres |
| Features trop larges | Base incomplete | Les relier a une boucle jouable concrete |

## 16. Regle de production

Ne pas passer a la couche suivante tant que la couche precedente n'est pas :

- jouable ;
- testee ;
- comprehensible par l'equipe ;
- integrable avec le reste ;
- montrable en demo.

La colonne vertebrale du projet reste :

```txt
auth -> lobby -> room -> chat -> ready -> partie coop -> score -> historique
```

Les idees de survie, exploration, ressources, defense et automatisation doivent
toutes se raccrocher a cette colonne vertebrale.
