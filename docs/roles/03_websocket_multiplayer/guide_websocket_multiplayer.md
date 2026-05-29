# Guide de realisation - WebSocket / Multiplayer

## Objectif

Ce guide explique comment gerer le temps reel : rooms, chat, ready system,
lancement de partie, inputs joueurs, etat de jeu et fin de partie.

Socket.IO sert a tout ce qui doit etre instantane.

## 1. Comprendre Socket.IO

HTTP sert aux actions classiques :

- recuperer un profil ;
- afficher un leaderboard ;
- sauvegarder une partie ;
- charger un historique.

Socket.IO sert aux actions temps reel :

- rejoindre une room ;
- envoyer un message ;
- changer ready ;
- lancer une partie ;
- envoyer des inputs ;
- recevoir un etat de jeu.

## 2. Connexion

Premiere etape :

- le frontend ouvre une connexion Socket.IO ;
- le serveur accepte la connexion ;
- le serveur connait l'utilisateur ou un identifiant temporaire ;
- le client peut se deconnecter proprement.

Il faut pouvoir tester avec deux navigateurs.

## 3. Rooms

Une room represente un groupe de joueurs avant une partie.

Actions minimales :

- creer une room ;
- rejoindre une room ;
- quitter une room ;
- lister les joueurs ;
- limiter a 4 joueurs ;
- envoyer l'etat de room a tous les joueurs.

Etat de room utile :

```txt
roomId
players
readyState
status
```

Cycle simple d'une room :

```txt
waiting -> starting -> in_game -> ended -> closed
```

- `waiting` : les joueurs rejoignent, discutent et passent ready ;
- `starting` : la room lance la partie et initialise la session ;
- `in_game` : les inputs et `game:state` circulent ;
- `ended` : le resultat est diffuse et transmis pour sauvegarde ;
- `closed` : la room est vide ou terminee.

## 4. Chat

Le chat de room doit :

- envoyer un message ;
- recevoir un message ;
- afficher l'auteur ;
- afficher l'heure si utile ;
- ne pas envoyer de message vide ;
- rester limite a la room.

La sauvegarde DB peut venir ensuite.

## 5. Ready system

Le ready system sert a eviter de lancer une partie par erreur.

Regles possibles :

- chaque joueur peut passer ready / not ready ;
- la room affiche l'etat de chacun ;
- la partie peut demarrer si les conditions sont reunies ;
- si un joueur quitte, l'etat est recalcule.

Conditions a discuter :

- faut-il un minimum de joueurs ?
- qui peut lancer ?
- lancement automatique ou bouton start ?

## 6. Lancement de partie

Quand la partie demarre :

1. verifier la room ;
2. verifier les joueurs ;
3. changer le status de room ;
4. prevenir les clients ;
5. initialiser la session de gameplay ;
6. rediriger ou afficher la page Game.

Event possible :

```txt
game:start
```

## 7. Inputs joueurs

Le client envoie les intentions du joueur, pas un score final.

Format a garder simple :

```txt
player:input
  playerId
  direction
  action
  timestamp
```

Exemples d'action :

- move ;
- attack ;
- interact ;
- collect.

## 8. Etat de jeu

Le gameplay renvoie un etat lisible :

```txt
game:state
  players
  enemies
  projectiles
  xp
  resources
  objectiveState
  score
```

Le role WebSocket diffuse cet etat aux clients de la partie.

## 9. Fin de partie

La fin de partie doit etre claire :

```txt
game:end
  roomId
  victory
  score
  playerStats
```

Apres `game:end` :

1. diffuser le resultat aux clients ;
2. envoyer ou transmettre les resultats a la sauvegarde ;
3. permettre de revenir au lobby ou a l'ecran de resultats.

## 10. Deconnexions

Cas a gerer simplement :

- joueur quitte une room ;
- joueur ferme l'onglet ;
- joueur se deconnecte pendant le lobby ;
- joueur se deconnecte pendant une partie.

Au debut, une reconnexion simple suffit. L'important est de ne pas casser la
room ou dupliquer un joueur.

## 11. Tests manuels

Tester avec plusieurs navigateurs :

- deux clients connectes ;
- creation de room ;
- join / leave ;
- chat ;
- ready ;
- start ;
- deconnexion ;
- retour lobby ;
- lancement de partie.

## 12. Pieges courants

- laisser le client decider de l'etat final ;
- oublier de prevenir les autres joueurs ;
- dupliquer un joueur ;
- ne pas nettoyer une room vide ;
- changer un payload sans prevenir frontend/gameplay ;
- tester avec un seul navigateur.

## 13. A savoir expliquer

- difference HTTP / Socket.IO ;
- cycle d'une room ;
- cycle ready -> game:start -> game:state -> game:end ;
- format des payloads ;
- gestion de deconnexion ;
- lien avec gameplay ;
- lien avec sauvegarde des resultats.
