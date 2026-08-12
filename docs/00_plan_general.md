# Plan general - ft_transcendence

## 1. Vision commune du projet

Le projet est une application web complete autour d'un RPG cooperatif 2D contre
l'environnement. Les joueurs explorent une carte, combattent des ennemis,
progressent en puissance et cherchent a atteindre puis vaincre un boss final.

L'objectif n'est pas seulement de faire un mini-jeu, mais une experience
complete : connexion, profil, amis, lobby, rooms, chat, ready system, lancement
de partie, jeu coop 1 a 4 joueurs, combat temps reel, boss, scores, historique,
leaderboard et progression gameplay.

La premiere boucle jouable doit rester simple et testable : plusieurs joueurs
apparaissent sur une map 2D, se deplacent, affrontent des ennemis en temps reel,
utilisent des attaques manuelles avec cooldowns, gagnent de l'experience ou des
points, progressent pendant la partie, affrontent un boss simple, puis les
resultats sont sauvegardes dans l'application.

Le jeu n'est pas un jeu de survie, de defense de base, de collecte intensive de
ressources, de construction, d'automatisation ou de PvP. Le scope reste centre
sur la boucle RPG jouable : exploration, combat temps reel, progression et boss.

## 2. Concept final du gameplay

Le gameplay retenu est un RPG coop temps reel sur la carte principale :

1. controle d'un personnage sur une map 2D ;
2. exploration de la carte ;
3. ennemis visibles directement sur la map ;
4. attaques manuelles avec cooldowns ;
5. progression par competences ;
6. boss final comme objectif principal.

Le concept final retenu :

> 1 a 4 joueurs explorent une map 2D, affrontent des ennemis en temps reel,
> ameliorent leurs competences, puis atteignent et battent un boss final.

Le point de depart doit deja contenir les pieces utilisees par tout le concept :
deplacement libre, map, collisions, entites, ennemis, attaques, HP, mort,
respawn, boss, score, conditions de fin et multijoueur. Ces elements servent a
obtenir une version jouable terminee avant d'ajouter des systemes secondaires.

Le combat ne passe pas par une scene separee : pas de tour par tour, pas de
sous-room de combat. Les joueurs voient les combats des autres sur la carte et
peuvent rejoindre naturellement un combat proche.

## 3. Gameplay par couches

### Couche 1 - Map et personnage

Objectif : avoir quelque chose de visible et controlable.

- map 2D fixe construite avec tiles ou sprites ;
- joueur affiche ;
- deplacement clavier ;
- camera ou vue centree ;
- limites de map ;
- coordonnees continues en pixels.

### Couche 2 - Monde jouable

Objectif : donner une vraie sensation d'espace.

- obstacles ;
- collisions ;
- zones simples ;
- HUD minimal ;
- vie du joueur ;
- indicateur de partie ;
- separation claire entre carte statique et entites dynamiques.

### Couche 3 - Premiers dangers

Objectif : rendre la map vivante et creer une premiere pression de jeu.

- ennemis qui apparaissent ;
- ennemis qui rodent, poursuivent ou attaquent selon leur type ;
- contact = degats ;
- HP joueur ;
- mort ;
- score calcule selon les regles de la partie.

### Couche 4 - Combat simple

Objectif : avoir la boucle principale.

- attaques manuelles ;
- attaque melee ;
- attaque distance ;
- attaque ciblee ou de zone ;
- projectiles ;
- cooldown separe par attaque ;
- degats aux ennemis ;
- ennemis qui meurent ;
- score lie aux actions importantes : ennemis vaincus, boss, temps, morts, etc.

```txt
bouger -> esquiver -> attaquer -> tuer -> progresser
```

Les attaques sont declenchees par le joueur. Le serveur ou le moteur garde le
moment de derniere utilisation pour refuser une attaque encore en cooldown.

### Couche 5 - Gold et upgrades

Objectif : ajouter de la progression pendant la partie.

- gold gagne en combattant ;
- competences separees ;
- niveau par competence ;
- choix d'amelioration ;
- ameliorations simples visibles dans l'interface ;
- checkpoints ou zones sures pour ameliorer les competences.

Exemples d'upgrades :

- vitesse ;
- degats ;
- cadence ;
- HP max ;
- taille de projectile ;
- regeneration lente ;
- reduction de cooldown.

```txt
tuer -> gagner du gold -> ameliorer une competence -> survivre plus longtemps
```

### Couche 6 - Coop 1 a 4 joueurs

Objectif : passer du prototype solo a la vraie experience commune du projet.

- plusieurs joueurs sur la meme map ;
- HP separes ;
- score commun ou score mixte ;
- ennemis qui ciblent le joueur le plus proche ;
- mort individuelle ;
- respawn possible apres un delai ;
- protection courte apres respawn ou reconnexion ;
- mode spectateur possible pour un joueur mort ;
- fin si tous les joueurs sont morts ou si le boss est vaincu ;
- lancement depuis une room.

### Couche 7 - Boss et objectif principal

Objectif : donner une fin claire a la partie.

- progression vers le boss final ;
- boss simple ;
- attaques du boss en temps reel ;
- HP du boss ;
- victoire quand le boss est vaincu ;
- statistiques de fin : temps, morts, score.

```txt
explorer -> combattre -> progresser -> atteindre le boss -> vaincre le boss
```

### Couche 8 - Biomes, boss secondaires et polish

Objectif : enrichir la map et les combats sans changer la boucle principale.

- boss secondaires ou variantes de boss ;
- types d'ennemis ;
- zones ou biomes ;
- effets visuels ;
- sons ;
- achievements ;
- statistiques detaillees ;
- customisation.

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
- chaque room possede son propre etat logique de partie ;
- des ennemis apparaissent ;
- les joueurs peuvent survivre, prendre des degats et mourir ;
- un joueur mort peut respawn ou attendre en spectateur selon la regle retenue ;
- une deconnexion conserve l'etat et la position du joueur ;
- la partie a une condition de victoire ou de defaite claire, notamment le boss ;
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
| Web | Framework frontend + backend | Major | 2 | React + un backend Node.js structurent l'application |
| Web | Real-time features / WebSocket | Major | 2 | Rooms, chat, ready et synchro temps reel |
| Web | User interaction | Major | 2 | Chat, profils, amis et interactions sociales |
| User Management | Standard user management | Major | 2 | Comptes, profils, avatars, statut |

Total : 14 points.

### Extensions possibles pour atteindre 18+ points

| Categorie | Module | Type | Points | Role dans le projet |
|---|---|---:|---:|---|
| User Management | Game statistics + match history | Minor | 1 | Historique et stats par partie |
| User Management | OAuth 42 | Minor | 1 | Connexion via compte 42 pour ajouter un module utile |
| Web | ORM | Minor | 1 | Prisma pour gerer la DB proprement |
| Gaming & UX | Game customization | Minor | 1 | Personnages, armes, difficulte ou map |
| Gaming & UX | Gamification system | Minor | 1 | Achievements, XP profil, badges |

Total possible : 19 points selon les modules retenus. Objectif raisonnable :
atteindre au moins 18 points sans surcharger le projet.

## 6. Stack technique

| Partie | Choix | Role |
|---|---|---|
| Frontend | React + TypeScript | Pages, UI, lobby, profil, leaderboard, affichage jeu |
| Styling | Tailwind CSS ou CSS simple | Interface claire et rapide a maintenir |
| Backend API | Node.js + Express | Auth, users, friends, scores, history |
| Temps reel | Socket.IO | Rooms, chat, ready, inputs, etats de partie |
| Gameplay simulation | C++ | Deplacements, collisions, ennemis, combat, score |
| Database | PostgreSQL ou MySQL | Donnees persistantes |
| ORM | Prisma | Migrations, modeles, relations |
| Auth | Auth standard + OAuth 42 | Connexion utilisateur |
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
    - rendu 2D pixel art / isometrique
    - HUD
    - camera centree sur le joueur
    - zone visible autour du joueur
    - mini-carte possible
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

Backend Node.js / Express
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
    - roomId transmis au gameplay
    - reconnexion et protection courte

  C++ gameplay module/service
    - instances logiques par room
    - simulation tick
    - carte statique
    - entites dynamiques
    - player movement
    - enemy AI
    - collisions
    - combat
    - cooldowns
    - boss
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
  roomId
  playerId
  direction
  action
  target
  timestamp

game:state
  roomId
  tick
  mapId
  players
  enemies
  projectiles
  boss
  score

game:end
  roomId
  duration
  victory
  bossDefeated
  score
  playerStats
```

Backend -> gameplay :

```txt
room:create/start/stop/destroy
  roomId

player:join/leave/input
  roomId
  playerId
  action
```

## 8. Repartition equipe

La repartition est organisee par domaines pour garder des responsabilites
lisibles et faciliter l'integration.

| Membre | Role principal | Responsabilites |
|---|---|---|
| Membre 1 | Scrum Master + Front/UI + QA | Organisation, suivi, front, integration, tests, demo |
| Membre 2 | Backend API / DB | Node.js, Prisma, schema DB, routes REST |
| Membre 3 | WebSocket / Multiplayer / Game integration | Rooms, chat, ready, synchro, contrat avec le jeu |
| Membre 4 | Gameplay simulation | boucle de jeu, collisions, ennemis, degats, score |
| Membre 5 | Game / Auth / Scores selon besoin | soutien gameplay, OAuth, profils, scores, history |

Decoupage possible cote gameplay :

| Zone jeu | Responsable possible | Contenu |
|---|---|---|
| Simulation core | Game dev 1 | boucle tick, entites, collisions, combat |
| Gameplay content | Game dev 2 | ennemis, attaques, competences, boss, balancing |
| Integration multiplayer | Game dev 3 / WebSocket | inputs, game state, room -> partie, fin de partie |

Le Scrum Master aide l'equipe a garder clairs les issues, le planning, les
points d'equipe, les blocages et la coordination. Il peut rester sur
organisation, front, integration UI, QA, tests et preparation de la demo.

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

- creer la structure du repo ;
- installer le frontend ;
- installer le backend Node.js ;
- connecter Socket.IO ;
- configurer la base de donnees ;
- configurer Prisma ;
- configurer Docker Compose ;
- ajouter `.env.example` ;
- documenter les commandes de lancement.

Resultat attendu : chaque membre peut lancer les services principaux.

### Phase 2 - API, auth et users

Objectif : avoir des utilisateurs reels ou un fallback dev utilisable.

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

- afficher une map 2D fixe ;
- afficher un joueur ;
- gerer les deplacements continus ;
- ajouter collisions simples ;
- separer carte statique et entites dynamiques ;
- faire apparaitre des ennemis ;
- ajouter des attaques manuelles avec cooldowns ;
- gerer degats, HP et mort ;
- ajouter un boss simple ;
- ajouter une condition de victoire ou defaite claire ;
- produire un score.

Resultat attendu : une partie locale jouable existe et produit un resultat.

### Phase 5 - Contrat backend / gameplay

Objectif : definir clairement les donnees echangees entre le backend temps reel
et le gameplay.

- definir les inputs envoyes au jeu ;
- definir les commandes de lifecycle de room ;
- definir le format de l'etat de jeu ;
- definir le format de fin de partie ;
- choisir le mode de communication avec le module gameplay ;
- creer un premier appel minimal ;
- transmettre le roomId a chaque commande gameplay ;
- documenter les events importants.

Resultat attendu : le backend sait envoyer des inputs et recevoir un etat de
jeu exploitable.

### Phase 6 - Jeu coop 1 a 4 joueurs

Objectif : transformer le prototype en vraie partie coop.

- connecter les inputs joueurs ;
- synchroniser les positions ;
- synchroniser les ennemis ;
- synchroniser les HP ;
- synchroniser le score ;
- gerer le lancement depuis la room ;
- gerer la fin de partie ;
- gerer une deconnexion simple ;
- conserver position et etat au reconnect ;
- ajouter une protection courte apres reconnect ou respawn.

Resultat attendu : jusqu'a 4 joueurs peuvent jouer ensemble depuis plusieurs
navigateurs ou machines.

### Phase 7 - Scores, historique et leaderboard

Objectif : rendre les parties persistantes.

- sauvegarder une partie ;
- sauvegarder les stats par joueur ;
- afficher l'historique personnel ;
- afficher le leaderboard ;
- verifier les donnees avec plusieurs parties de test.

Resultat attendu : apres une partie, les resultats sont visibles dans
l'application.

### Phase 8 - Progression, boss et statistiques

Objectif : consolider la boucle RPG retenue.

- competences separees ;
- niveaux de competence ;
- ameliorations visibles dans l'interface ;
- checkpoints ou zones sures d'amelioration ;
- boss plus lisible ;
- statistiques de fin : temps, morts, score ;
- leaderboard oriente speedrun ou score.

Resultat attendu : la partie a une progression claire et une fin demonstrable.

### Phase 9 - Exploration avancee et polish

Objectif : enrichir l'exploration seulement apres la boucle de base.

- points d'interet sur la map ;
- boss secondaires ou variantes ;
- biomes ;
- customisation ;
- achievements ;
- XP profil ;
- badges.

Resultat attendu : le projet gagne en richesse avec une map plus interessante
et des combats plus varies.

### Phase 10 - Stabilisation et evaluation

Objectif : rendre le projet stable, clair et defendable.

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
- camera centree sur le joueur ;
- mini-carte possible ;
- interface de competences ;
- affichage des cooldowns ;
- Leaderboard ;
- Match History ;
- affichage des erreurs ;
- loading states ;
- integration avec API et Socket.IO.

### Backend API

- structure Node.js avec Express ;
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
- resultat ;
- score final ;
- joueurs presents ;
- stats utiles selon le mode choisi ;
- ennemis vaincus si cette stat est retenue ;
- progression atteinte ;
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
- lifecycle de partie par room ;
- chat ;
- ready system ;
- lancement ;
- routage des inputs avec roomId ;
- diffusion etat jeu ;
- deconnexion ;
- reconnexion simple ;
- protection courte apres reconnexion.

### Gameplay

Responsabilites :

- boucle de simulation ;
- carte statique ;
- entites ;
- joueurs ;
- ennemis ;
- projectiles ;
- collisions ;
- degats ;
- HP ;
- attaques manuelles ;
- cooldowns ;
- boss ;
- score ;
- XP ;
- competences ;
- upgrades ;
- conditions victoire / defaite ;
- fin de partie.

Le gameplay recoit des donnees simples et renvoie un etat de jeu simple.

## 12. Priorites

### Priorite 1 - Indispensable

- Docker Compose ;
- frontend React ;
- backend Node.js ;
- base de donnees ;
- authentification ;
- Socket.IO ;
- lobby ;
- chat de room ;
- ready system ;
- gameplay minimum ;
- multijoueur ;
- rooms isolees cote gameplay ;
- combat manuel temps reel ;
- boss simple ;
- score de fin de partie.

### Priorite 2 - Consolidation

- profils utilisateurs ;
- amis ;
- historique des parties ;
- leaderboard ;
- reconnexion simple ;
- respawn ou spectateur ;
- protection courte apres reconnexion ou respawn ;
- interface plus claire ;
- README ;
- script de demo ;
- checklist bugs.

### Priorite 3 - Enrichissement gameplay

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
- verifier que plusieurs rooms ne partagent pas le meme etat de jeu ;
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
| Contrat backend / moteur incomplet | Inputs ignores ou mauvaises rooms | Toujours transmettre roomId et tester plusieurs rooms |
| Carte et entites melangees | Collisions et rendu difficiles | Garder carte statique et entites dynamiques separees |

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

Les ajouts futurs doivent se raccrocher a cette colonne vertebrale s'ils sont
retenus par l'equipe. La boucle prioritaire reste exploration, combat temps
reel, progression et boss final.
