---
title: "Penser comme Vim"
categories: [vim, code]
description: Comprendre la philosophie de Vim pour penser comme lui
---

Ca fait maintenant 3 ans que je n'utilise plus que Vim comme éditeur de textes. Ca fait aussi longtemps que je pensais écrire un article dessus et, allez, aujourd'hui, je me lance :)

## Pourquoi j'adore Vim

Bon soyons franc, je pense que le premier contact avec Vim ça se passe souvent comme ça :

- "Outch ! Qu'est ce que je dois faire de ça moi ?" ;
- "Oh bordel, on ne peut pas éditer ! si j'avais voulu lancer `less` j'aurais tapé `less` !" ;
- et après quelques minutes de rage contenue, le fameux "Putain comment on quitte ce bousin !".

![nothing to do here](http://i.imgur.com/y0TwyKxl.png)

Après cette expérience, il y a deux types de personnes, les `apt-get purge vim` et ceux qui se disent "ça ressemble à un défi pour moi !" (et qui ont un peu de temps devant eux :) ).

Admettons le, il faut être un peu maso pour relancer la commande `vim` :). Personnellement j'adore les défis, je me suis donc rangé dans la seconde catégorie de personnes.

Contrairement à beaucoup d'IDE qui vous donnent accès à toutes les commandes possibles à portée de souris, Vim vous parachute directement à poil en pleine jungle. Mais c'est là que vous allez progresser le plus. Vous allez devoir beaucoup mobiliser votre mémoire et faire un gros effort de compréhension/adaptation avant de pouvoir vous faire plaisir avec Vim.

Quand vous commencerez à maîtriser la bête, vous ne vous direz pas que vous avez trouvé un éditeur qui défonce, mais plutôt que vous êtes un demi-dieux de l'édition de code. Après tout c'est peut-être simplement ça que j'aime dans Vim, il flatte tout simplement mon égo !

## Gardons les pieds sur terre

Voila quelques arguments un peu plus formels en faveur de Vim :

- Il est quasi universel (installé par défaut sur la majorité des systèmes UNIX) ;
- Il est parfait pour l'édition sur un serveur distant ;
- Il consomme très peu de ressources ;
- Il est facilement extensible ;
- Il est très facilement personnalisable ;
- Il vous aboli complètement du dictat de la souris ;
- Pas d'interface graphique qui vous distrait, simplement votre code (une belle occasion de [faire la part belle au code](/p/faire-la-part-belle-au-code/)) ;
- Vous pouvez exécuter n'importe quelle commande `bash` directement depuis Vim.

Vous remarquerez que je ne parle pas ici d'amélioration de votre productivité (comme certains peuvent l'affirmer) parce que je ne pense vraiment pas que Vim y change grand chose. Certes vous gagnez un peu de temps en vous libérant de votre souris. Cependant, face aux temps de compilation / rechargements de page / temps de réflexion / pauses café ... Je ne pense vraiment pas que ça soit significatif.

## Comprendre Vim

Il y a deux choses à avoir en tête quand vous utilisez Vim : il y a **plusieurs états** et **les commandes sont une suite d'instructions atomiques**.

### Les états

Dans Vim, il y a 3 états distincts : l'**édition** (le mode `normal`), l'**insertion** (le mode `insert`) et le **visuel** (le mode `visual`).

`Insert`. Le mode insertion, est le plus facile à comprendre. C'est en fait le mode par défaut de la majorité des éditeurs de textes. En bref, quand vous appuyez sur une touche, le caractère sur cette touche vient s'imprimer dans votre éditeur. Oui c'est ce qu'on attend d'un éditeur de texte et **non ça n'est pas le mode par défaut** ! Pour accéder à ce mode, tapez `i` (entre autres comme `a`, `o` ...) quand vous êtes en mode `normal`.

`Visual`. Le mode visuel va vous permettre de sélectionner du texte (à l'instar de la sélection via la souris) pour en faire ce que vous voulez (le copier, le supprimer, l'encadrer avec des balises ...). Pour mettre Vim en mode `visual` il vous suffit de taper `v` quand vous êtes en mode `normal`.

`Normal`. Le mode normal est le mode qui est de loin le plus intéressant de Vim, et c'est celui par défaut quand vous lancez Vim. C'est avec ce mode que vous allez pouvoir titiller la bête et vous amuser avec les commandes. Il ne faut plus voir votre clavier comme un ensemble de caractères, mais plutôt comme **un ensemble de raccourcis vers des commandes de modification de texte**. Pour l'activer appuyez simplement sur la touche `esc`.

C'est intéressant de constater la séparation de ses trois modes. Alors que la plupart des éditeurs n'ont qu'un seul mode (un mélange des trois de Vim), Vim se laisse une place toute particulière pour les commandes d'édition. En `normal` tout le clavier est entièrement disponible pour accueillir les commandes, je vous laisse imaginer le nombre de possibilités à portées d'un seul caractère ;)

Du fait d'avoir trois modes différents, vous devrez faire une petite gymnastique mentale pour savoir comment reconnaitre en quel mode vous êtes (par exemple le curseur change de style en fonction du mode) ou mieux vous rappeler en quel mode vous avez laissé votre Vim :). Assez souvent, ce sont surtout des automatismes qui se mettent en place tout seul. Par exemple j'ai pris le réflexe de toujours revenir en mode `normal` dès que j'ai finir de taper ce que j'avais en tête.

### Les commandes

Vous l'aurez compris, pour accéder à la toute puissance de Vim (les commandes), il faudra vous mettre en mode `normal`. La clé pour comprendre la suite des opérations est de se rentrer en tête que Vim ne fait que des traitements très atomiques sur votre texte. C'est à vous de combiner les opérations atomiques pour faire ce que vous voulez sur votre texte.

Pour ça vous avez trois types de commandes vim :

- les **déplacements** ;
- les **actions** ;
- les **opérateurs**.

L'idée est donc d'aller combiner les différentes commandes pour faire ce que vous voulez. A part quelques cas particuliers, les commandes sont assez simples à retenir puisque, bien souvent, il s'agit de la première lettre du mot en anglais qui défini l'action faite par la commande. Quelques exemples :

- `d` (pour `delete`) va supprimer du texte ;
- `r` (pour `replace`) va en remplacer ;
- `i` (pour `insert`) va se mettre en mode normal en gardant la position du curseur ;
- `a` (pour `after`) va se mettre en insertion en déplaçant le curseur sur le caractère après sa position actuelle ;
- ...

A partir de ça il ne vous reste plus qu'a faire des phrases pour expliquer à Vim ce que vous voulez faire. `dt.` (pour `delete till .`) va supprimer le texte entre votre curseur et le prochain caractère `.`, `ci"` (pour `change inside "`) va supprimer ce qu'il y a entre les `"` et vous mettre en mode insertion à l'intérieur.

Libre à vous de répéter plusieurs fois une commande en ajoutant un nombre dans votre phrase :

- `d2w` (`delete 2 words`) va supprimer les deux prochains mots ;
- `y2{` (pour `yanc 2 paragraph`) copie les deux prochain paragraphes ;
- `2p` (pour `two pastes`) colle deux fois le contenu du presse papier.

Normalement, si vous avez bien compris ça, vous allez être à même de déchiffrer la fameuse cheat sheet de Vim.

![Vim cheat-sheet](http://i.imgur.com/wjPmWGvl.gif)

Je vous conseille de la garder près de vous surtout au début.

## Les mots de la fin

La philosophie de Vim est de vous économiser un maximum de déplacement de mains sur votre clavier. Aussi, même si c'est un peu dur au début, essayer de vous forcer à utiliser `h`, `j`, `k` et `l` (en mode `normal`) pour vous déplacer caractère par caractère au lieux d'utiliser les flèches (ou pire la souris). Avec l'habitude vous aurez même tendance à ne vous déplacer que par recherche (avec `/`, `?`, `t`, `T`, `f` et `F` article à lire absolument sur le sujet [Learning Vim in 2014: Search](http://benmccormick.org/2014/08/04/learning-vim-in-2014-search/)) ou par positions spéciales comme `$` (fin de la ligne) ou `^` (début de la ligne). C'est aussi l’occasion d'apprendre à bien placer et à bien utiliser tous ses doigts sur le clavier ;)

Vous verrez ensuite que beaucoup de services utilisent ce système de déplacement et de commandes mappées sur des touches (j'ai en tête [Github](http://github.com/), [Gmail](http://gmail.com/) et beaucoup de services Google d'ailleurs, [Bitbucket](https://bitbucket.org/), [Jira](http://jira.com/), [Feedly](http://feedly.com). Essayez donc d'appuyer sur `?` sur ces sites ;) ). Une fois que vous vous serez bien adapté à Vim, vous n'aurez pas de mal à utiliser les raccourcis de ses services.

Même si Vim est très fonctionnel de base sans aucune configuration, il est important que vous personnalisiez votre environnement (coloration syntaxique, espace vs tabs ...). Pour ça je vous invite à aller voir [ma configuration](https://github.com/atomrc/dotfiles/blob/master/vim/.vimrc) pour la mettre à votre sauce.

Un petit conseil, pour vous y mettre doucement est de commencer par le tutoriel proposé par Vim directement. Pour ça tapez simplement `vimtutor` dans votre terminal et laissez vous guider ;)
