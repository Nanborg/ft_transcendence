# Decisions proposees pour la reunion

Objectif du fichier: garder uniquement les decisions de gameplay et de scope V1.
Les valeurs chiffrees et les calculs sont dans `valeurs_equilibrage_v1.md`.
Le suivi du travail se fait maintenant via les issues GitHub V1.

## Objectif de partie

- Le mode de jeu est cooperatif.
- L'objectif principal est de battre le boss.
- Il n'y a pas de defense de zone.
- La partie se termine quand le boss est battu ou quand toute l'equipe est morte
  en meme temps.
- Le but secondaire est de finir la partie le plus vite possible.

## Mort, respawn et spectateur

- Quand un joueur meurt, la partie continue pour les autres joueurs.
- La mort et le respawn sont geres par le game engine.
- Le joueur mort passe en spectateur jusqu'a son respawn.
- Le joueur spectateur voit le point de vue du joueur vivant qui a le moins de
  morts.
- Le joueur respawn a l'endroit ou il est mort.
- Le joueur respawn avec toute sa vie.
- Le joueur respawn avec une courte invulnerabilite.
- Si tous les joueurs sont morts en meme temps, la partie est perdue directement.
- Si un joueur se deconnecte, il reste hors-jeu comme un joueur mort, mais sans
  ajouter de mort a ses stats.
- La detection exacte des deconnexions involontaires reste cote backend/socket.
- Le backend peut envoyer un input `freeze/unfreeze` au moteur pour bloquer ou
  reactiver un joueur.
- Si le joueur se reconnecte, il revient dans la partie sans reset la room.

## Capacites joueur

- Il y a trois capacites:
  - epee laser ;
  - tir laser ;
  - bouclier laser.
- Chaque capacite a sa propre touche.
- Une seule capacite d'attaque peut etre active a la fois.
- L'epee laser touche autour du personnage.
- Le tir laser part dans la direction du joueur.
- Les inputs d'attaque doivent toujours envoyer la direction.
- Une touche de focus ennemi peut etre ajoutee si le front peut la gerer
  proprement.
- Le bouclier protege autour du joueur tant que la touche est maintenue.
- Le bouclier ralentit le joueur pendant son utilisation.
- Le joueur ne peut pas attaquer pendant qu'il utilise le bouclier (coherent avec pas d'attaque en meme temps)
- Les trois capacites ont trois niveaux.
- Les niveaux ameliorent la puissance, le rythme ou la forme de la capacite.
- Cote moteur, les stats peuvent etre calculees par formule selon le niveau.

## Progression

- La ressource d'upgrade V1 ciblee est le gold partage par toute l'equipe.
- Chaque joueur choisit individuellement comment depenser la ressource partagee.
- Les upgrades se font uniquement aux checkpoints.
- Les checkpoints ne sont pas des points de sauvegarde.
- Les checkpoints sont des endroits ou ameliorer ses capacites.
- Les checkpoints peuvent etre reutilises plusieurs fois.
- Le joueur interagit avec un checkpoint avec `E`.
- Le joueur choisit une upgrade avec `1`, `2` ou `3`.
- Les choix d'upgrade sont fixes: epee, tir laser, bouclier.
- Les upgrades ne sont pas aleatoires. (les augmentes sont proposée selon le niveau des attaques)

## Map et moteur

- Le game engine ne possede jamais la map visuelle.
- Le game engine ne connait que les entities dynamiques et les colliders utiles
  au gameplay.
- La map visuelle est geree hors du moteur, cote backend/front.
- Le backend choisit la map utilisee par chaque room.
- Le backend envoie au front les infos statiques de map au debut de partie.
- Le backend transforme la map en entities/colliders constructibles par le
  moteur.
- Au demarrage, le backend envoie les entities au moteur et l'arriere-plan au
  front.
- Le moteur peut ensuite renvoyer l'etat comme une resync normale.
- Le moteur simule les joueurs, robots, projectiles, boss et collisions.
- Chaque room garde son propre etat dynamique.
- Les events gameplay doivent toujours rester limites a la bonne room.

## Map V1

- La map V1 est statique.
- La map V1 peut etre une grille simple de tiles.
- Les collisions viennent des tiles bloquantes, pas du sprite exact.
- Les obstacles adjacents peuvent etre fusionnes en grands rectangles pour garder
  le moteur leger.
- Il n'y a pas de generation procedurale en V1.
- Il n'y a pas de chunks en V1.
- Il n'y a pas de destruction de decor en V1.
- Il n'y a pas de mini-map pour le moment.
- La lecture de la map se fait dans le canvas principal, avec la camera centree
  sur le joueur.

## Checkpoints et boss

- La map contient plusieurs checkpoints d'upgrade.
- Les joueurs explorent la map pour obtenir assez de gold avant le boss.
- Le boss est accessible sans verrou strict.
- Un joueur peut techniquement arriver au boss en evitant les ennemis.
- En pratique, le boss doit etre trop difficile sans upgrades.
- Le chemin naturel est:
  - explorer ;
  - combattre ;
  - gagner du gold ;
  - utiliser les checkpoints ;
  - battre le boss.
- Le boss donne une stat symbolique en fin de partie, mais la partie se termine
  quand meme quand il est battu.

## Ennemis

- Les ennemis sont des robots.
- Les aliens restent possibles plus tard si l'equipe le veut, mais les robots
  sont plus simples pour les sprites et la coherence visuelle.
- Les robots n'ont pas d'IA complexe en V1.
- Tous les robots peuvent utiliser les memes grandes familles d'actions:
  - corps a corps ;
  - tir laser ;
  - bouclier.
- Chaque type de robot prefere un style different.
- Les types de robots peuvent surtout avoir un visuel different et des priorites
  d'action differentes.

## Boss

- Le boss a son propre comportement.
- Le boss doit etre lisible, pas trop chaotique.
- Le boss V1 peut utiliser des patterns simples:
  - projectiles circulaires lents ;
  - laser droit vers un joueur ;
  - attaque annoncee avec une animation du boss.
- Le boss doit tester la coordination de l'equipe sans demander une IA complexe.

## Score, historique et leaderboard

- Le leaderboard global classe les meilleures parties gagnees.
- Le critere principal du leaderboard est le temps de completion.
- Le match history montre les anciennes parties du joueur connecte.
- Le match history affiche les joueurs presents dans la partie et leurs stats.
- Le match history ne sert pas a classer les meilleurs joueurs individuellement.
- Les parties perdues ou abandonnees sont sauvegardees dans le match history.
- Les parties perdues ou abandonnees ne vont pas dans le leaderboard.

## Direction esthetique

- Direction generale: science-fiction lisible et coloree.
- Cadre principal: laboratoire ou facilite scientifique futuriste.
- Les ennemis principaux sont des robots.
- References possibles a citer:
  - `Tron` pour les lignes lumineuses et la lisibilite neon ;
  - `Star Wars` pour les lasers et les armes energetiques simples ;
  - `Halo` pour une science-fiction claire, militaire et lisible.
- Le style doit rester simple a produire en V1.

## Contrat technique

- Le format init, resync et end reste proche cote moteur.
- L'etat principal contient `roomId`, `tick`, `end`, `entities` et
  `playerData`.
- Le moteur gere le `tick`, pas le timer affiche en secondes.
- Le backend calcule le temps officiel en secondes.
- Le front peut afficher un timer local base sur `serverStartedAt`, puis afficher
  le `durationSeconds` officiel recu dans `game:end`.
- `game:end` ajoute surtout `win`.
- Les creations et modifications passent par `entityUpdate`.
- Les suppressions passent par `entityDelete`.
- Le format JSON detaille est dans `docs/V_1/formats_json_v1_game.md`.

## Decisions restantes

- Rien de bloquant pour lancer la V1 technique.
- Les valeurs d'equilibrage peuvent etre ajustees apres test sans changer les
  decisions de gameplay.
