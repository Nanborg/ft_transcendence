# Role 5 - Auth / Users / Scores

## Mission

Gerer l'identite des joueurs et les resultats : auth, OAuth 42, profils, amis,
scores, historique de parties et leaderboard.

## Responsabilites

- integrer l'auth standard et OAuth 42 ;
- creer ou recuperer l'utilisateur en DB ;
- gerer session ou token ;
- proteger les routes utilisateur ;
- gerer profils et amis ;
- recevoir un resultat de partie valide ;
- sauvegarder GameRun et PlayerRunStats ;
- fournir historique personnel ;
- fournir leaderboard global ;
- verifier que les stats affichees viennent de la DB.

## Fonctionnalites utilisateur

- login ;
- profil utilisateur ;
- avatar ;
- statut online ;
- liste d'amis ;
- historique personnel ;
- resume des statistiques ;
- leaderboard.

## Donnees de resultat possibles

| Donnee | Description |
|---|---|
| Score total | score final de la partie |
| Resultat | victoire ou defaite |
| Objectif | objectif joue ou condition de fin |
| Stats utiles | donnees selon le mode choisi |
| Ennemis vaincus | stat possible si retenue |
| Progression | progression atteinte |
| Nombre de joueurs | taille de l'equipe |
| Personnage | personnage utilise |
| Difficulte | difficulte choisie |

## Ordre de travail conseille

1. Creer le modele User.
2. Mettre un fallback dev si OAuth bloque.
3. Integrer OAuth 42.
4. Ajouter Profile.
5. Ajouter Friends.
6. Ajouter GameRun / PlayerRunStats.
7. Recevoir un `game:end`.
8. Sauvegarder le resultat.
9. Afficher History.
10. Afficher Leaderboard.

## Regle importante

Les scores doivent venir d'un resultat de partie coherent, pas d'une valeur
libre envoyee par le client.

Flux attendu :

```txt
game:end -> validation serveur -> DB -> history / leaderboard
```

## Definition of done

- un utilisateur peut se connecter ;
- son profil existe en DB ;
- les routes protegees refusent les utilisateurs non connectes ;
- une partie terminee peut etre sauvegardee ;
- history retourne des donnees lisibles ;
- leaderboard retourne des donnees lisibles ;
- les stats affichees correspondent aux donnees sauvegardees.

## Points a surveiller

- ne pas bloquer toute l'equipe si OAuth 42 prend du temps ;
- prevoir un fallback dev local ;
- ne pas laisser le client inventer les scores ;
- garder les donnees compatibles avec frontend, backend et demo ;
- documenter les champs sauvegardes.

## A savoir expliquer

- fonctionnement de l'auth ;
- difference entre auth standard et OAuth 42 ;
- structure User / GameRun / PlayerRunStats ;
- comment un resultat est sauvegarde ;
- comment history et leaderboard lisent les donnees.
