# Guide de realisation - Gameplay / Simulation

## Objectif

Ce guide explique comment construire le gameplay bloc par bloc.

Le but n'est pas de tout faire tout de suite. Le but est d'obtenir rapidement un
jeu jouable, testable et comprehensible, puis d'ajouter les mecanismes autour.

## 1. Comprendre la responsabilite gameplay

Le gameplay decide ce qui se passe pendant une partie :

- positions ;
- deplacements ;
- collisions ;
- ennemis ;
- combat ;
- degats ;
- HP ;
- mort ;
- score ;
- objectifs ;
- victoire / defaite ;
- etat de jeu.

Le frontend affiche. Le WebSocket transmet. Le gameplay simule.

## 2. Principe central

Toujours construire dans cet ordre :

```txt
visible -> controlable -> dangereux -> jouable -> multijoueur -> enrichi
```

Ne pas commencer par automatisation, ressources complexes, boss ou balancing.

## 3. Bloc 1 - Map et joueur

Objectif : lancer une partie et voir un joueur.

A faire :

- definir une map simple ;
- definir une taille de monde ;
- placer un joueur ;
- stocker sa position ;
- afficher ou transmettre sa position ;
- garder des coordonnees simples.

Questions :

- origine de la map ?
- limites ou map ouverte ?
- taille d'un joueur ?
- vitesse de base ?

Definition of done :

- le joueur existe ;
- sa position est connue ;
- l'etat peut etre affiche ou envoye.

## 4. Bloc 2 - Deplacement

Objectif : controler le joueur.

A faire :

- recevoir une direction ;
- appliquer une vitesse ;
- mettre a jour la position ;
- empecher les valeurs absurdes ;
- garder le mouvement stable.

Inputs possibles :

```txt
up/down/left/right
direction x/y
action
```

Definition of done :

- le joueur bouge ;
- le mouvement est previsible ;
- le joueur ne part pas a l'infini par erreur.

## 5. Bloc 3 - Collisions

Objectif : eviter que tout traverse tout.

Commencer simple :

- limites de map ;
- obstacles rectangulaires ;
- collision joueur / obstacle ;
- collision joueur / ennemi ;
- collision projectile / ennemi si projectiles.

Ne pas viser une physique parfaite. Il faut une collision suffisante pour une
demo.

Definition of done :

- le joueur ne traverse pas les obstacles principaux ;
- un contact ennemi peut etre detecte ;
- les collisions sont comprehensibles.

## 6. Bloc 4 - Ennemis

Objectif : rendre la map dangereuse.

Types simples :

- ennemi qui rode ;
- ennemi qui poursuit un joueur proche ;
- ennemi qui attaque au contact ;
- ennemi plus lent mais plus solide.

Ne pas limiter le jeu a des vagues constantes. Les ennemis peuvent :

- apparaitre dans une zone ;
- roder ;
- poursuivre ;
- attaquer un objectif ;
- arriver pendant un evenement.

Definition of done :

- un ennemi apparait ;
- il bouge ;
- il peut menacer un joueur ;
- son comportement est testable.

## 7. Bloc 5 - HP, degats et mort

Objectif : avoir un risque clair.

A faire :

- donner des HP au joueur ;
- donner des degats aux ennemis ;
- retirer des HP au contact ou a l'attaque ;
- detecter la mort ;
- garder un etat vivant / mort.

Definition of done :

- un joueur peut prendre des degats ;
- un joueur peut mourir ;
- l'etat mort est transmis dans `game:state`.

## 8. Bloc 6 - Combat

Objectif : permettre au joueur de repondre aux menaces.

Le combat peut etre :

- manuel ;
- automatique ;
- semi-automatique ;
- a valider selon l'equipe.

L'important est d'avoir une attaque simple :

- cooldown ;
- cible ;
- degats ;
- mort ennemi ;
- feedback visible.

Definition of done :

- le joueur peut attaquer ;
- un ennemi peut prendre des degats ;
- un ennemi peut mourir ;
- le score ou les stats peuvent etre mises a jour selon les regles.

## 9. Bloc 7 - Victoire / defaite

Objectif : une partie doit se terminer clairement.

Defaites possibles :

- tous les joueurs sont morts ;
- un objectif echoue.

Victoires possibles :

- objectif termine ;
- condition du mode remplie ;
- zone protegee ;
- extraction reussie.

Ne pas laisser une partie sans fin claire.

Definition of done :

- la partie peut finir ;
- `game:end` indique victoire ou defaite ;
- le resultat est sauvegardable.

## 10. Bloc 8 - Score et resultats

Objectif : produire un resultat utile pour history / leaderboard.

Le score peut prendre en compte :

- ennemis vaincus ;
- objectifs termines ;
- ressources ;
- progression ;
- bonus selon le mode.

Ne pas figer trop tot la formule. Garder la logique simple et explicable.

Definition of done :

- un score final existe ;
- les stats utiles existent ;
- le score n'est pas invente par le client ;
- le score part dans `game:end`.

## 11. Bloc 9 - Gold et upgrades

Objectif : ajouter de la progression pendant une partie.

Commencer simple :

- gagner du gold ;
- atteindre assez de ressource ;
- choisir une amelioration ;
- appliquer un bonus.

Upgrades possibles :

- vitesse ;
- HP max ;
- degats ;
- cadence ;
- taille d'attaque ;
- regeneration lente.

Definition of done :

- le joueur peut progresser ;
- un bonus change vraiment quelque chose ;
- l'upgrade est visible ou testable.

## 12. Bloc 10 - Ressources et objectifs

Objectif : relier combat et exploration.

Ressources simples :

- energie ;
- metal ;
- fragments.

Objectifs possibles :

- recuperer une ressource ;
- proteger une zone ;
- activer un point ;
- terminer une zone.

Construction, defense et automatisation restent des pistes possibles. Elles
doivent se brancher sur une boucle deja jouable.

## 13. Bloc 11 - Multijoueur

Objectif : plusieurs joueurs dans la meme partie.

A faire :

- accepter plusieurs `player:input` ;
- garder un etat par joueur ;
- gerer HP separes ;
- gerer mort individuelle ;
- calculer un score commun ou mixte ;
- finir la partie selon les conditions.

Definition of done :

- 2 joueurs peuvent jouer ;
- puis 3-4 joueurs ;
- les positions restent coherentes ;
- la fin de partie reste claire.

## 14. Contrats avec WebSocket

Input :

```txt
player:input
  playerId
  direction
  action
  timestamp
```

Etat :

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

Fin :

```txt
game:end
  roomId
  victory
  score
  playerStats
```

Ces formats doivent rester simples. Si un champ change, WebSocket et Front
doivent etre prevenus.

## 15. Integration C++

La simulation gameplay est la partie qui utilise C++. Le reste de l'application
reste organise autour du frontend, du backend Express et de Socket.IO.

Le C++ doit etre integre avec un contrat simple :

- recevoir les inputs joueurs ;
- faire avancer la simulation ;
- produire un `game:state` lisible ;
- produire un `game:end` quand la partie se termine.

Le mode d'integration doit rester comprehensible par toute l'equipe :

- soit un service/process separe appele par le backend ;
- soit un module lance par le serveur ;
- soit une integration minimale adaptee au temps disponible.

Le choix technique exact compte moins que la clarte du flux :

```txt
Socket.IO -> inputs -> simulation C++ -> game:state/game:end -> Socket.IO
```

## 16. Tests manuels

Tester dans cet ordre :

1. joueur visible ;
2. deplacement ;
3. collision ;
4. ennemi visible ;
5. ennemi dangereux ;
6. degats ;
7. mort ;
8. attaque ;
9. ennemi tuable ;
10. fin de partie ;
11. score ;
12. deux joueurs ;
13. sauvegarde du resultat.

## 17. Pieges courants

- commencer par trop de contenu ;
- equilibrer avant que le jeu fonctionne ;
- faire une formule de score incomprehensible ;
- faire confiance au client ;
- oublier la condition de fin ;
- creer des systemes non testables ;
- ne pas documenter les formats.

## 18. A savoir expliquer

- comment tourne la simulation ;
- comment le C++ est relie au reste du projet ;
- comment un input modifie l'etat ;
- comment un ennemi decide quoi faire ;
- comment les collisions sont detectees ;
- comment un joueur meurt ;
- comment la partie se termine ;
- comment le score est produit ;
- comment `game:state` est construit ;
- comment `game:end` part vers la sauvegarde.
