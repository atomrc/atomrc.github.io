---
layout: post
title: Optimiser son code Javascript
categories: [JavaScript, Code, Bonnes Pratiques]
description: "Javascript a été prévu pour être un langage très simple d'accès au détriment de ses performances. C'est donc a vous de faire quelques efforts pour avoir un code optimisé"
---

Javascript avait initialement été prévu pour être très facile d'accès. Seulement sa permissivité entraine également une réduction des performances globales et surtout la possibilité de faire du code très difficile à maintenir. Voila donc quelques conseils simples pour augmenter la lisibilité et la fiabilité de votre code et gagner un peu en performances.

##"use strict";

Si vous avez déjà lu le code de certaines librairies Javascript vous avez surement rencontré le `"use strict"`;. C'est le premier réflexe à avoir quand vous commencez un nouveau projet Javascript puisqu'il va dire au navigateur de ne pas laisser passer certaines aberrations normalement possibles avec Javascript.

###Activer le mode strict

Pour l'activer, rien de plus simple, il vous suffit de mettre le code suivant dans vos fichier js :

```javascript
"use strict";
```

Prudence car le `"use strict"` s'applique à tout le code qui est de même niveau d'imbrication ou inférieur. Ça veut dire que si vous le mettez directement à la racine d'un fichier js, il s'appliquera à tous les autres fichiers qui seront inclus pas la suite (librairies, autres fichiers à vous ...). Or ces fichiers ne respectent pas toujours le mode strict et engendreront des erreurs sur votre application.
Il est donc préférable de placer le `"use strict"` ; à l'intérieur des fonctions que vous écrivez.


```javascript
/* non strict */

function doSomething(params) {
    "use strict";
    /* strict */
}

/* non strict */
```

A quoi ça sert ?

Le `"use strict"`; va vous permettre de ne pas faire d'erreurs classiques et normalement autorisées par Javascript. Dans le mode strict, le navigateur va lancer des exceptions s'il rencontre du code non conforme. Voila ce que pourra vous éviter le mode strict :

- les variables déclarées sans le mot clé var (qui s'ajouteraient alors à l'objet global window);
- l'utilisation des instructions `eval` et `with` ;
- la déclaration d'un objet avec plusieurs fois la même propriété définie.


Pour vraiment tout savoir sur le `"use strict"`, je vous suggère de lire absolument l'article "[strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode)" du Mozilla Developer Network sur le sujet !

##Le point-virgule !

Voila une habitude qu'il faut prendre très vite quand on fait du Javascript : mettre un point-virgule à la fin de chaque instruction !

###Pourquoi c'est (très) important ?

Javascript est tellement permissif, qu'il permet de ne pas mettre les ';'. Seulement, lorsque votre code n'a pas de ';', le moteur Javascript n'a aucun moyen de distinguer les différentes instructions ! Seulement il y arrive tout de même, alors comment fait-il ? En réalité, la solution est simple : quand il détecte une erreur de compilation, il ajoute des points virgules un peu partout jusqu'à ce qu'il trouve des instructions valides (aie). S'il ne trouve pas d'instruction js valide alors il lance une exception.

Je pense que vous voyez le gouffre à performances que cette fonctionnalité engendre. C'est un peu comme si je vous donnais un livre sans aucune ponctuation !

Bien sur le moteur JS est assez intelligent pour ne pas tester toutes les combinaisons possibles de placement de ';' et utilise des heuristiques pour essayer de deviner où pourraient être les points virgules (comme vous feriez en lisant mon cadeau empoisonné).

##On laisse l'objet global window tranquille 

Vous le savez peut-être l'objet window est l'objet racine de tout le code Javascript (uniquement pour une application navigateur bien sûr). Pour garder votre application organisée et lisible par un autre développeur, il est préférable de ne pas surcharger cet objet. Pour cela, sachez que tout ce que vous définissez à la racine de vos fichiers js sera ajouté à l'objet window. Voila un exemple plus concret :

```javascript
var obj = "test";

function test() {
    console.log(window.obj);
}

window.test(); // -> "test"
```

Dans l'exemple, l'objet test est défini via le mot clé var mais tout de même ajouté à window.

Pour éviter de polluer l'objet global, il est souvent conseillé d'englober tout votre code dans une fonction qui sera exécutée immédiatement.

```javascript
(function () { 
    "use strict";
    var t = "value";
    console.log(t); //-> "value"

    /* code */

}());

console.log(t) //-> undefined
```

Ainsi les variables que vous définirez dans le scope de cette fonction ne s'ajouteront pas au window. De cette façon vous maitrisez parfaitement ce que vous décidez de rendre global ou non. Ce schéma de construction s'appelle le Module Pattern. (merci @jrm2k6  pour la précision)

Si vous avez besoin d'une référence partagée pour toute l'application, vous n'avez qu'a définir une variable dans le scope global puis de la lire/écrire dans le code de votre application.


```javascript
var debug = true;

(function () { 
    "use strict";

    if (debug) {
        console.log('debug'); //-> "debug"
    }

    /* code */

}());

console.log(debug) //-> true
```

Un autre confort que vous apporte la fonction wrapper est de pouvoir la portée du `"use strict"` sans avoir à le mettre dans chaque fonction que vous définissez. Tout ce que vous coderez dans le wrapper sera considéré strict et tout le reste non.

##Injection de dépendances

L'injection de dépendances est une bonne pratique qui est utilisée dans bon nombre de frameworks (je pense par exemple à Symfony 2 pour PHP et AngularJS pour Javascript) et qui permet de rendre votre application très faiblement dépendante du contexte dans lequel elle s'exécute. La fonction wrapper que nous avons vu au dessus, va nous permettre de faire de l'injection de dépendances. Par exemple admettons que dans le code de votre application, vous ayez besoin de l'objet document, nous allons pouvoir injecter cet objet dans le wrapper de votre code.


```javascript
(function (doc) { 
    "use strict";

     console.log(doc.title); //-> "Optimiser son code Javascript"

    /* code */

}(window.document));
```

Ainsi, si un jour vous décidez de créer un objet qui a le même prototype que document (pensez à un objet mocké pour les tests par exemple), vous n'avez qu'a changer le paramètre de la fonction wrapper. Tout le reste du code utilisera alors le nouvel objet sans que vous n'ayez rien d'autre à changer !

L'autre intérêt, spécifique au Javascript, va se trouver dans la minification de votre code. Si vous utilisez directement les objets du window, le compilateur ne pourra pas les réduire. En revanche, avec l'injection de dépendances, vous créez une référence (vers un objet global) qui peut être entièrement renommée par le compilateur. La version compilée du code précédent donnera alors :


```javascript
(function(d){"use strict";console.log(d.title);}(window.document));
```

##Connaitre Javascript

Bon oui je sais ce point parait trivial, et pourtant, c'est le plus important ! C'est un point qui est valable pour n'importe quel langage dans lequel vous vous lancez. Vous mettrez peut-être 30min à comprendre la syntaxe du langage (faire des boucles, des conditions ...), quelques heures à installer et comprendre l'environnement d'exécution (compilateur/interpréteur) et quelques autres heures à connaitre les bases du langage (comment déclarer une fonction, par où commence l’exécution de l'application).

Or connaitre un langage, ce n'est pas que ça, c'est aussi connaitre toutes les API/fonctions embarquées/subtilités qui sont inclues dedans.

Prenons l'exemple de l'`Array`. La plupart des développeurs, quand ils voudront faire une opération sur un tableau, vont passer par une boucle for. Alors qu'une très grande partie des traitements que l'on pourrait vouloir faire sur un tableau sont déjà pensées et implémentées dans Javascript.

Voici une fonction (naive) qui indique si un élément est dans un tableau :

```javascript
function hasValue (array, value) {
    var i = 0,
        length = array.length;
    for (i = 0; i < lenght; i++) {
        if (i === value) {
            return true;
        }
    }
    return false;
}

var t = [1, 2, 3, 4];
hasValue(t, 3); // -> true
hasValue(t, 5); // -> false
```

Et sa version simplifiée :

```javascript
function hasValue (array, value) {
    return array.indexOf(value) !== -1;
}

var t = [1, 2, 3, 4];
hasValue(t, 3); // -> true
hasValue(t, 5); // -> false
```

De façon générale, je vous suggère d'aller systématiquement faire un tour sur les documentations des API que vous utilisées pour en connaitre toutes les possibilités. (Pour Javascript, la documentation w3schools.com est très bien faite et simple d'accès et pour vraiment tout savoir sur Javascript, il n'y a qu'une adresse : developer.mozilla.org).

##tl;dr;

En bref les quelques bonne habitudes à prendre quand vous développez en Javascript :

- utiliser le mode strict (`'use strict'`) ;
- ajouter des points-virgules à la fin de chaque instruction ;
- ne mettre que l’essentiel dans l'objet window ;
- injecter sois même les objets dont le code a besoin ;
- utiliser le langage dans son intégralité.

Ensuite il ne vous reste plus qu'a coder ;)
