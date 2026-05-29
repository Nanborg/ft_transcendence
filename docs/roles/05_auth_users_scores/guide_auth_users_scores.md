# Guide de realisation - Auth / Users / Scores

## Objectif

Ce guide explique comment gerer l'identite des joueurs, les profils, les amis,
les scores, l'historique et le leaderboard.

## 1. Comprendre le role

Cette partie relie l'utilisateur au reste du projet.

Elle doit permettre :

- de se connecter ;
- d'avoir un profil ;
- d'avoir des amis ;
- de sauvegarder une partie ;
- de voir son historique ;
- de comparer les scores.

## 2. Auth standard et OAuth 42

Le sujet demande une gestion utilisateur. OAuth 42 est a integrer pour ajouter
un module utile et renforcer le projet.

Pour eviter de bloquer tout le monde :

- prevoir un fallback dev local ;
- integrer OAuth 42 ensuite ;
- documenter la configuration ;
- ne pas committer les secrets.

## 3. User

Le modele User doit contenir les informations utiles :

- id ;
- login ou email ;
- display name ;
- avatar si disponible ;
- statut si utilise ;
- date de creation.

Ne pas stocker de secret inutile.

## 4. Session ou token

Il faut choisir comment reconnaitre un utilisateur connecte :

- session serveur ;
- cookie ;
- token.

La decision doit etre documentee et comprise par frontend/backend.

## 5. Routes utilisateur

Routes possibles :

```http
GET    /users/me
GET    /users/:id
PATCH  /users/me
```

Chaque route protegee doit refuser un utilisateur non connecte.

## 6. Amis

Fonctions simples :

- voir sa liste d'amis ;
- ajouter un ami ;
- supprimer un ami ;
- voir un statut simple si disponible.

Routes possibles :

```http
GET    /friends
POST   /friends/:id
DELETE /friends/:id
```

## 7. Resultats de partie

Un resultat doit venir de la fin de partie, pas d'un formulaire libre.

Flux :

```txt
game:end -> validation serveur -> GameRun / PlayerRunStats -> history / leaderboard
```

Donnees possibles :

- score final ;
- victoire ou defaite ;
- objectif joue ;
- stats utiles selon le mode ;
- ennemis vaincus si retenu ;
- progression ;
- joueurs presents.

## 8. History

L'historique personnel doit montrer :

- parties recentes ;
- resultat ;
- score ;
- mode ou objectif ;
- date ;
- stats utiles.

Il doit etre lisible meme si peu de stats sont disponibles au debut.

## 9. Leaderboard

Le leaderboard doit avoir une logique claire :

- meilleur score ;
- meilleur resultat ;
- tri par mode si necessaire ;
- limite de resultats affichee.

La logique exacte depend du score choisi par l'equipe.

## 10. Ordre de travail conseille

1. Creer User.
2. Ajouter fallback dev.
3. Ajouter `/users/me`.
4. Ajouter Profile.
5. Ajouter OAuth 42.
6. Ajouter Friends.
7. Ajouter GameRun.
8. Ajouter PlayerRunStats.
9. Recevoir `game:end`.
10. Sauvegarder une partie.
11. Afficher History.
12. Afficher Leaderboard.

## 11. Tests manuels

Tester :

- utilisateur connecte ;
- utilisateur non connecte ;
- profil charge ;
- ami ajoute / supprime ;
- partie sauvegardee ;
- history mise a jour ;
- leaderboard mis a jour ;
- erreur si donnees invalides.

## 12. Pieges courants

- bloquer le projet sur OAuth 42 ;
- oublier le fallback dev ;
- laisser le client inventer un score ;
- melanger score global et stats joueur ;
- afficher des donnees non sauvegardees ;
- ne pas documenter les champs.

## 13. A savoir expliquer

- comment un utilisateur se connecte ;
- comment OAuth 42 est configure ;
- comment un profil est cree ;
- comment les amis sont stockes ;
- comment `game:end` devient une ligne en DB ;
- comment history et leaderboard sont calcules ;
- comment les routes protegees fonctionnent.
