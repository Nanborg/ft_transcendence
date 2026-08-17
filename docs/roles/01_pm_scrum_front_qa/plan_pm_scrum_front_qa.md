# Role 1 - PM / Scrum Master + Front/UI + QA

## Mission

Garder le projet organise, lisible et demonstrable.

Ce role combine organisation, frontend simple, integration, QA, documentation et
preparation de l'evaluation. Il ne decide pas seul pour l'equipe : il aide a
transformer les discussions en taches claires et a garder le projet testable.

Scrum Master signifie ici : suivre les issues, le planning, les points d'equipe,
les blocages, les priorites et la coordination.

## Responsabilites

- organiser le board de travail ;
- creer et maintenir des issues claires ;
- suivre les priorites et les blocages ;
- aider a garder les branches petites ;
- coordonner les tests entre membres ;
- faire ou integrer des pages frontend simples ;
- brancher le front avec API, Socket.IO et page Game ;
- maintenir les checklists de test et de demo ;
- tenir a jour les documents importants ;
- verifier que chaque feature importante est comprise par l'equipe.

## Frontend a prendre en charge

| Page / zone | Objectif |
|---|---|
| Home | point d'entree simple |
| Login | connexion ou fallback dev |
| Profile | infos utilisateur et resume |
| Friends | affichage / actions amis |
| Lobby | creer / rejoindre une room |
| Room | joueurs, ready, chat |
| Game screen | affichage jeu + HUD |
| Leaderboard | scores globaux |
| Match History | historique personnel |

## Ordre de travail conseille

1. Mettre en place une navigation simple.
2. Creer des pages vides mais accessibles.
3. Integrer Login / Profile.
4. Integrer Lobby / Room / Chat.
5. Integrer la page Game.
6. Integrer Leaderboard / History.
7. Nettoyer UI, erreurs, responsive et demo.

## Contrats avec les autres roles

| Avec | A coordonner |
|---|---|
| Backend | routes API, formats de reponse, erreurs |
| WebSocket | events rooms, chat, ready, game state |
| Gameplay | affichage jeu, HUD, donnees utiles |
| Auth/Scores | profil, leaderboard, history |

## QA minimum

- tester avec Chrome ;
- verifier la console ;
- tester plusieurs navigateurs pour lobby / room ;
- tester les etats loading, error, empty ;
- verifier qu'une feature ne casse pas le parcours principal ;
- documenter les bugs reproductibles.

## Definition of done

- la page ou feature est visible ;
- les etats principaux sont geres ;
- l'integration avec au moins une autre partie est testee ;
- aucun bug bloquant connu n'est cache ;
- la checklist ou la doc est mise a jour si besoin ;
- l'equipe sait quoi montrer en demo.

## A savoir expliquer

- comment l'equipe organise les taches ;
- comment lancer le projet ;
- comment naviguer dans l'application ;
- comment une room lance une partie ;
- comment tester une feature ;
- quels modules sont vises et pourquoi ;
- qui a travaille sur quoi.

## Mise a jour 2026-08-10

Ce role reste utile pour expliquer la coordination, les tests manuels et la
mise a jour des issues.

Points deja avances:

- pages Leaderboard et Match History integrees;
- tests manuels PR 143 et PR 144 faits en local;
- documentation locale de reunion nettoyee;
- issues a fermer/garder/supprimer revues selon l'etat actuel.
