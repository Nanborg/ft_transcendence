# Valeurs d'equilibrage V1

Objectif du fichier: garder les chiffres, calculs et valeurs de test separes des
decisions de gameplay.

## Joueur

- Vie max joueur: `100 HP`.
- Respawn:
  - temps de base: `5 s` ;
  - chaque mort ajoute `+5 s` ;
  - temps maximum: `30 s` ;
  - invulnerabilite apres respawn: `3 s` ;
  - respawn avec `100 HP`.

## Upgrades

- Chaque capacite a `3 niveaux`.
- Les 3 niveaux sont le scope V1 cote gameplay.
- Cote moteur, les valeurs peuvent etre calculees par formule selon le niveau
  pour eviter de coder chaque niveau a la main.
- Cout upgrade propose:
  - niveau 1 vers niveau 2: `100 gold` ;
  - niveau 2 vers niveau 3: `250 gold`.
- Le gold est partage par l'equipe.
- Le choix d'upgrade reste individuel.

## Epee laser

- Forme: attaque autour du personnage.
- Degats proposes:
  - niveau 1: `35` ;
  - niveau 2: `55` ;
  - niveau 3: `80`.
- Cooldown propose:
  - niveau 1: `1.5 s` ;
  - niveau 2: `1.0 s` ;
  - niveau 3: `0.7 s`.
- Formule possible si le moteur prefere:
  - degats = `20 + niveau * 20` ;
  - cooldown ticks = conversion moteur depuis les valeurs V1.

## Tir laser

- Forme: tir dans la direction du joueur.
- Niveau 1: laser simple.
- Niveau 2: plusieurs lasers qui se suivent.
- Niveau 3: laser continu.
- Degats proposes:
  - niveau 1: `15` par laser ;
  - niveau 2: `20` par laser ;
  - niveau 3: `10` par tick de laser continu.
- La portee, les degats et le nombre de lasers augmentent avec le niveau.
- Cooldown propose:
  - niveau 1: `1.2 s` ;
  - niveau 2: `0.9 s` ;
  - niveau 3: `0.6 s`.

## Bouclier laser

- Forme: protection autour du joueur.
- Activation: touche maintenue.
- Le joueur ne peut pas attaquer pendant l'utilisation.
- Le joueur est ralenti pendant l'utilisation.
- Cooldown apres utilisation: `3 s`.
- Reserve de protection proposee:
  - niveau 1: `100 %` ;
  - niveau 2: `200 %` ;
  - niveau 3: `500 %`.
- Absorption effective:
  - si la reserve est superieure ou egale a `100 %`, le joueur absorbe `100 %`
    des degats ;
  - si la reserve est inferieure a `100 %`, le joueur absorbe ce pourcentage ;
  - exemple: reserve a `70 %` = `70 %` des degats absorbes et `30 %` subis.
- Drain V1 accepte cote moteur:
  - baisse lineaire de protection dans le temps ;
  - plus simple a implementer et a lire cote moteur.
- Variante gardee pour plus tard:
  - baisse en pourcentage de la valeur actuelle.
- Feedback visuel:
  - couleur forte quand la reserve est haute ;
  - couleur plus faible quand la reserve descend.

## Robots V1

- Nombre de types V1: `3`.
- Types proposes:
  - robot melee ;
  - robot laser ;
  - robot bouclier.
- Les robots peuvent partager la meme logique.
- Leur type change surtout:
  - la priorite d'action ;
  - le visuel ;
  - quelques stats simples.

## Boss V1

- Attaques proposees:
  - projectiles circulaires lents ;
  - laser droit annonce ;
  - zone au sol annoncee avant degat.
- Le boss doit etre lisible et plus simple qu'un bullet hell complet.

## Map V1

- Nombre de joueurs par room: jusqu'a `4`.
- Nombre de spawn points: `4`.
- Nombre de checkpoints: `3`.
- Chaque checkpoint peut etre reutilise autant de fois que necessaire.
- Interaction checkpoint: `E`.
- Choix upgrade: `1`, `2`, `3`.

## Score et historique

- Leaderboard:
  - uniquement les parties gagnees ;
  - classement par meilleur temps.
- Match history:
  - parties gagnees ;
  - parties perdues ;
  - parties abandonnees ;
  - stats de tous les joueurs presents dans la partie.
- Stats utiles:
  - duree ;
  - resultat ;
  - morts ;
  - degats infliges ;
  - degats recus ;
  - upgrades finales ;
  - boss battu ou non.
