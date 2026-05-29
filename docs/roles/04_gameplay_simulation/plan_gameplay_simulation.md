# Role 4 - Gameplay / Simulation

## Mission

Construire la partie gameplay : simulation de la partie, joueurs, ennemis,
collisions, combat, progression, objectifs, score et integration multijoueur.

Ce role concerne ce qui se passe pendant une partie, pas toute l'application web.

## Responsabilites

- definir la boucle de simulation ;
- gerer les entites du jeu ;
- gerer joueurs, ennemis, projectiles et collisions ;
- gerer les inputs utiles au gameplay ;
- gerer les menaces PvE : ennemis errants, attaques, vagues ou boss selon mode ;
- gerer une attaque simple, automatique ou semi-automatique selon decision ;
- gerer HP, degats, mort ;
- gerer XP et upgrades simples ;
- gerer une condition de victoire / defaite claire ;
- produire `game:state` ;
- produire `game:end`.

## Gameplay minimum

- 1 a 4 joueurs ;
- map 2D simple ;
- deplacement clavier ;
- ennemis qui apparaissent, rodent ou attaquent ;
- attaque simple ;
- collisions ;
- HP / degats / mort ;
- score ;
- victoire / defaite ;
- fin de partie claire.

## Progression possible

Ces elements enrichissent le jeu si le socle fonctionne :

- XP ;
- level ups ;
- choix d'amelioration ;
- ressources simples ;
- objectifs de zone ;
- construction ou defense legere si validee ;
- automatisation legere ;
- boss ou biomes.

## Conditions de partie

| Type | Condition possible |
|---|---|
| Defaite | Tous les joueurs sont morts |
| Defaite | Un objectif de zone echoue |
| Victoire | Un objectif de zone est termine |
| Victoire | La condition du mode choisi est remplie |

## Contrats

```txt
player:input
  playerId
  direction
  action
  timestamp

game:state
  players
  enemies
  projectiles
  xp
  resources
  objectiveState
  score

game:end
  roomId
  victory
  score
  playerStats
```

## Ordre de travail conseille

1. Map + joueur.
2. Deplacement + collisions.
3. Ennemis simples.
4. Degats + HP + mort.
5. Attaque simple.
6. Condition victoire / defaite.
7. Score selon les regles de partie.
8. XP / upgrades simples.
9. Format `game:state`.
10. Format `game:end`.
11. Integration multijoueur.

## Definition of done

- le jeu se lance depuis l'application ;
- un joueur peut bouger ;
- les ennemis apparaissent ;
- le joueur peut prendre des degats ;
- une partie peut finir avec victoire ou defaite ;
- un score est produit ;
- l'etat de jeu est comprehensible ;
- les inputs / outputs sont documentes ;
- le comportement est assez stable pour une demo.

## Points a surveiller

- garder un gameplay simple au debut ;
- ne pas bloquer le projet sur le balancing ;
- ne pas empiler des systemes sans jeu jouable ;
- ne pas faire confiance au client pour le score final ;
- garder les valeurs importantes faciles a retrouver ;
- verifier que l'equipe comprend le flux d'une partie.

## A savoir expliquer

- boucle de simulation ;
- format `player:input` ;
- format `game:state` ;
- format `game:end` ;
- conditions victoire / defaite ;
- calcul general du score ;
- lien avec WebSocket et sauvegarde.
