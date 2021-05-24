---
title: La notion de classe en Javascript
tags: [javascript, internals]
description: JavaScript est un langage orienté objet mais ne dispose pas de classes. Comment donc faire de l'objet sans classes ?
lang: fr
date: 2014-01-29
---

La plupart des langages orientés objet dispose d'un mécanisme simple pour définir les propriétés et méthodes d'un objet : les classes. Seulement JavaScript ne propose pas cette solution pour faire de l'objet mais propose à la place les prototypes.

Avec JavaScript, il va falloir oublier la syntaxe à laquelle on est habitué avec des langages qui proposent des classes (PHP, C++, Java, Ruby ...) et qui groupent toute la définition d'une classe dans un seul bloc de code :

```javascript
function MyClass(_prop) {
    this.prop = _prop;

    this.method1 = function method1(params) {
        /*...*/
    }

    this.method2 = function method2(params) {
        /*...*/
    }

    /* ... */
}
```

A la place il va falloir s'orienter vers une syntaxe où l'on définit un constructeur (une `Function`) d'une part et un prototype (un `Object`) d'autre part.

```javascript
//constructor
function MyClass(_prop) {
    this.prop = _prop;
}

//prototype
MyClass.prototype = {
    method1: function method1() {
        console.log(this.prop);
    },

    method2: function method2() {}
};
```

Maintenant que vous savez déclarer une classe en JavaScript, laissez moi vous expliquer pourquoi la première solution n'est pas bonne. 

Le piège réside dans le fait que la première solution est parfaitement fonctionnelle. Le bout de code suivant fonctionnera sans aucun problème :

```javascript
var t = new MyClass();
t.method1();
t.method2();
```

__Difficile donc de se rendre compte de son erreur__.

Seulement voila avec la première solution, à __chaque fois que vous ferez un `new MyClass()`, le moteur JavaScript va jouer entièrement votre fonction `MyClass`__. Si votre classe `MyClass` grossit un peu et que vous en créez beaucoup d'instances, vous risquez d'encombrer quelque peu la mémoire allouée par votre application. 

Par exemple si vous créez `n` instances de `MyClass` vous aurez également créé `n` fonctions `method1` et `n` fonctions `method2`. Pas vraiment optimal sachant que __seul le bout de code '`this.prop = params;`' est spécifique aux instances de votre "classe"__. 

Le `prototype` est justement là pour vous fournir un espace commun à toutes les instances de votre `Function`. __l'objet `prototype` ne sera créé qu'une et une seule fois pas le moteur JavaScript__. Chaque instance de votre `Function` aura une référence vers cet objet.

Prudence tout de même car étant une référence vers un objet, si vous changez cet objet dans la suite du code, toutes les instances seront impactées par ce changement.

Par exemple :

```javascript
//constructor
function Class() {}

//prototype
Class.prototype = {
    print: function () {
        console.log('ok');
    }
}

var first = new Class();
var second = new Class();

first.print(); // 'ok'
second.print(); // 'ok'

Class.prototype.print = function () {
    console.log('ko');
};

first.print(); // 'ko'
second.print(); // 'ko'
```

Pour bien comprendre comment fonctionnent les prototypes et comment il est possible de faire de l'héritage avec cette propriété, je vous suggère vivement de lire l'article [Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) du [Mozilla Developer Network](https://developer.mozilla.org/en-US/) ou encore leur introduction sur JavaScript et la programmation objet : [Introduction to Object-Oriented JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript).
