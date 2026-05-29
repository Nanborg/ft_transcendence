# Role 2 - Backend API / Database

## Mission

Construire la base serveur : API REST, acces DB, schema Prisma, validation des
donnees, erreurs propres et routes consommees par le frontend.

Le backend gere les donnees persistantes et les actions web classiques. Il ne
doit pas contenir toute la logique gameplay.

## Responsabilites

- structurer le backend avec Node.js et Express ;
- structurer le service backend ;
- configurer les variables d'environnement ;
- connecter la base de donnees ;
- configurer Prisma ;
- definir le schema DB ;
- creer les routes REST ;
- valider les inputs ;
- proteger les routes necessaires ;
- sauvegarder les resultats de partie valides ;
- documenter les endpoints.

## Schema DB de depart

| Table | Role |
|---|---|
| User | comptes utilisateurs |
| Friend | relations d'amis |
| Message | messages de chat si sauvegardes |
| GameRoom | rooms si besoin de persistance |
| GameRun | parties jouees |
| PlayerRunStats | stats par joueur |
| Achievement | achievements disponibles |
| UserAchievement | achievements debloques |

## Routes API possibles

```http
GET    /users/me
GET    /users/:id
PATCH  /users/me
GET    /friends
POST   /friends/:id
DELETE /friends/:id
GET    /matches/me
GET    /leaderboard
POST   /scores
```

Les routes exactes peuvent changer, mais leur format doit rester documente.

## Regle importante sur les scores

Le client ne doit pas inventer un score librement.

Les resultats doivent venir du flux de fin de partie :

```txt
gameplay -> game:end -> backend/socket -> DB -> history/leaderboard
```

## Ordre de travail conseille

1. Creer le service backend.
2. Brancher la DB.
3. Ajouter Prisma et les premieres migrations.
4. Creer `User`.
5. Ajouter routes utilisateur.
6. Ajouter friends.
7. Ajouter GameRun / PlayerRunStats.
8. Ajouter leaderboard / history.
9. Nettoyer erreurs et validation.

## Definition of done

- les routes repondent avec un format stable ;
- les erreurs sont coherentes ;
- les inputs sont valides ;
- les donnees importantes sont persistantes ;
- le frontend peut consommer les routes ;
- le schema DB est documente ;
- les donnees de partie alimentent history et leaderboard.

## Points a surveiller

- ne pas faire le schema DB trop tard ;
- eviter les routes non documentees ;
- ne pas melanger API, DB et simulation gameplay ;
- ne pas exposer d'informations sensibles ;
- prevoir des donnees de test pour la demo.

## A savoir expliquer

- structure du backend Express ;
- schema DB ;
- relations principales ;
- routes importantes ;
- validation des inputs ;
- parcours d'un score jusqu'au leaderboard.
