---
title: "Un micro compilateur de directives"
tags: [JavaScript]
excerpt: Un compilateur ultra light pour compiler des directives
lang: fr
date: 2014-12-09
---
Comme j'aime bien l'approche `directive` d'AngularJS mais que, bien souvent, je n'ai pas besoin d'une machine de guerre comme ça pour mes projets perso, je me suis construit un micro compilateur de directives maison.

Pas de notions de scopes ni rien de bien funky ici, mais simplement une méthode agréable pour organiser son code.

Voila le code et je vous explique l'idée juste après ;) 


Comme vous pouvez voir le code est vraiment tout petit mais permet de factoriser le code par la suite.  
L'idée est surtout de bien séparer le code qui va initialiser vos directives du code qui va s'occuper de récupérer vos éléments HTML correspondants.

Un code d'exemple serait par exemple : 

```javascript
var directives = {
    "#id-selector": function (element) {
        //init the directive on the element
    },

    "[data-awesome-directive]": function (element) {
        //init the directive on the element
    }
};

compile(directives, document);
```

A la limite vous pouvez exporter vos directives dans un fichier séparé et faire simplement dans votre fichier principal :

```javascript
var directives = require("./directives"); //CommonJS syntax

$(function () {
    compile(directives, document);
});
```

Et voila :)

