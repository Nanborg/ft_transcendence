# Role 4 - Gameplay / Simulation

## Mission

Construire la partie gameplay du projet : simulation de la partie, joueurs,
ennemis, collisions, combat, progression, score et integration avec le
multijoueur.

Le role ne couvre pas toute l'application web. Il se concentre sur ce qui se
passe pendant une partie.

## Responsabilites principales

- definir la boucle de simulation ;
- gerer les entites du jeu ;
- gerer les joueurs ;
- gerer les inputs utiles au gameplay ;
- gerer les ennemis ;
- gerer les vagues ;
- gerer les armes automatiques ;
- gerer les collisions ;
- gerer les HP, degats et mort ;
- gerer XP et upgrades simples ;
- produire un etat de jeu exploitable par le frontend ;
- produire un resultat de fin de partie ;
- travailler avec le role WebSocket sur les formats `player:input`, `game:state`
  et `game:end`.

## Gameplay minimum

- 1 a 4 joueurs ;
- deplacement clavier ;
- map 2D simple ;
- ennemis qui apparaissent ;
- ennemis qui poursuivent les joueurs ;
- armes automatiques ;
- collisions ;
- points de vie ;
- degats ;
- mort ;
- score ;
- fin de partie.

## Progression gameplay

Les mecanismes suivants viennent enrichir le gameplay si le socle est stable :

- XP ;
- level ups ;
- choix d'amelioration ;
- ressources simples ;
- defense de zone ;
- automatisation legere ;
- boss ou biomes.

## Conditions de partie

| Type | Condition possible |
|---|---|
| Defaite | Tous les joueurs sont morts |
| Victoire | Au moins un joueur survit jusqu'a la fin du timer ou objectif atteint |

Exemple simple : survivre 5 minutes.

## Contrats avec le reste du projet

### Input joueur

```txt
player:input
  playerId
  direction
  action
  timestamp
```

### Etat de jeu

```txt
game:state
  players
  enemies
  projectiles
  xp
  resources
  timer
  score
```

### Fin de partie

```txt
game:end
  roomId
  duration
  victory
  score
  playerStats
```

## Taches principales

### Prototype local

- map simple ;
- joueur controllable ;
- deplacement ;
- collisions simples ;
- ennemis simples ;
- arme automatique ;
- HP ;
- score ;
- fin de partie.

### Simulation

- definir le tick de simulation ;
- separer les donnees de jeu du rendu ;
- garder les entites lisibles ;
- documenter les valeurs importantes ;
- preparer des donnees faciles a envoyer au serveur temps reel.

### Integration multijoueur

- recevoir les inputs joueurs ;
- calculer ou mettre a jour l'etat de partie ;
- renvoyer un `game:state` clair ;
- gerer les morts individuelles ;
- gerer la fin de partie ;
- fournir les resultats pour la sauvegarde.

## Definition of done

- le jeu se lance depuis l'application ;
- un joueur peut bouger ;
- les ennemis apparaissent ;
- le joueur peut prendre des degats ;
- une partie peut finir ;
- un score est produit ;
- l'etat de jeu est comprehensible ;
- les inputs et outputs importants sont documentes ;
- le comportement est assez stable pour une demo.

## Points a surveiller

- garder un gameplay simple au debut ;
- eviter de bloquer le projet sur le balancing ;
- ne pas faire confiance au client pour le score final ;
- documenter les inputs et l'etat de jeu ;
- garder le gameplay testable rapidement ;
- verifier que toute l'equipe comprend le flux general d'une partie.
