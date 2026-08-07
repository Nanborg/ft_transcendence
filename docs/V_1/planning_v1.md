# Planning V1 - mardi a vendredi 12h

## Ownership pour eviter les doublons

- Nanborg possede review, merge, organisation et mini-corrections.
- Princia possede front events, inputs, canvas V1 technique et rendu map.
- Neon_05 possede moteur, entities moteur, collisions, attaques, boss et
  `game:end` moteur.
- Loufoko possede map V1, colliders issus de la map et tests techniques.
- Yaoberso possede DB, persistence, history et leaderboard.
- Une personne ne modifie pas le bloc d'une autre sans se coordonner avant.
- Si un sujet touche deux blocs, il y a un seul owner et l'autre fournit le
  format attendu.

## Mardi

### Nanborg

- Partager `docs/V_1/formats_json_v1_game.md` comme contrat JSON a utiliser.
- Verifier que les branches ouvertes ne touchent pas inutilement les memes
  fichiers.
- Garder les PR Nanborg en attente si elles dependent encore de `game:state` ou
  `game:end`.
- Review les premieres branches si elles sont poussees.
- Faire uniquement les mini-corrections evidentes sur GitHub.

### Princia

- Ajouter les listeners front:
  - `game:state:init`
  - `game:state:update`
  - `game:end`
  - `game:error`
- Ajouter l'emission front:
  - `game:resync`
- Ajouter les inputs front:
  - WASD pour bouger
  - touches separees pour les 3 capacites
  - `E` pour checkpoint
  - `1`, `2`, `3` pour choisir une upgrade
- Envoyer des inputs explicites au backend:
  - movement
  - melee
  - ranged
  - shield
  - direction
  - targetEntityId si focus ennemi ajoute
  - checkpoint interact
  - upgrade choice

### Neon_05

- Parser le payload de creation de room moteur avec:
  - roomId
  - scale
  - entities initiales
- Ignorer les entities dont le `typeId` n'est pas constructible.
- Rattacher chaque entity moteur a une `room`.
- Verifier que deux rooms differentes ne partagent pas leurs entities.
- Envoyer un premier `entityUpdate` minimal avec:
  - roomId
  - tick
  - entityId
  - typeId
  - posX
  - posY

### Loufoko

- Creer une map V1 minimale avec:
  - 4 spawn points
  - 3 checkpoints
  - une position de boss
  - murs simples
  - obstacles simples
- Produire les entities/colliders de la map:
  - limites
  - murs
  - obstacles
- Regrouper les murs adjacents en grands rectangles quand c'est simple.
- Fournir un exemple de map + entities constructibles par le moteur.

### Yaoberso

- Preparer la sauvegarde backend d'un faux `game:end`.
- Adapter la DB si des champs manquent pour:
  - won
  - lost
  - abandoned
  - duration
  - deaths
  - damageDealt
  - damageReceived
  - upgrades finales
- Verifier que le faux `game:end` peut creer un `GameRun`.
- Verifier que le faux `game:end` peut creer les stats joueurs.

## Mercredi

### Nanborg

- Review les branches poussees mardi.
- Verifier que le front demarre encore.
- Verifier que les PR Nanborg restent adaptables.
- Lister les bugs bloquants pour jeudi matin.
- Faire les mini-corrections GitHub qui ne changent pas le scope.

### Princia

- Initialiser le front avec `game:state:init`.
- Stocker separement cote front:
  - map statique
  - entities par `entityId`
  - playerData par `playerId`
  - checkpoints
- Appliquer `game:state:update` sans reset tout l'etat.
- Gerer dans les updates:
  - `entityUpdate`
  - `entityDelete`
  - changement de `posX`
  - changement de `posY`
  - changement de `health`
  - changement de `state`
  - changement de `playerData`
- Dessiner dans le canvas:
  - fond sombre
  - map basique
  - obstacles rectangles
  - joueurs
  - robots
  - projectiles
  - boss
  - checkpoints

### Neon_05

- Ajouter les entities moteur minimales:
  - player
  - robot melee
  - robot laser
  - robot bouclier
  - projectile
  - boss
- Ajouter les HP de base:
  - player: 100
  - robot melee: 80
  - robot laser: 50
  - robot bouclier: 100
  - boss: 2000 avant scaling
- Envoyer un update quand une entity change:
  - position
  - HP
  - state
  - suppression
- Utiliser `entityUpdate` pour creation/modification.
- Utiliser `entityDelete` pour suppression.
- Ajouter collision joueur contre collider.

### Loufoko

- Tester les colliders:
  - joueur bloque par mur
  - joueur libre sur sol
  - deux rooms sans melange d'etat
- Fournir des commandes de test pour:
  - create room
  - create room avec entities initiales
  - join player
  - move player
  - spawn robot
- Si map/colliders sont finis, aider Neon uniquement sur tests/debug, sans
  modifier directement la logique robot/projectile.

### Yaoberso

- Sauvegarder un faux `game:end`.
- Faire fonctionner `/scores/history` avec les parties du joueur connecte.
- Faire fonctionner `/scores/leaderboard` avec les parties victorieuses triees
  par temps.
- Exclure `lost` et `abandoned` du leaderboard.
- Retourner des payloads front propres, pas des objets Prisma bruts.

## Jeudi matin

### Nanborg

- Faire un point rapide avec chaque personne.
- Identifier les bugs bloquants.
- Review ce qui est deja pousse.
- Demander uniquement les corrections indispensables.
- Ne pas prendre de nouvelle grosse feature.

### Princia

- Corriger les bugs front events trouves mercredi.
- Stocker `game:end` cote front.
- Afficher le timer local avec `serverStartedAt`.
- Afficher un recap minimal de fin:
  - result
  - durationSeconds
  - players
  - deaths
  - damageDealt
  - damageReceived
- Verifier que le front ignore les events d'une autre room.

### Neon_05

- Ajouter les attaques joueur minimales:
  - epee laser autour du joueur
  - tir laser vers cible proche
  - bouclier maintenu
- Ajouter les attaques boss minimales:
  - projectiles circulaires lents
  - laser droit vers un joueur
  - attaque annoncee par animation du boss
- Ajouter les conditions de fin:
  - boss mort
  - tous les joueurs actifs morts
  - timeout
- Envoyer `game:end` au backend.

### Loufoko

- Tester une partie avec la map V1.
- Tester plusieurs spawn points.
- Tester au moins un obstacle bloquant.
- Tester au moins un robot et un projectile.
- Noter les commandes qui marchent et celles qui cassent.

### Yaoberso

- Brancher la persistence backend sur le payload `game:end` le plus proche du
  vrai.
- Calculer et sauvegarder `durationSeconds` cote backend.
- Verifier que `won` apparait dans le leaderboard.
- Verifier que `lost` et `abandoned` restent dans history mais pas leaderboard.
- Tester history avec plusieurs parties pour le meme joueur.

## Jeudi apres-midi

### Princia

- Finaliser les corrections front sans attendre Nanborg.
- Finaliser le rendu canvas V1 technique.
- Pousser la branche avant le soir si possible.

### Neon_05

- Finaliser les colliders et entities moteur.
- Finaliser `game:end` moteur.
- Pousser meme si certaines attaques sont simplifiees.

### Loufoko

- Finaliser map/colliders/tests.
- Aider Neon uniquement sur tests/debug si map/colliders sont finis.
- Pousser la branche avant le soir si possible.

### Yaoberso

- Finaliser DB/history/leaderboard.
- Pousser la branche avant le soir si possible.

## Jeudi soir

### Nanborg

- Tester le chemin complet si possible:
  - create room
  - join room
  - ready
  - start game
  - movement
  - update state
  - attack
  - game end
  - history
  - leaderboard
- Review toutes les branches poussees.
- Faire les petites corrections evidentes directement.
- Lister les corrections necessaires vendredi matin.

### Toute l'equipe

- Pousser tout ce qui est testable.
- Ecrire clairement dans chaque PR:
  - ce qui marche
  - ce qui est partiel
  - ce qui reste a faire
- Ne rien garder d'important seulement en local.

## Vendredi avant 12h

### Nanborg

- Recuperer les PR.
- Review.
- Faire les mini-fix rapides.
- Merger ce qui est stable.
- Garder hors merge ce qui casse la V1.
- Preparer pour la reunion:
  - ce qui marche
  - ce qui est partiel
  - ce qui bloque encore
  - ce qui sera planifie apres

### Toute l'equipe

- Push final avant 12h.
- Ne pas ajouter de nouvelle feature.
- Ne pas faire de gros refactor.
- Corriger seulement:
  - crash
  - mauvais event
  - mauvais `roomId`
  - payload incoherent
  - route score cassee
  - front qui ne demarre pas
  - moteur qui ne lance pas la room
