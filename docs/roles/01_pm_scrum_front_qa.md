# Role 1 - PM / Scrum Master + Front/UI + QA

## Mission

Ce role sert a garder le projet organise, coherent et presentable.

La personne ne fait pas seulement de la gestion : elle aide aussi sur le frontend, l'integration, les tests, la documentation et la preparation de l'evaluation.

## Responsabilites principales

- organiser le travail avec issues, TODO, priorites et suivi des branches ;
- coordonner l'equipe et verifier que les parties se connectent bien ensemble ;
- faire des pages frontend simples ;
- aider a integrer le front avec l'API, Socket.IO et le jeu ;
- tester les branches des autres ;
- reperer les bugs, les documenter et parfois les corriger ;
- maintenir une checklist de demo ;
- preparer le README, les documents utiles, les modules et le calcul des points ;
- verifier que le projet est presentable en evaluation.

## Pages frontend a prendre en charge

| Page | Objectif |
|---|---|
| Home | Point d'entree de l'application |
| Login | Acces a l'auth OAuth 42 ou fallback dev |
| Lobby | Liste / creation / rejoindre une room |
| Profile | Affichage simple du profil utilisateur |
| Leaderboard | Affichage des meilleurs scores |

## Taches par phase

### Phase 1 - Setup et organisation

- definir le board de travail ;
- creer les premieres issues ;
- definir les conventions de branches ;
- verifier que le projet demarre avec Docker ;
- mettre en place une premiere structure de pages ;
- documenter comment lancer le projet.

**Resultat attendu :** tout le monde sait quoi faire et peut lancer le projet.

### Phase 2 - Auth et pages utilisateur

- preparer la page Login ;
- preparer la page Profile ;
- integrer les premiers appels API utilisateur ;
- verifier les etats loading, error et not connected ;
- tester le parcours login -> profil.

**Resultat attendu :** le parcours utilisateur de base est lisible.

### Phase 3 - Lobby et chat

- construire l'interface du lobby ;
- afficher les joueurs dans une room ;
- afficher les etats ready / not ready ;
- aider a brancher les events Socket.IO ;
- tester les rooms avec plusieurs navigateurs.

**Resultat attendu :** le lobby est utilisable pour lancer une partie.

### Phase 4 - Integration jeu

- preparer la page Game ;
- integrer l'affichage du jeu dans l'application React ;
- afficher les informations utiles autour du jeu si necessaire ;
- tester que la navigation lobby -> game fonctionne ;
- documenter les bugs d'affichage ou d'integration.

**Resultat attendu :** le jeu est accessible depuis l'interface.

### Phase 5 - Tests multijoueur

- tester plusieurs clients en meme temps ;
- noter les bugs de sync ;
- verifier les deconnexions simples ;
- verifier que le chat et le lobby ne cassent pas pendant le jeu ;
- aider a reproduire les bugs pour les autres membres.

**Resultat attendu :** les bugs bloquants sont identifies clairement.

### Phase 6 - Scores et leaderboard

- construire ou finaliser la page Leaderboard ;
- afficher l'historique ou un resume dans Profile ;
- tester la sauvegarde apres une partie ;
- verifier que les donnees affichees correspondent a la DB.

**Resultat attendu :** les scores sont visibles et comprehensibles.

### Phase 7 - Polish

- uniformiser l'UI ;
- corriger les textes et les etats vides ;
- verifier le responsive minimum ;
- nettoyer les pages trop brouillonnes ;
- mettre a jour la checklist de demo.

**Resultat attendu :** l'application donne une impression stable.

### Phase 8 - Evaluation

- preparer le README ;
- preparer le script de demo ;
- lister les modules valides ;
- calculer les points ;
- verifier que chaque membre peut expliquer sa partie ;
- faire une passe finale sur les bugs visibles.

**Resultat attendu :** le projet est defendable pendant l'evaluation.

## Definition of done

Une tache de ce role est terminee quand :

- la page ou la fonctionnalite est visible dans l'application ;
- les erreurs de base sont gerees ;
- l'integration avec les autres parties a ete testee ;
- les bugs connus sont notes ;
- la documentation ou la checklist est mise a jour si necessaire.

## Points a surveiller

- ne pas laisser l'integration a la derniere semaine ;
- eviter les branches enormes ;
- tester regulierement avec plusieurs navigateurs ;
- garder une demo simple et fiable ;
- ne pas promettre de module qui n'est pas demonstrable.
