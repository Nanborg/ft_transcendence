# Role 5 - Auth / Users / Scores

## Mission

Gerer l'identite des joueurs et les resultats : OAuth 42, profils, amis, scores, historique de parties et leaderboard.

## Responsabilites principales

- integrer OAuth 42 ;
- creer ou recuperer l'utilisateur en DB ;
- gerer la session ou le token ;
- gerer les profils ;
- gerer les amis ;
- sauvegarder les resultats de partie ;
- afficher ou fournir l'historique ;
- fournir les donnees du leaderboard.

## Fonctionnalites utilisateur

- login avec OAuth 42 ;
- profil utilisateur ;
- avatar ;
- statut online ;
- liste d'amis ;
- historique personnel ;
- resume des statistiques.

## Donnees de score possibles

| Donnee | Description |
|---|---|
| Score total | Score final de la partie |
| Duree | Temps de survie |
| Kills | Nombre d'ennemis tues |
| Niveau atteint | Progression pendant la partie |
| Nombre de joueurs | Taille de l'equipe |
| Personnage | Personnage utilise |
| Difficulte | Difficulte choisie |
| Resultat | Victoire ou defaite |

## Pages liees

- Login ;
- Profile ;
- Friends ;
- Match History ;
- Leaderboard.

## Taches principales

### Auth

- configurer OAuth 42 ;
- gerer le callback ;
- creer l'utilisateur si besoin ;
- gerer la session ou le token ;
- proteger les routes utilisateur.

### Profils et amis

- recuperer le profil courant ;
- recuperer un profil public ;
- ajouter / supprimer un ami ;
- afficher un statut online simple.

### Scores et historique

- recevoir un resultat de partie ;
- sauvegarder la partie ;
- sauvegarder les stats par joueur ;
- fournir l'historique personnel ;
- fournir le leaderboard global.

## Definition of done

- un utilisateur peut se connecter ;
- son profil existe en DB ;
- les routes protegees refusent les utilisateurs non connectes ;
- une partie terminee peut etre sauvegardee ;
- le leaderboard retourne des donnees lisibles.

## Points a surveiller

- ne pas bloquer toute l'equipe si OAuth 42 prend du temps ;
- prevoir un fallback dev local si necessaire ;
- ne pas laisser le client inventer les scores ;
- garder les donnees compatibles avec le frontend et la demo.

