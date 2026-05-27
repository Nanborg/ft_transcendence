# Role 2 - Backend API / Database

## Mission

Construire la base serveur du projet : API REST, structure Fastify, acces DB,
schema Prisma et routes utilisees par le frontend.

## Responsabilites principales

- definir l'architecture backend ;
- configurer Fastify ;
- configurer Prisma ;
- definir le schema de base de donnees ;
- creer les routes REST ;
- gerer les erreurs API ;
- proteger les routes necessaires ;
- recevoir les resultats de partie valides ;
- fournir une documentation simple des endpoints.

## Taches principales

### Setup backend

- creer le service backend ;
- configurer Fastify ;
- ajouter les variables d'environnement ;
- connecter la DB ;
- ajouter Prisma ;
- creer les premieres migrations.

### Schema DB

Tables possibles :

| Table | Role |
|---|---|
| User | Comptes utilisateurs |
| Friend | Relations d'amis |
| Message | Messages de chat |
| GameRoom | Rooms creees |
| GameRun | Parties jouees |
| PlayerRunStats | Stats individuelles |
| Achievement | Achievements disponibles |
| UserAchievement | Achievements debloques |

### Routes API possibles

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

Les routes de score ne doivent pas accepter aveuglement un score invente par le
client. Les resultats doivent venir du flux de fin de partie defini avec le
gameplay et le temps reel.

## Definition of done

- les routes repondent avec un format stable ;
- les erreurs sont claires ;
- les donnees importantes sont persistantes ;
- le frontend peut consommer les endpoints ;
- le schema DB est documente.
- les donnees de partie sont compatibles avec l'historique et le leaderboard.

## Points a surveiller

- eviter un schema DB trop tardif ;
- garder les reponses API coherentes ;
- ne pas melanger logique HTTP, DB et logique de jeu sans separation ;
- prevoir des donnees de test pour la demo.
