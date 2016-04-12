---
layout: post
title: Bamboo et les tests Atoum
categories: [php, atoum, bamboo, integration continue]
description: Configurer votre serveur Bamboo pour jouer et interpréter vos tests Atoum
---

Chez [DoYouBuzz](http://www.doyoubuzz.com) nous utilisons [Atoum](http://docs.atoum.org/fr/) pour tous nos tests unitaires PHP. Je pense qu'il n'est pas nécessaire de vous rappeler l'interêts des tests unitaires. 

Ecrire des tests c'est très bien, mais les jouer régulièrement, c'est mieux :) C'est pourquoi, nous avons mis en place un [serveur d'intégration continue chez DoYouBuzz](/p/integration-continue-avec-bamboo/).

Comme Bamboo semble plutôt avoir été pensé pour le monde Java, le seul wrapper de tests disponible pour PHP est PHPUnit. Il va donc nous falloir faire notre propre script de lancement de tests Atoum.

## TLDR
Le script à exécuter pour lancer les tests Atoum dans Bamboo : 

```bash
php  bin/atoum -c path/to/config.php -d path/to/tests/units 2> /dev/null; exit 0;
```

La config d'Atoum pour générer un rapport au format xUnit :

```php
<?php
 
//...
 
/*
 * Xunit report
 */
$xunit = new atoum\reports\asynchronous\xunit();
$runner->addReport($xunit);
 
/*
 * Xunit writer
 */
$writer = new atoum\writers\file('/chemin/vers/le/rapport/atoum.xunit.xml');
$xunit->addWriter($writer);
```


## Excécution des tests Atoum

Pour ça, on va configurer notre projet Bamboo pour lui ajouter un nouveau "Stage". (pour bien comprendre les différences entre "Project", "Plan", "Stage", "Job" et "Task" je vous laisse lire la [documentation de Bamboo sur le sujet](https://confluence.atlassian.com/display/BAMBOO/Configuring+plans)).

C'est ensuite dans un Job qu'on va lancer les tests. Pour ça, on ajoute à notre Job une nouvelle Task de type "script" que l'on peut appeler "Atoum tests" par exemple.

![add-script-task](http://i.imgur.com/ZTJmWyA.png)

Voila le contenu du script en question : 

```bash
php  bin/atoum -c path/to/config.php -d path/to/tests/units 2> /dev/null; exit 0;
```

(protip : vous pouvez aussi ajouter un fichier script dans le repository de votre projet et donner à Bamboo le chemin vers le fichier à jouer.)

Je pense que la première partie du script est facilement compréhensible, c'est tout bonnement le lancement des tests. La seconde partie du script (`2> /dev/null; exit 0;`) est là pour que, quelque soit le résultats des tests, le script ne renvoie pas de code d'erreur. Pour ça, on redirige la sortie d'erreur sur `/dev/null` puis on indique que l’exécution du script a été un succès (`exit 0;`).

En réalité, quand vous ajouter un script comme "Task" de Bamboo, Bamboo s'attend à recevoir un code de succès après ’exécution du script. Dans le cas contraire, le build s'arrête et est considéré comme un "fail". Aucune des "Task" qui suivent ne seront jouées. Aussi si vos tests échouent, ce que vous aurez prévu ensuite ne sera pas joué et vous n'aurez pas non plus le bénéfice du rapport d'erreur Atoum.

## Génération et interprétation du rapport de test

Bamboo vous permet d'ajouter un ou plusieurs rapports de tests qui seront interprétés pendant un "Job".

Pour générer un rapport au format xUnit avec Atoum, il vous suffit d'ajouter ces lignes dans votre fichier de configuration (code issu de la [documentation Atoum](http://docs.atoum.org/fr/chapitre4.html#Etape-1-Ajout-d-un-rapport-xUnit-a-la-configuration-atoum))

```php
<?php
 
//...
 
/*
 * Xunit report
 */
$xunit = new atoum\reports\asynchronous\xunit();
$runner->addReport($xunit);
 
/*
 * Xunit writer
 */
$writer = new atoum\writers\file('/chemin/vers/le/rapport/atoum.xunit.xml');
$xunit->addWriter($writer);
```

Ensuite, dans Bamboo, on va rajouter un parser pour le rapport qui sera généré à chaque exécution des tests Atoum. On va donc ajouter une nouvelle "Task" de type "JUnit Parser" : 

![JUnit parser Bamboo](http://i.imgur.com/IdR8Ieq.png)

Le plus simple est de faire un répertoire dans lequel on va mettre tous les rapports de tests de tous nos différents frameworks de test pour que Bamboo les interprètes tous d'un coup. On va donc mettre, dans le champ "Specify custom results directories" `/chemin/vers/le/rapport/*.xunit.xml`

Ainsi tous les rapports de tests avec l'extension `.xunit.xml` qui seront ajoutés au répertoire `/chemin/vers/le/rapport` seront interprétés par Bamboo.

## Pour aller plus loin

Vous pouvez demander à Atoum de générer un rapport de couverture de code à la fin de vos tests. Bamboo est tout à fait capable d'interpréter ce rapport. malheureusement, je n'ai pas vraiment pu explorer cette piste à fond puisque une fois l'extension php `xdebug` installée sur notre serveur, les tests utilisent trop de mémoire sur notre instance micro Amazon qui bloque le build en cours côté Bamboo.
