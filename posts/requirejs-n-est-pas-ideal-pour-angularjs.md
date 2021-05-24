---
title: "RequireJS n'est pas idéal pour AngularJS"
description: "Utiliser RequireJS plus intelligemment afin de ne pas brider AngularJS"
lang: fr
tags: [javascript, angularjs, requirejs, amd]
date: 2013-04-14
---
Il n'y a pas longtemps, je publiais un article sur la combinaison d'[AngularJS avec RequireJS](/p/combiner-angularjs-et-requirejs/). Depuis, mon blog a connu un certain nombre d'évolutions et tout particulièrement une qui m'a fait revenir sur l'utilisation de RequireJS avec Angular. C'est le passage à des urls HTML5 et la façon dont je chargeais les pages qui m'ont fait voir le problème.

## Ne pas rater le bootstrap d'Angular

Si vous êtes venu sur mon blog entre fin mars et mi avril, vous avez peut-être constaté qu'au premier chargement, la page clignotait une fois. Vous voyiez le contenu une première fois puis il disparaissait pour ré-apparaitre en fondu. La raison de ce scintillement était double : mon serveur envoyait une page complète (non plus une page vide qu'Angular allait remplir) et Angular ne se chargeait qu'après l'affichage de cette page. Pour palier à ce scintillement, je n'avais qu'une seule possibilité : il fallait qu'Angular soit chargé avant le DOM. De cette façon, Angular allait pouvoir cacher les éléments qu'il allait remplir par la suite avec les données brutes du serveur.

## Pas de chargement synchrone avec RequireJS

Après avoir analyser que le problème de scintillement venais du chargement asynchrone d'AngularJS, je me suis dis qu'il devait y avoir un moyen de dire à RequireJS de charger certains scripts de façon synchrone. J'ai donc commencé par regarder les forums puis, ne trouvant rien de bien concret sur le sujet, je allé mettre mon nez dans les sources de RequireJS. Malheureusement, je suis tombé sur [cette ligne](https://github.com/jrburke/requirejs/blob/2.1.11/require.js#L1821) qui a mis fin à tous mes espoirs. C'est le seul endroit du code qui créé une balise script et comme vous pouvez le voir, le paramètre node.async est forcé à true. Aucun moyen donc d'influer sur ce paramètre. Je n'avais donc pas le choix, j'allais devoir ne pas charger AngularJS avec RequireJS

## Vers une utilisation plus intelligente de RequireJS

Attention, ici, il n'est pas question de se débarrasser complètement de RequireJS, mais simplement de ne pas l'utiliser pour tout le code dont je vais avoir besoin dès le chargement de la page. Je vais donc passer d'un head HTML comme ça :

```html
<head>
  <script src="/js/lib/require.min.js" data-main="js/src/main.js"></script>
</head>
```
à un code de ce style :

```javascript
<head>
  <!-- chargement des libraries nécessaires au chargement -->
  <script src="/js/lib/require.min.js"></script>
  <script src="/js/lib/angular.min.js"></script>
  <script src="/js/lib/angular.resource.min.js"></script>
  <script src="/js/lib/angular.sanitize.min.js"></script>

  <!-- chargement du code de l'application  -->
  <script src="/js/src/application.js"></script>
</head>
```

De cette façon, quand la page est envoyée au navigateur, celui-ci va d'abord charger les fichiers Javascript indiqués avant de commencer le traitement du DOM. Angular sera donc présent lorsque le navigateur commencera cette opération. Bon je sais, si vous avez lu [mon article sur AngularJS et RequireJS](/p/combiner-angularjs-et-requirejs/), vous pourrez dire que j'ai perdu :(.

Comme je vous l'ai dit il n'est pas question d'abandonner totalement RequireJS et vous avez pu le voir dans ma nouvelle balise head qu'il est encore chargé sur mon blog. Pour tout vous dire je m'en sert pour charger d'autres bibliothèques externes (RainbowJS pour la coloration syntaxique par exemple), pour les boutons de réseaux sociaux et pour la compilation.

## Conclusion

Après mon retour sur les urls hashbang, voila que je reviens sur la combinaison de RequireJS et AngularJS. Mais ces erreurs sont avant tout à prendre comme une source d'apprentissage et, pour ça, je suis très content d'avoir fait ces erreurs. Alors que je pensais que RequireJS, et plus généralement l'AMD, pouvait se poser comme une sorte de standard de développement pour une application JS, je me suis rendu compte que ce n'est qu'un autre outil parfait pour certains besoin mais clairement inadapté pour d'autres.
J'avais eu l'occassion de discuter avec [@maxdow](https://twitter.com/maxdow) de l'utilité de mettre en place RequireJS avec AngularJS (en rapport avec son article [AngularJs – RequireJs seed](http://maxlab.fr/blog/2013/03/angularjs-requirejs-seed/)). Alors qu'il se posait des questions sur cette association, je la trouvait parfaite. Seulement, à ce moment là, je n'avais pas encore identifié de problème avec. Maintenant si ... 
