---
layout: post
title: "Javascript : Single-threaded et asynchrone"
categories: [JavaScript, Internals]
description: Comment Javascript fait pour être à la fois single-threaded et asynchrone.
redirect_from:
    - /posts/javascript-single-threaded-et-asynchrone/
---

Javascript est single-threaded, c'est quelque chose qui est rentré dans la tête de la plupart des développeurs front-end. Cependant ce à quoi on ne réfléchit pas assez c'est : comment est-il possible d'être à la fois single-threaded et de gérer du code asynchrone.

##Les conséquences du thread unique

Bon c'est bien beau de savoir que Javascript ne dispose que d'un seul thread mais commençons par voir ce que ça implique ?

Les bons côtés :

- jamais d'accès concurrents aux données ;
- Le debuggage est nettement simplifié.

Les mauvais côtés :

- Vous pouvez bloquer votre application avec du code un peu trop gourmand ;
- On ne peut pas faire confiance aux timers (setTimeout et setInterval) qui ont une précision approximative.

Pour se convaincre à la fois des bons et des mauvais côtés voici un petit bout de code qui va l'illustrer.
Considérez le code suivant :

```javascript
var a = "start";

window.setTimeout(function () {
    a = "done";
    importantThingToDo();
    console.log(a); // -> "done"
}, 100);

timeConsumingFunction();

console.log(a); // -> "start"
```

Dans ce code, je suis sûr et certain que ma console affichera "start" en premier même si l'exécution de timeConsumingFunction() prend bien plus de 100ms.
Si setTimeout avait créé un nouveau thread, je n'aurais pas pu prédire si ma console allait afficher "start" puis "done" ou le contraire.
Autre chose à prendre en compte, si l'exécution de timeConsumingFunction prend plus que 100ms, importantThingToDo sera retardée. Si vous ajoutez à ça des interactions utilisateurs, vous pourrez encore retarder un peu son exécution.

##Les timers

Les timers (setTimeout et setInterval) sont nos outils pour faire du code asynchrone avec Javascript. On se donnerait presque l'impression qu'on créé des threads et pourtant ...
En réalité il ne faut pas voir les timers comme des fonctions asynchrones mais plutôt comme des gestionnaires de queue. Et oui, la fonction principale des timers est d'empiler des fonctions qui seront exécutées séquentiellement et au plus tôt n millisecondes plus tard.
Le paramètre de temps prend alors une signification un peu différente de celle à laquelle on pourrait penser. Au lieu de :

- "Exécute cette fonction dans n millisecondes"

il faut plutôt avoir en tête :

- "Dès que tu es dispo après n millisecondes, exécute cette fonction"

D'où la faible fiabilité des timers Javascript.

Pour une explication un peu plus complète sur le fonctionnement des timers de Javascript, je vous invite à lire l'article [How JavaScript Timers Work](http://ejohn.org/blog/how-javascript-timers-work/) de John Resig dont je me suis beaucoup inspiré pour mon article.

##Les événements, le secret des opérations asynchrones

Vous avez dû souvent aussi entendre que Javascript était Event Driven et en effet, si vous y regardez de plus près, l'exécution de code Javascript se fait toujours dans le cadre d'un événement envoyé par le navigateur (load, click, mouseover, progress ...). Ensuite c'est à vous, développeur, de définir ce qu'il va se passer en fonction de ces événements.

Je disais dans la section sur les timers que les timers empilaient des fonctions Javascript, en réalité c'est le navigateur qui s'occupe de cette tâche. Le navigateur va utiliser un timer interne (qui lui est précis) et enregistrer votre callback sur l'événement de fin de timer. Au bout des n que vous aurez définit, il va ajouter dans la pile d'exécution du moteur Javascript la fonction que vous aurez affecter au timer. Dès que le moteur Javascript sera libre, il s'occupera alors de votre callback.

Ce schéma se retrouve pour tous les événements qui se produisent dans le navigateur. Prenons l'exemple du clic, voici ce qui se passe quand l'utilisateur clique sur un élément :

- le navigateur intercepte le clic ;
- il vérifie les listeners que vous aurez définis ;
- il les ajoute dans la pile d'exécution de Javascript ;
- quand le moteur est disponible, il exécute chacun des listeners ;
- à la fin de chaque listener le navigateur joue l'action par défaut (par exemple naviguer lors d'un clic sur un lien) si aucun des listeners n'a joué preventDefault() sur l'événement.

Toutes les actions asynchrones de Javascript fonctionnent sur ce modèle. Par exemple les requêtes XMLHttpRequest laissent au navigateur le soin de faire la requête puis de prévenir le moteur JS une fois que la requête est finie. Seulement contrairement aux timers, vous ne pourrez jamais prédire quand une requête AJAX sera finie. Par exemple le code suivant :

```javascript
var request = new XMLHttpRequest();
request.open('GET', '/url');
request.onload = function () {
    console.log('request done');
};
request.send();

window.setTimeout(function () {
    console.log('timeout ended');
}, 10);
```

Vous ne pourrez pas dire si votre console va vous afficher "request done" puis "timeout ended" ou le contraire puisque vous n'avez aucune idée de quand l'événement load sera lancé.

##Conclusion

Je pense qu'il est important de bien comprendre le fonctionnement interne des technologies que nous utilisons afin de bien les utiliser. Pour Javascript, S'il y a bien quelque chose à retenir c'est que Javascript n'éxécute qu'un seul morceau de code à la fois ! En gardant bien ça en tête vous verrez que certains comportements que vous ne vous expliquiez pas deviendrons clair.

Et juste pour voir si vous avez bien compris, que donnera l'exécution de ce bout de code ? (Pas le droit d'utiliser sa console hein ;) )

```javascript
var a = '',
    i;

window.setTimeout(function () {
    a += 'Batman';
    console.log(a);
}, 0);

for (i = 0; i < 15; i ++) {
    a += 'nan ';
}
console.log(a);
```

NB : Sachez tout de même qu'il existe maintenant les [web workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers) qui permettent de créer des threads sur lesquels vous avez la main.
