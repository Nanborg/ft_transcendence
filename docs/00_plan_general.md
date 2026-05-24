# Plan de travail - ft_transcendence

## Role du document

Ce document sert a organiser le travail de l'equipe pendant le projet.

Il ne remplace pas :

- `plan.md`, qui reste le brouillon complet et la source d'idees ;
- `webserv_plan.txt`, qui reste une ancienne reference de decoupage ;
- le futur README, qui servira a expliquer comment lancer le projet ;
- le document de reunion, qui sert a presenter le projet et les choix techniques.

L'objectif ici est simple : savoir quoi faire, dans quel ordre, avec quelles priorites, et comment verifier que chaque partie est vraiment utilisable.

## Objectif de production

Construire une application web jouable et demonstrable autour d'un jeu cooperatif inspire de *Vampire Survivors*.

La premiere cible est une version stable a 14 points. Les ajouts pour viser 18 points viennent seulement apres une base fonctionnelle.

## Definition de la base stable

La base stable correspond a une application ou :

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

## Priorites

### Priorite 1 - Indispensable

Ces elements doivent fonctionner avant de passer trop de temps sur le polish ou les bonus.

- Docker Compose ;
- frontend React ;
- backend Fastify ;
- base de donnees ;
- authentification ;
- Socket.IO ;
- lobby ;
- chat de room ;
- gameplay minimum ;
- multijoueur ;
- score de fin de partie.

### Priorite 2 - Consolidation

Ces elements rendent le projet plus propre, plus complet et plus defendable.

- profils utilisateurs ;
- amis ;
- historique des parties ;
- leaderboard ;
- reconnexion simple ;
- interface plus claire ;
- README ;
- script de demo ;
- checklist bugs.

### Priorite 3 - Bonus 18 points

Ces elements ne doivent pas mettre en danger la base.

- customisation ;
- achievements ;
- XP de profil ;
- badges ;
- polish visuel.

## Repartition equipe

| Membre | Role | Mission principale |
|---|---|---|
| Membre 1 | PM / Scrum Master + Front/UI + QA | Organisation, pages simples, integration, tests, demo |
| Membre 2 | Backend API / DB | Fastify, Prisma, routes REST, structure serveur |
| Membre 3 | WebSocket / Multiplayer | Rooms, chat, ready system, synchronisation temps reel |
| Membre 4 | Game Developer / Phaser | Gameplay, rendu 2D, ennemis, armes, collisions |
| Membre 5 | Auth / Users / Scores | OAuth 42, profils, amis, scores, history, leaderboard |

## Soutien croise

Meme si chaque partie a un responsable principal, personne ne doit rester totalement seul sur son sujet.

Chaque membre doit aussi seconder au moins une autre partie du projet. Le but n'est pas de remplacer le responsable, mais de pouvoir l'aider, relire son travail, tester ses branches, comprendre ses blocages et garder le rythme.

Cette organisation aide a :

- eviter qu'une personne reste bloquee trop longtemps ;
- limiter les silos ou chacun ne comprend que sa partie ;
- faciliter les reviews et les merges ;
- garder une meilleure cohesion d'equipe ;
- rendre le projet plus solide en cas d'absence ou de retard ;
- permettre a chacun d'expliquer au moins une partie voisine pendant l'evaluation.

Le choix des soutiens secondaires n'est pas encore fixe. Il doit etre decide avec l'equipe selon les envies, les competences, les besoins du projet et les blocages qui apparaissent.

Exemples de soutiens possibles, a adapter :

| Partie principale | Soutien possible |
|---|---|
| PM / Front / QA | tester toutes les parties et suivre l'integration globale |
| Backend API / DB | aider Auth / Scores sur les routes et le schema DB |
| WebSocket / Multiplayer | aider Game Developer sur les donnees temps reel |
| Game Developer / Phaser | aider WebSocket sur les besoins de synchronisation |
| Auth / Users / Scores | aider Front/UI sur les pages Profile, Friends et Leaderboard |

Le soutien doit etre concret : relire une PR, tester une branche, aider a definir un format de donnees, documenter un bug ou corriger une petite integration.

Chaque membre doit pouvoir expliquer :

- ce qu'il a fait ;
- quelles donnees sa partie recoit ;
- quelles donnees sa partie renvoie ;
- comment sa partie communique avec les autres ;
- quels bugs importants ont ete rencontres ;
- comment ces bugs ont ete corriges ou limites.

## Phases de travail

### Phase 1 - Setup technique

**Objectif :** avoir un projet qui demarre chez tout le monde.

**Taches :**

- creer la structure du repo ;
- installer le frontend ;
- installer le backend ;
- connecter Socket.IO ;
- configurer la base de donnees ;
- configurer Prisma ;
- configurer Docker Compose ;
- ajouter `.env.example` ;
- documenter les commandes de lancement.

**Resultat attendu :** chaque membre peut lancer les services principaux.

### Phase 2 - Structure API, auth et users

**Objectif :** avoir des utilisateurs reels ou un fallback dev utilisable.

**Taches :**

- preparer les routes utilisateur ;
- integrer OAuth 42 ;
- creer ou recuperer un utilisateur en DB ;
- gerer session ou token ;
- afficher la page Login ;
- afficher la page Profile ;
- preparer les premiers endpoints pour friends / scores.

**Resultat attendu :** un utilisateur peut se connecter et voir son profil.

### Phase 3 - Lobby, rooms et chat

**Objectif :** preparer le lancement d'une partie multijoueur.

**Taches :**

- creer une room ;
- rejoindre une room ;
- quitter une room ;
- lister les joueurs ;
- afficher le statut ready ;
- envoyer et recevoir les messages de chat ;
- tester avec plusieurs navigateurs.

**Resultat attendu :** plusieurs utilisateurs peuvent etre dans la meme room, chatter et se mettre ready.

### Phase 4 - Gameplay local

**Objectif :** obtenir un jeu jouable avant la synchronisation complete.

**Taches :**

- creer la scene Phaser ;
- afficher un joueur ;
- gerer les deplacements ;
- faire apparaitre des ennemis ;
- ajouter une arme automatique ;
- gerer collisions et degats ;
- gerer HP, mort et fin de partie ;
- produire un score.

**Resultat attendu :** une partie locale jouable existe et produit un resultat.

### Phase 5 - Jeu multijoueur

**Objectif :** transformer le prototype local en partie coop.

**Taches :**

- connecter les inputs joueurs au serveur ;
- synchroniser les positions ;
- synchroniser les ennemis ;
- synchroniser les HP ;
- synchroniser le score ;
- gerer le lancement depuis la room ;
- gerer la fin de partie ;
- gerer une deconnexion simple.

**Resultat attendu :** jusqu'a 4 joueurs peuvent jouer ensemble depuis plusieurs navigateurs ou machines.

### Phase 6 - Scores, historique et leaderboard

**Objectif :** rendre les parties persistantes.

**Taches :**

- sauvegarder une partie ;
- sauvegarder les stats par joueur ;
- afficher l'historique personnel ;
- afficher le leaderboard ;
- verifier les donnees avec plusieurs parties de test.

**Resultat attendu :** apres une partie, les resultats sont visibles dans l'application.

### Phase 7 - Stabilisation et bonus

**Objectif :** consolider la base avant d'ajouter les modules bonus.

**Taches :**

- corriger les bugs visibles ;
- nettoyer les pages ;
- ameliorer les messages d'erreur ;
- ajouter customisation si la base est stable ;
- ajouter achievements / XP si la base est stable ;
- verifier que chaque module annonce est demonstrable.

**Resultat attendu :** le projet est stable, presentable et peut viser plus que 14 points.

### Phase 8 - Preparation evaluation

**Objectif :** preparer une demo simple et defendable.

**Taches :**

- finaliser le README ;
- preparer le schema DB ;
- lister les modules valides ;
- calculer les points ;
- ecrire un script de demo ;
- verifier la console navigateur ;
- tester le lancement depuis zero ;
- verifier que chaque membre sait presenter sa partie.

**Resultat attendu :** l'equipe peut faire une demonstration claire sans improviser tout le deroulement.

## Points de controle

### Controle hebdomadaire

A faire au moins une fois par semaine :

- lancer le projet depuis la branche principale ;
- merger les petites branches terminees ;
- tester le lobby avec plusieurs clients ;
- tester une partie complete si possible ;
- mettre a jour les issues ;
- noter les bugs bloquants ;
- verifier que personne n'est bloque trop longtemps.

### Controle avant merge

Avant de merger une branche :

- la branche compile ou demarre ;
- les routes ou events ajoutes sont documentes ;
- les erreurs evidentes sont gerees ;
- l'integration avec au moins une autre partie est testee ;
- les changements ne cassent pas la demo existante.

### Controle avant demo

Avant une demonstration :

- repartir d'un environnement propre ;
- lancer Docker Compose ;
- creer ou connecter un utilisateur ;
- rejoindre une room ;
- envoyer un message ;
- lancer une partie ;
- finir une partie ;
- afficher score, historique ou leaderboard ;
- verifier qu'aucune erreur importante n'apparait dans la console.

## Definition of done globale

Une fonctionnalite est consideree terminee quand :

- elle est utilisable depuis l'interface ou via un endpoint clair ;
- elle fonctionne avec les autres parties concernees ;
- elle gere au moins les erreurs principales ;
- elle a ete testee par une autre personne ;
- elle est assez stable pour etre montree en demo ;
- les bugs connus sont notes.

## Risques et reductions

| Risque | Impact | Reduction |
|---|---|---|
| JavaScript / TypeScript nouveau pour l'equipe | Ralentissement au debut | Garder une structure simple, typer les contrats importants, partager les exemples |
| Trop de temps sur le gameplay | Retarde auth, lobby et scores | Faire un gameplay minimum avant le balancing |
| Multijoueur instable | Modules majeurs difficiles a demontrer | Tester tot avec plusieurs clients |
| OAuth 42 bloquant | Connexion impossible | Prevoir un fallback dev local |
| DB mal pensee | Scores et history difficiles | Faire le schema tot et le garder simple |
| Integration tardive | Bugs difficiles a corriger | Integrer chaque semaine |
| Branches trop longues | Merges compliques | Issues courtes, branches courtes, reviews regulieres |
| Trop de bonus | Base incomplete | Valider 14 points avant de viser 18 |

## Documents lies

- `plan.md` : brouillon complet et details larges.
- `webserv_plan.txt` : ancienne reference de decoupage.
- `docs/01_presentation_reunion.md` : support pour presenter le projet a l'equipe.
- `docs/roles/` : fiches detaillees par membre.
