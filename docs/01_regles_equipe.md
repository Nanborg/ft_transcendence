# Regles de travail en equipe - ft_transcendence

## 1. But du document

Ce document fixe les regles communes pour travailler proprement en equipe.

Objectifs :

- tout le monde sait quoi faire ;
- le travail est visible ;
- les commits viennent de tous les membres ;
- les features importantes sont comprises par toute l'equipe ;
- le projet reste testable et demonstrable ;
- personne ne depend d'une seule personne pour comprendre une partie critique.

## 2. Contraintes importantes du sujet

Le projet doit respecter ces points :

- chaque membre contribue avec ses propres commits ;
- les messages de commit sont clairs ;
- le travail est reparti et documente ;
- le projet se lance avec Docker, Podman ou equivalent, en une commande ;
- le README final est en anglais ;
- `.env` est ignore par Git ;
- `.env.example` est fourni ;
- l'application fonctionne sur la derniere version stable de Chrome ;
- la console navigateur ne contient pas d'erreur ou warning important ;
- Privacy Policy et Terms of Service sont accessibles et non vides ;
- chaque module annonce est fonctionnel et demonstrable ;
- chaque membre peut expliquer son travail, l'organisation et les grandes parties du code.

## 3. Roles

Les roles doivent etre notes dans le README final.

| Role | Responsabilites |
|---|---|
| Product Owner | vision produit, priorites, validation des features |
| Scrum Master / PM | planning, issues, blocages, coordination, suivi |
| Tech Lead / Architect | architecture, choix techniques, qualite code |
| Developers | implementation, tests, documentation, reviews |

Une personne peut avoir plusieurs roles, mais chaque responsabilite doit etre
couverte.

## 4. Issues et taches

Une issue doit avoir un objectif clair et testable.

Une bonne issue contient :

- objectif ;
- contexte court ;
- travail a faire ;
- branche conseillee ;
- test manuel ;
- definition of done ;
- dependances si besoin.

Formats utiles :

```txt
feature : nouvelle fonctionnalite
bug     : correction
fix     : correction technique courte
docs    : documentation
setup   : installation / Docker / structure
test    : verification
chore   : entretien
```

Priorites :

```txt
P0 = bloque le projet ou la demo
P1 = necessaire pour le socle commun
P2 = important mais pas bloquant
P3 = bonus, polish, enrichissement
```

Regle :

```txt
P0/P1 avant les extras.
```

## 5. Branches Git

Les noms de branches doivent etre en anglais.

Branches principales :

```txt
main
dev
```

Branches d'integration par domaine :

```txt
area/front
area/backend-api-db
area/websocket-multiplayer
area/gameplay-cpp
area/auth-users-scores
area/docker-setup
```

Branches de travail :

```txt
feature/front-login-page
feature/socket-ready-system
feature/game-player-movement
fix/auth-session-expire
docs/readme-setup
setup/docker-compose
chore/update-env-example
```

Branches personnelles temporaires si utiles :

```txt
misc/nicolsan
misc/yaoberso
misc/mm-furi
misc/ylabussi
misc/malapoug
```

Flux conseille :

```txt
feature/... -> area/... -> dev -> main
```

Regles :

- `main` reste stable et demonstrable ;
- `dev` sert a integrer les domaines ensemble ;
- `area/...` regroupe les features d'un domaine ;
- `feature/...`, `fix/...`, `docs/...`, `setup/...` correspondent a des taches courtes ;
- `misc/...` sert aux essais personnels et ne merge pas directement dans `main`.

## 6. Commits

Format conseille :

```txt
type(scope): action claire
```

Exemples :

```txt
feat(lobby): add room creation
fix(auth): handle expired session
docs(readme): add docker launch steps
setup(docker): add backend service
refactor(api): split user routes
```

Regles :

- pas de commit geant avec plusieurs sujets differents ;
- pas de `.env` ou secret ;
- pas de fichier genere inutile ;
- chaque commit doit pouvoir etre explique ;
- chaque membre doit avoir des commits visibles.

Avant de push :

- relire son diff ;
- verifier les secrets ;
- lancer les commandes utiles ;
- tester manuellement ;
- mettre l'issue a jour.

## 7. Pull Requests et reviews

Une PR doit etre ouverte quand la feature est terminee ou testable.

Une PR doit contenir :

```md
## Resume

## Tests

## Points a verifier

## Issue liee
```

Le reviewer verifie :

- la feature correspond a l'issue ;
- le code est comprehensible ;
- les erreurs principales sont gerees ;
- les routes, events, schemas ou payloads sont documentes si besoin ;
- la feature a ete testee ;
- l'auteur sait expliquer ce qu'il a fait.

Avant merge :

- la branche demarre ;
- le parcours principal n'est pas casse ;
- les conflits sont resolus proprement ;
- l'issue est a jour ;
- une feature importante est relue ou montree a l'equipe.

## 8. Definition of done

Une tache est terminee seulement si :

- elle fonctionne ;
- elle est testee ;
- elle ne casse pas le parcours principal ;
- elle est relue ou montrable ;
- elle est documentee si elle ajoute une route, un event, une table ou une regle ;
- l'equipe comprend le but, le flux et le test manuel.

Checks par domaine :

| Domaine | A verifier |
|---|---|
| Front | etats normal/loading/error/empty, responsive minimum, console Chrome propre |
| Backend | validation inputs, erreurs HTTP propres, pas de donnees sensibles exposees |
| WebSocket | test multi-navigateurs, payloads stables, deconnexion simple |
| Gameplay | comportement visible, victoire/defaite claire, score sauvegardable |
| DB | schema clair, relations comprehensibles, migrations propres |

## 9. Partage de connaissance

Une feature importante doit etre presentee a l'equipe.

L'explication doit couvrir :

- but ;
- fichiers principaux ;
- donnees recues/envoyees ;
- flux global ;
- test manuel ;
- limites connues ;
- impact sur les autres domaines.

Regle simple :

```txt
Si une seule personne comprend une feature importante, elle n'est pas vraiment terminee.
```

## 10. IA

L'IA peut etre utilisee, mais le sujet insiste sur la responsabilite.

Bon usage :

- chercher des pistes ;
- generer une checklist ;
- expliquer une techno ;
- aider a relire ;
- proposer un exemple que l'equipe comprend et adapte.

Regles :

- toujours relire ;
- toujours tester ;
- ne pas copier du code incompris ;
- demander une review humaine sur les parties importantes ;
- noter dans le README comment l'IA a ete utilisee.

## 11. Securite

Regles obligatoires :

- ne jamais committer `.env` ;
- fournir `.env.example` ;
- garder les secrets hors Git ;
- ne pas logger de token ou mot de passe ;
- hasher et saler les mots de passe si auth email/password ;
- valider les inputs cote frontend et backend ;
- proteger les routes utilisateur ;
- verifier son diff avant chaque push.

## 12. Documentation et README final

Le README final doit etre en anglais.

Il doit contenir :

- premiere ligne en italique avec le texte demande par le sujet et les logins ;
- description claire du projet ;
- instructions de lancement ;
- prerequis ;
- roles de l'equipe ;
- organisation du travail ;
- stack technique ;
- schema DB ;
- liste des features ;
- modules choisis et calcul des points ;
- contributions individuelles ;
- difficultes et solutions ;
- usage de l'IA.

Pendant le projet, on note au fur et a mesure :

- decisions techniques ;
- routes API ;
- events Socket.IO ;
- schemas DB ;
- modules retenus ;
- bugs connus ;
- commandes de lancement.

## 13. Communication et blocages

Point rapide regulier :

- ce que j'ai fait ;
- ce que je fais ;
- ce qui me bloque ;
- ce qui doit etre relu ou teste.

Si une personne bloque trop longtemps sur un probleme important, elle le signale.

Un blocage cache est un risque pour l'equipe.

## 14. Evaluation

Pendant l'evaluation, chaque membre doit pouvoir expliquer :

- son travail ;
- les roles ;
- l'organisation ;
- les modules choisis ;
- les grandes parties du projet ;
- le parcours utilisateur principal ;
- comment lancer le projet ;
- comment tester une partie ;
- comment les scores sont sauvegardes ;
- comment l'IA a ete utilisee.

Le sujet peut demander une petite modification pendant l'evaluation. Pour s'y
preparer :

- garder le code lisible ;
- eviter les fonctions enormes ;
- documenter les formats importants ;
- savoir ou sont les routes, events, composants et schemas ;
- savoir refaire un test manuel rapidement.

## 15. Checklists rapides

Avant de commencer :

- [ ] issue claire ;
- [ ] branche creee ;
- [ ] resultat attendu compris ;
- [ ] test manuel defini.

Avant review :

- [ ] code relu ;
- [ ] diff relu ;
- [ ] aucun secret ;
- [ ] feature testee ;
- [ ] limites notees.

Avant demo :

- [ ] lancement depuis zero ;
- [ ] login ;
- [ ] lobby / room ;
- [ ] chat ;
- [ ] ready ;
- [ ] partie lancee et terminee ;
- [ ] score/history/leaderboard visible ;
- [ ] console Chrome propre ;
- [ ] Privacy Policy et Terms of Service accessibles ;
- [ ] chaque membre sait quoi expliquer.

