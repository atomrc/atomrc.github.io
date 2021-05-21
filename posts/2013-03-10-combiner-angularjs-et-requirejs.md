---
title: "Chargement asynchrone d'AngularJS avec RequireJS"
description: Utiliser AngularJS comme un module AMD avec RequireJS
redirect_from:
    - /posts/Single-Page-App-Blog-combiner-la-puissance-dAngularJS-avec-la-modularisation-de-RequireJS/
categories: [angularjs, requirejs, amd]
lang: fr
---
Lorsque j'ai commencé à utilisé [AngularJS](http://angularjs.org/) pour faire le blog que vous lisez actuellement, j'étais plus que convaincu par les avantages de [RequireJS](http://requirejs.org/). Maintenant je ne peux plus m'en passer et mon premier réflexe quand je commence un projet Javascript est d'importer RequireJS. Seulement, AngularJS n'étant pas défini comme un module et disposant d'un système propre pour définir des modules, j'avais peur de me trouver face à des conflits entre les deux systèmes ou de ne carrément pas réussir à charger AngularJS via RequireJS.
Heureusement RequireJS a tout prévu et l'intégration des deux s'est finalement passé sans problème grâce à deux astuces de RequireJS : shim et deps
## Pourquoi RequireJS ?

Je ne ferai pas ici une présentation complète de RequireJS, mais simplement vous donner les éléments qui m'ont poussés à l'utiliser sur ce projet. La question cachée est surtout : pourquoi utiliser un système de modules au dessus de celui d'AngularJS ?
En réalité les deux systèmes n'ont pas vraiment le même objectif. AngularJS va simplement vous permettre de ne pas polluer l'objet `window` et de garder votre code dans le "namespace" d'Angular. En revanche Angular ne va pas du tout gérer toutes les bibliothèques externes que vous chargez ou encore le chargement des fichiers source. Les bénéfices de RequireJS seront les suivants :

- la modularisation des bibliothèques externes en plus de votre propre code ;
- le chargement des fichiers source de façon asynchrone et en fonction des besoins ;
- l'objet window ne sera quasiment pas sollicité ni pollué ;
- vous n'aurez pas à inclure vos fichiers source dans le layout de votre page, RequireJS va s'occuper de résoudre les dépendances et charger les fichiers correspondants ;
- la minification de vos sources en fonction de vos modules.

## A quoi je veux arriver

Ce que je veux c'est que la seule et unique balise script qui soit dans mon code HTML soit la balise qui inclut RequireJS.

```html
<script src="/js/lib/require.min.js" data-main="/js/main.js"></script>
```

Si j'ai une seule autre balise `<script>` dans mon code HTML ... J'ai perdu !!

## Chargement d'AngularJS via RequireJS

Le premier problème que vous devriez rencontrer est le chargement d'AngularJS avec RequireJS. Il y a deux petits problèmes liés à ce chargement : AngularJS n'est pas défini comme un module et l'initialisation d'Angular ne se lance pas quand il est chargé comme module. Ne vous en faites pas la résolution de ces problèmes est très simple.
AngularJS n'est pas un module

La première chose est que Angular n'est pas [AMD compliant](http://dailyjs.com/2011/12/22/framework/) (cad. il n'est pas prévu pour être chargé de façon modulaire mais pour être ajouté à l'objet window). Beaucoup de bibliothèques ne sont pas encore "AMD compliant" et, aucun problème, RequireJS gère ça à la perfection grâce aux configurations shim.
Notre configuration va donc être la suivante :

```javascript
requirejs.config({
    paths: {
	//path to angularJS file
        angular: '../lib/angular.min'
    },

    shim: {
        angular: {
            init: function () { return angular; }
        },
    }
});
```

Avec ces lignes, on dit à RequireJS où est le fichier d'Angular et que quand on fait appel à Angular, il doit nous renvoyer l'objet angular présent dans l'objet window. Ainsi Angular sera tout de même ajouté à window mais sera utilisé comme un module dans votre code. Autrement dit on accédera jamais à l'objet window.angular directement.

## Lancer manuellement l'initialisation d'AngularJS

Pour bien comprendre ce problème, ayez en tête que RequireJS charge tous les fichiers source de façon asynchrone. Ce qui veut dire que le callback window.onload pourra être appelé avant même que le client ai chargé le premier fichier source. Or AngularJS se sert de cet événement pour lancer son initialisation mais étant chargé après, il ne la lance jamais. Vous devez donc la lancer vous même. Rien de bien compliqué ici :

```javascript
//load the angular library before doing anything
define(['angular'],

    //callback called when angular is loaded 
    function (Angular) {

    //init angular for the module 'blog'
    Angular.bootstrap(window.document, ['blog']);
}
```

## Les modules complémentaires d'Angular

Dans votre projet vous aurez peut-être besoin de [modules complémentaires](http://code.angularjs.org/1.0.5/) pour AngularJS. Dans le cas de mon blog, j'ai eu besoin de ngResource pour interagir avec mon API RESTfull et de ngSanitize. Pour être chargés correctement, ces modules ont besoin que Angular soit définit dans l'objet window. Or RequireJS charge les fichiers de façon asynchrone et vous ne pouvez pas dire si Angular sera bien chargé avant ses modules.
Une fois de plus RequireJS a tout prévu et permet d'indiquer que des modules sont dépendants d'autres. Notre configuration va donc donner ça :

```javascript
requirejs.config({
    paths: {
	//path to angularJS file
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min',
        ngResource: '../lib/angular.resource.min',
    },

    shim: {
        angular: {
            init: function () { return angular; }
        },

        ngSanitize: {
            exports: 'ngSanitize',
	    //dependancies for the ngSanitize module
            deps: ['angular']
        },

        ngResource: {
            exports: 'ngResource',
	    //dependancies for the ngResource module
            deps: ['angular']
        }
    }
});
```

Ainsi lorsque l'on va demander à RequireJS le module ngSanitize, RequireJS va d'abord vérifier si angular est chargé et le charger si jamais ce n'était pas le cas.
En bref

Après avoir passé ces petits obstacles que RequireJS gère à merveille, il ne vous reste plus qu'a vous lancer pleinement dans le développement de votre application AngularJS en gardant toujours à l'esprit de ne jamais ajouter une nouvelle balise `<script>` dans votre code HTML ;)
