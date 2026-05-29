# Guide de realisation - Backend API / Database

## Objectif

Ce guide explique comment construire la partie backend/API/DB.

Le backend doit gerer les donnees persistantes, les routes REST, la validation,
les erreurs et la sauvegarde des resultats. Il ne doit pas devenir un bloc
melangeant toute la logique web, DB et gameplay.

## 1. Comprendre le role du backend

Le backend sert a :

- recevoir des requetes HTTP ;
- verifier les donnees ;
- lire ou ecrire en base ;
- renvoyer des reponses claires ;
- proteger certaines routes ;
- fournir les donnees au frontend ;
- sauvegarder les resultats de partie.

Le gameplay calcule la partie. Le backend sauvegarde et expose les donnees.

## 2. Utiliser Express

Le framework backend sera Node.js avec Express.

Points a verifier au setup :

- comment demarrer le serveur ;
- comment organiser les routes ;
- comment brancher Socket.IO avec le serveur HTTP ;
- comment gerer validation et erreurs ;
- comment expliquer clairement la structure en evaluation.

Une fois la structure posee, ne pas changer l'organisation sans vraie raison.

## 3. Structure minimale du service

Prevoir une organisation claire :

```txt
backend
  src
    server
    routes
    services
    db
    middlewares
    schemas
```

Le nom exact peut changer, mais il faut separer :

- routes HTTP ;
- logique metier ;
- acces DB ;
- validation ;
- auth / session.

## 4. Variables d'environnement

Ne jamais mettre de secrets dans Git.

Prevoir :

- un fichier `.env` local ignore par Git ;
- un `.env.example` commite ;
- variables DB ;
- variables auth ;
- port backend ;
- URL frontend si besoin.

## 5. Base de donnees

Commencer par un schema simple.

Tables probables :

- User ;
- Friend ;
- Message ;
- GameRun ;
- PlayerRunStats ;
- Achievement ;
- UserAchievement.

Ne pas creer trop de tables avant de savoir comment elles seront utilisees.

## 6. Prisma

Prisma sert a :

- definir les modeles ;
- creer des migrations ;
- generer un client DB ;
- garder une structure DB lisible.

Ordre conseille :

1. Installer et configurer Prisma.
2. Configurer la connexion DB.
3. Creer le modele User.
4. Creer une premiere migration.
5. Tester une lecture / ecriture simple.
6. Ajouter les autres modeles progressivement.

## 7. Routes REST

Commencer par les routes utiles au frontend.

Exemples :

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

Chaque route doit avoir :

- methode HTTP ;
- URL ;
- besoin d'auth ou non ;
- body attendu ;
- reponse ;
- erreurs possibles.

## 8. Validation

Ne jamais faire confiance au frontend.

Valider :

- params ;
- query ;
- body ;
- utilisateur connecte ;
- droits d'acces ;
- types de donnees ;
- champs obligatoires.

Une mauvaise donnee doit produire une erreur claire.

## 9. Erreurs API

Garder des erreurs coherentes :

- `400` : donnee invalide ;
- `401` : non connecte ;
- `403` : interdit ;
- `404` : ressource introuvable ;
- `500` : erreur serveur.

Ne pas exposer de stack trace au client.

## 10. Scores et resultats

Le client ne doit pas inventer un score final.

Flux attendu :

```txt
gameplay -> game:end -> backend/socket -> DB -> history/leaderboard
```

Le backend sauvegarde :

- resultat ;
- score final ;
- joueurs presents ;
- stats utiles selon le mode ;
- progression atteinte ;
- objectif joue ;
- date de partie.

## 11. History et leaderboard

History :

- donne les parties d'un joueur ;
- trie les plus recentes ;
- affiche les donnees utiles.

Leaderboard :

- donne les meilleurs scores ou resultats ;
- doit avoir une logique de tri claire ;
- doit rester coherent avec le mode de jeu choisi.

## 12. Tests manuels

Pour chaque route :

- tester un cas succes ;
- tester un cas non connecte ;
- tester une donnee invalide ;
- verifier que la DB change comme prevu ;
- verifier la reponse cote frontend.

## 13. A savoir expliquer

Pouvoir expliquer :

- pourquoi Express est utilise ;
- comment le serveur demarre ;
- comment Prisma est branche ;
- le schema DB ;
- les routes principales ;
- comment les erreurs sont gerees ;
- comment un score arrive dans le leaderboard ;
- comment les secrets sont proteges.
