# Guide de realisation - PM / Scrum Master + Front/UI + QA

## Objectif

Ce guide explique comment tenir le role organisation/front/QA pendant le
projet.

Le but est de garder l'equipe alignee, de rendre le projet testable rapidement,
et de verifier que chaque partie peut etre montree et expliquee.

## 1. Comprendre le role

Ce role a trois responsabilites principales :

- organisation : issues, priorites, planning, blocages ;
- frontend : pages simples, navigation, integration API/Socket/game ;
- QA : tests manuels, bugs, checklist de demo.

Ce n'est pas un role de chef. Il sert a rendre le travail visible et a aider les
autres a avancer.

## 2. Mettre en place le board de travail

Les regles detaillees sur les issues, branches, reviews et commits sont dans
`docs/01_regles_equipe.md`. Ici, le but est surtout de garder le suivi visible.

Creer un board simple :

- Backlog ;
- Ready ;
- In progress ;
- Review / Test ;
- Done ;
- Blocked.

Chaque tache doit au minimum avoir :

- un titre clair ;
- un responsable ;
- une priorite ;
- une definition of done ;
- un test manuel.

## 3. Decouper les taches

Eviter les issues enormes comme :

```txt
Faire le frontend
Faire le jeu
Faire le backend
```

Preferer des petites actions testables :

- creer la page Login ;
- afficher le profil ;
- afficher les rooms ;
- envoyer un message de chat ;
- afficher les joueurs ready ;
- afficher le score de fin de partie.

Une tache doit pouvoir etre finie, testee et expliquee rapidement.

## 4. Suivre les priorites

Les priorites globales sont dans `docs/00_plan_general.md`. Le role PM/QA doit
surtout verifier que le socle commun avance avant les extras :

```txt
auth -> lobby -> room -> chat -> ready -> partie coop -> score -> historique
```

Si une feature ne renforce pas ce parcours, elle passe apres le socle commun.

## 5. Frontend : ordre conseille

1. Creer la navigation principale.
2. Creer des pages vides mais accessibles.
3. Ajouter Login.
4. Ajouter Profile.
5. Ajouter Lobby.
6. Ajouter Room.
7. Ajouter ChatBox.
8. Ajouter Game screen.
9. Ajouter Leaderboard.
10. Ajouter Match History.

Chaque page doit gerer au minimum :

- etat normal ;
- etat loading ;
- etat erreur ;
- etat vide si besoin.

## 6. Integration API

Quand une page appelle le backend :

- noter quelle route est utilisee ;
- noter quelles donnees sont attendues ;
- tester le cas succes ;
- tester le cas erreur ;
- ne pas supposer que la reponse est toujours parfaite.

Exemples de questions a poser au backend :

- Quel endpoint utiliser ?
- Quel format de reponse ?
- Quelles erreurs possibles ?
- Faut-il etre connecte ?
- Quelles donnees afficher si la liste est vide ?

## 7. Integration Socket.IO

Pour les rooms, chat et ready system :

- verifier le nom de l'event ;
- verifier le payload envoye ;
- verifier le payload recu ;
- tester avec deux navigateurs ;
- noter les bugs de synchronisation.

Exemples d'events importants :

```txt
room:create
room:join
room:leave
player:ready
chat:message
game:start
game:state
game:end
```

## 8. Integration de la page Game

La page Game doit :

- etre accessible depuis une room ;
- recevoir les infos de room ou de partie ;
- afficher la zone de jeu ;
- afficher un HUD minimal ;
- afficher les joueurs si disponible ;
- afficher l'etat de fin de partie ;
- permettre de revenir au lobby ou au resultat.

Ne pas attendre que tout le gameplay soit final pour creer cette page. Elle peut
commencer avec un placeholder propre, puis recevoir progressivement les vrais
etats.

## 9. QA manuel

Avant de dire qu'une feature est terminee, tester :

- le parcours normal ;
- un cas d'erreur ;
- un refresh de page si pertinent ;
- deux navigateurs si la feature est temps reel ;
- la console Chrome ;
- le responsive minimum.

Pour un bug, noter :

- ce qu'on faisait ;
- ce qui etait attendu ;
- ce qui est arrive ;
- comment reproduire ;
- capture ou message d'erreur si utile.

## 10. Checklist demo

Maintenir une checklist simple :

1. Lancer le projet depuis zero.
2. Se connecter ou utiliser fallback dev.
3. Aller sur Profile.
4. Creer une room.
5. Rejoindre avec un deuxieme navigateur.
6. Envoyer un message.
7. Mettre les joueurs ready.
8. Lancer une partie.
9. Finir une partie.
10. Voir le score / historique / leaderboard.

Si une etape casse, la noter comme bug prioritaire.

## 11. Documentation

Garder a jour :

- decisions techniques ;
- modules vises ;
- commandes de lancement ;
- roles de l'equipe ;
- bugs connus ;
- limites du projet ;
- ce que chaque membre a fait.

Ces notes serviront au README final.

## 12. A savoir expliquer

Pendant l'evaluation, pouvoir expliquer :

- comment l'equipe s'est organisee ;
- comment les issues ont ete decoupees ;
- comment lancer le projet ;
- comment tester la demo ;
- quelles parties communiquent ensemble ;
- quelles features sont terminees ;
- quels bugs ont ete rencontres ;
- comment l'equipe a partage la comprehension.
