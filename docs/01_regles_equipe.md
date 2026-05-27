# Regles de travail en equipe - ft_transcendence

## 1. Role du document

Ce document definit la maniere de travailler pendant le projet.

Le but est que toute l'equipe avance avec les memes regles :

- chacun sait quoi faire ;
- chacun comprend ce que font les autres ;
- les taches sont visibles ;
- les decisions importantes sont notees ;
- le code est relu ;
- les features sont testees ;
- aucune feature importante ne reste connue par une seule personne ;
- chaque membre peut expliquer le projet pendant l'evaluation.

Le sujet insiste sur deux points importants :

- tous les membres doivent contribuer au projet ;
- tous les membres doivent pouvoir expliquer leur travail, l'organisation et les
  grandes parties du code.

## 2. Principes d'equipe

### 2.1 Responsabilite commune

Chaque membre a une zone principale, mais le projet appartient a toute l'equipe.

Une personne peut etre responsable d'une partie, mais toute l'equipe doit en
connaitre le role, le flux principal, les fichiers importants et la maniere de la
tester.

Regle :

- une feature importante doit etre presentee a toute l'equipe ;
- une partie critique doit etre relue, testee ou demontrable devant l'equipe ;
- les choix techniques importants doivent etre notes ;
- les blocages doivent etre signales rapidement.

### 2.2 Pas de silo

Un silo existe quand une partie du projet ne peut etre expliquee que par une
seule personne.

Pour eviter ca :

- chaque zone doit avoir une petite documentation ;
- les routes, events et schemas doivent etre lisibles ;
- les decisions doivent etre notees dans une issue, un document ou une PR ;
- les reviews doivent servir a partager la comprehension, pas seulement a valider ;
- chaque membre doit pouvoir lancer le projet localement.

### 2.3 Communication courte et reguliere

L'equipe doit garder un rythme simple :

- point rapide regulier ;
- liste des blocages ;
- verification des taches en cours ;
- rappel des priorites ;
- decisions notees quelque part.

Un blocage ne doit pas rester cache. Si une personne bloque plus d'une demi-journee
sur un probleme important, elle le signale.

## 3. Roles

Les roles doivent etre clairement documentes dans le README final.

| Role | Responsabilites |
|---|---|
| Product Owner | vision produit, priorites, validation des features |
| Scrum Master / PM | organisation, planning, suivi, blocages, communication |
| Tech Lead / Architect | architecture, qualite technique, decisions critiques |
| Developers | implementation, tests, documentation, reviews |

Une personne peut avoir plusieurs roles, mais chaque responsabilite doit etre
couverte.

## 4. Organisation des taches

### 4.1 Une tache = un objectif clair

Chaque tache doit decrire un resultat concret.

Mauvais exemple :

```txt
Faire le backend
```

Bon exemple :

```txt
Ajouter la route GET /users/me qui renvoie l'utilisateur connecte
```

Une bonne tache contient :

- un titre clair ;
- le domaine concerne ;
- ce qui doit etre fait ;
- comment tester ;
- les fichiers ou modules probablement touches ;
- les dependances avec d'autres taches si besoin.

### 4.2 Taille des taches

Une tache doit rester assez petite pour etre terminee, testee et relue.

Si une tache contient trop de choses, elle doit etre decoupee.

Exemple :

```txt
Tache trop large :
- Faire le lobby

Taches decoupees :
- Creer l'ecran Lobby
- Creer une room cote backend
- Rejoindre une room via Socket.IO
- Afficher la liste des joueurs
- Ajouter le ready system
- Tester deux navigateurs dans la meme room
```

### 4.3 Types de taches

Chaque issue peut etre classee par type :

| Type | Utilisation |
|---|---|
| feature | nouvelle fonctionnalite |
| bug | comportement incorrect |
| refactor | amelioration interne sans changement visible |
| doc | documentation |
| test | verification automatique ou manuelle |
| chore | configuration, nettoyage, organisation |

### 4.4 Priorites

| Priorite | Sens |
|---|---|
| P0 | bloque le projet ou la demo |
| P1 | necessaire pour le socle commun |
| P2 | important mais pas bloquant immediatement |
| P3 | enrichissement ou polish |

Les taches P0 et P1 passent avant les enrichissements.

## 5. Format conseille pour les issues

Chaque issue importante doit suivre ce format :

```md
## Objectif
Ce que la tache doit permettre.

## Contexte
Pourquoi on en a besoin.

## Travail a faire
- [ ] sous-tache 1
- [ ] sous-tache 2
- [ ] sous-tache 3

## Definition of done
- [ ] la feature fonctionne
- [ ] elle est testee
- [ ] elle ne casse pas l'existant
- [ ] l'equipe comprend le but, le flux et le test manuel

## Test manuel
Etapes pour verifier.

## Notes
Routes, events, fichiers, decisions ou risques.
```

## 6. Git et branches

### 6.1 Regle principale

Le sujet demande :

- des commits de tous les membres ;
- des messages clairs ;
- une repartition visible du travail ;
- un historique Git propre.

Chaque membre doit donc contribuer avec ses propres commits.

### 6.2 Branches

Une branche doit correspondre a une tache ou a un petit groupe de taches liees.

Format conseille :

```txt
type/domaine-description-courte
```

Exemples :

```txt
feature/lobby-create-room
feature/socket-ready-system
feature/game-player-movement
bug/auth-session-expire
doc/readme-setup
```

### 6.3 Commits

Un commit doit expliquer ce qui change.

Format conseille :

```txt
type(scope): action claire
```

Exemples :

```txt
feat(lobby): add room creation event
fix(auth): handle expired session token
docs(setup): add docker launch steps
test(game): add manual checklist for local run
refactor(api): split user routes
```

Regles :

- ne pas faire un commit geant avec plusieurs sujets differents ;
- ne pas committer du code non teste volontairement ;
- ne pas committer de secrets ;
- ne pas committer `.env` ;
- ne pas committer des fichiers generes inutiles ;
- chaque commit doit pouvoir etre explique.

### 6.4 Avant de pousser une branche

Avant de push :

- relire son diff ;
- verifier qu'aucun secret n'est present ;
- lancer les commandes utiles ;
- tester la feature manuellement ;
- mettre a jour l'issue ;
- noter les limites connues.

## 7. Pull requests et reviews

### 7.1 Quand ouvrir une PR

Une PR doit etre ouverte quand :

- la tache est terminee ou testable ;
- la branche demarre ;
- la feature ne casse pas volontairement l'existant ;
- l'auteur peut expliquer ce qu'il a fait.

### 7.2 Contenu d'une PR

Une PR doit contenir :

```md
## Resume
Ce qui change.

## Tests
- [ ] test manuel 1
- [ ] test manuel 2

## Points a verifier
Ce que le reviewer doit regarder.

## Issue liee
Closes #...
```

### 7.3 Review

Le reviewer doit verifier :

- la feature correspond a l'issue ;
- le code est comprehensible ;
- les noms sont clairs ;
- les erreurs principales sont gerees ;
- les routes/events sont documentes si necessaire ;
- la feature a ete testee ;
- l'auteur peut expliquer son code.

La review doit aider a comprendre. Les commentaires doivent etre precis,
calmes et utiles.

### 7.4 Merge

Avant merge :

- une feature importante a ete relue ou montree a l'equipe ;
- la branche demarre ;
- les conflits sont resolus proprement ;
- l'issue est a jour ;
- les tests manuels importants sont faits.

## 8. Definition of done

Une tache est terminee seulement si :

- elle fonctionne ;
- elle est testee ;
- elle est relue ou montrable a l'equipe ;
- elle ne casse pas le parcours principal ;
- elle est documentee si elle ajoute une route, un event, une table ou une regle ;
- l'auteur sait expliquer le fonctionnement ;
- l'equipe connait le flux principal et la maniere de tester.

Pour une feature visible :

- l'interface affiche un etat normal ;
- l'interface gere au moins un etat d'erreur ;
- l'interface ne montre pas d'erreur console evidente ;
- le comportement a ete teste dans Chrome.

Pour une feature backend :

- les inputs sont valides ;
- les erreurs principales sont gerees ;
- les donnees sensibles ne sont pas exposees ;
- la DB reste coherente ;
- le format de reponse est documente.

Pour une feature temps reel :

- deux clients peuvent tester le cas principal ;
- les deconnexions simples sont considerees ;
- les events sont nommes clairement ;
- l'etat est coherent entre les clients.

Pour une feature gameplay :

- le comportement est visible en partie ;
- il existe une maniere simple de le tester ;
- les valeurs importantes sont faciles a ajuster ;
- le lien avec le score, la fin de partie ou l'etat joueur est clair.

## 9. Documentation obligatoire pendant le projet

Le README final devra etre en anglais et contenir beaucoup d'informations. Pour
eviter de tout reconstruire a la fin, on documente au fur et a mesure.

Informations a garder :

- roles de chaque membre ;
- responsabilites ;
- stack technique ;
- choix techniques importants ;
- schema DB ;
- routes API ;
- events Socket.IO ;
- modules choisis ;
- calcul des points ;
- features implementees ;
- contribution de chaque membre ;
- problemes rencontres ;
- solutions retenues ;
- usage de l'IA.

## 10. Regles de partage de connaissance

### 10.1 Explication apres chaque feature

Quand une feature importante est terminee, l'auteur doit la presenter a l'equipe.
L'explication doit couvrir :

- le but ;
- les fichiers principaux ;
- les donnees recues ;
- les donnees renvoyees ;
- le flux global ;
- comment tester ;
- les limites connues ;
- l'impact sur les autres parties du projet.

### 10.2 Niveau de comprehension attendu

Tout le monde n'a pas besoin de connaitre chaque ligne de code, mais tout le
monde doit connaitre :

- le role de chaque grande partie ;
- le flux utilisateur principal ;
- les routes API importantes ;
- les events Socket.IO importants ;
- les tables principales ;
- le flux d'une partie ;
- le chemin des scores jusqu'a la DB ;
- comment lancer et tester le projet.

### 10.3 Pas de code magique

Si un code important est ajoute, il doit etre explicable par son auteur et
comprehensible par l'equipe au niveau du flux.

Regle simple :

```txt
Si l'equipe ne comprend pas le role d'une feature, la feature n'est pas vraiment terminee.
```

## 11. Utilisation de l'IA

Le sujet autorise l'IA comme aide, mais insiste sur la responsabilite et la
comprehension.

Regles d'equipe :

- utiliser l'IA pour gagner du temps sur la recherche, les idees, les exemples,
  la documentation ou les taches repetitives ;
- toujours relire et tester ce qui vient de l'IA ;
- ne pas coller du code incompris ;
- mentionner dans le README comment l'IA a ete utilisee ;
- demander une review humaine sur les parties importantes ;
- etre capable d'expliquer chaque ligne critique.

Bon usage :

- demander des pistes ;
- demander une checklist ;
- demander une explication ;
- demander un exemple puis l'adapter ;
- demander une review de code.

Mauvais usage :

- copier une feature complete sans comprendre ;
- accepter une solution non testee ;
- laisser l'IA decider seule de l'architecture ;
- utiliser du code que personne ne peut defendre en evaluation.

## 12. Securite et donnees sensibles

Regles obligatoires :

- ne jamais committer `.env` ;
- garder les secrets dans `.env` ;
- fournir un `.env.example` ;
- ne pas exposer de token ou mot de passe dans les logs ;
- hasher et saler les mots de passe si auth email/password ;
- valider les inputs cote frontend et backend ;
- eviter les messages d'erreur qui exposent trop d'informations ;
- garder un schema DB clair ;
- verifier les droits d'acces sur les routes utilisateur.

## 13. Qualite frontend

Le sujet demande une application claire, responsive et accessible.

Regles :

- tester dans Chrome ;
- verifier la console ;
- ne pas laisser d'erreurs visibles ;
- garder les pages lisibles ;
- gerer loading, erreur et etat vide ;
- rendre Privacy Policy et Terms of Service accessibles ;
- ne pas laisser de placeholder vide ;
- verifier que plusieurs utilisateurs peuvent utiliser l'application en meme temps.

## 14. Qualite backend

Regles :

- routes nommees clairement ;
- validation des body/query/params ;
- erreurs HTTP coherentes ;
- pas de stack trace exposee au client ;
- schema DB documente ;
- migrations propres ;
- relations DB comprehensibles ;
- endpoints importants notes pour le README.

## 15. Qualite temps reel

Regles :

- events Socket.IO nommes clairement ;
- payloads documentes ;
- tests avec plusieurs navigateurs ;
- etat de room coherent ;
- ready system fiable ;
- deconnexion geree simplement ;
- pas de duplication de joueurs ;
- pas de data race evidente sur les actions simultanees.

## 16. Qualite gameplay

Regles :

- le gameplay doit etre testable rapidement ;
- chaque mecanique doit etre visible ;
- les regles de victoire/defaite doivent etre claires ;
- les scores doivent etre reproductibles et sauvegardables ;
- les valeurs de balancing doivent etre faciles a retrouver ;
- les inputs et l'etat de jeu doivent etre documentes.

## 17. Reunions

### 17.1 Point court

Frequence conseillee : regulierement, selon disponibilites.

Chaque personne repond :

- ce que j'ai fait ;
- ce que je fais maintenant ;
- ce qui me bloque ;
- ce que quelqu'un doit relire ou tester.

### 17.2 Point hebdomadaire

Une fois par semaine :

- verifier les issues ;
- fermer les taches terminees ;
- identifier les blocages ;
- tester le projet depuis la branche principale ;
- verifier les modules vises ;
- ajuster les priorites ;
- noter les decisions importantes.

## 18. Gestion des blocages

Quand quelqu'un bloque :

1. il note le probleme clairement ;
2. il partage le message d'erreur ou le comportement observe ;
3. il explique ce qu'il a deja essaye ;
4. une autre personne regarde avec lui ou le sujet est pose a l'equipe ;
5. si une decision est prise, elle est notee.

Un blocage technique n'est pas une faute. Un blocage cache devient un risque pour
l'equipe.

## 19. Preparation evaluation

Pendant l'evaluation, l'equipe peut etre questionnee sur :

- les roles ;
- l'organisation ;
- la repartition du travail ;
- les contributions individuelles ;
- les modules choisis ;
- les choix techniques ;
- le fonctionnement du code ;
- les difficultes rencontrees ;
- l'usage de l'IA.

Chaque membre doit pouvoir expliquer :

- son travail ;
- les grandes parties du projet ;
- le parcours utilisateur principal ;
- comment lancer le projet ;
- comment tester une partie ;
- comment les scores sont sauvegardes ;
- comment l'equipe a travaille.

## 20. Modification pendant evaluation

Le sujet indique qu'une petite modification peut etre demandee pendant
l'evaluation.

Pour s'y preparer :

- garder un code lisible ;
- eviter les fonctions enormes ;
- documenter les formats importants ;
- savoir ou se trouvent les routes, events, composants et schemas ;
- savoir lancer les tests ou refaire un test manuel ;
- s'entrainer a modifier une petite partie sans casser le reste.

## 21. Checklists rapides

### Avant de commencer une tache

- [ ] l'issue est claire ;
- [ ] le resultat attendu est compris ;
- [ ] les dependances sont connues ;
- [ ] le test manuel est defini ;
- [ ] la branche est creee.

### Avant de demander une review

- [ ] le code demarre ;
- [ ] le diff est relu ;
- [ ] aucun secret n'est present ;
- [ ] la feature est testee ;
- [ ] l'issue est mise a jour ;
- [ ] les limites sont notees.

### Avant de merger

- [ ] la feature importante a ete relue ou montree a l'equipe ;
- [ ] les conflits sont resolus ;
- [ ] le parcours principal fonctionne ;
- [ ] les routes/events/docs sont a jour ;
- [ ] la branche principale ne sera pas cassee volontairement.

### Avant une demo

- [ ] lancer le projet depuis zero ;
- [ ] connecter un utilisateur ;
- [ ] rejoindre une room ;
- [ ] envoyer un message ;
- [ ] lancer une partie ;
- [ ] terminer une partie ;
- [ ] voir score/history/leaderboard ;
- [ ] verifier la console Chrome ;
- [ ] verifier Privacy Policy et Terms of Service ;
- [ ] verifier que chaque membre sait quoi expliquer.

## 22. Regle finale

Une feature n'est pas vraiment terminee si :

- une seule personne la comprend ;
- personne ne sait la tester ;
- elle n'est pas reliee a une issue ;
- elle casse le parcours principal ;
- elle n'est pas explicable en evaluation.

Le projet doit avancer comme une equipe : code visible, decisions visibles,
responsabilites visibles, comprehension partagee.
