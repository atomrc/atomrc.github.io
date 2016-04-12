---
layout: post
title: "Le référencement d'une application Ajax"
description: Donnez aux moteurs de recherche le moyen de crawler votre application ajax
categories: [ajax, seo]
redirect_from:
    - /posts/Single-Page-App-Blog-le-referencement-dune-application-ajax/
notices: [
    "Depuis cet article, je suis complétement revenu sur les urls en hashbang au profit des urls HTML5. Aujourd'hui, je ne vous conseille pas d'utiliser les hashbang. Pour comprendre pourquoi je vous invite à lire l'article [passer des url hashbang aux urls HTML5](/p/passer-des-urls-hashbang-au-html5-pushstate/).",
    "Le blog que vous consultez aujourd'hui n'utilise plus du tout d'AJAX pour charger son conenu."
    ]
---
Quand vous faites un blog, ce que vous allez vouloir garder en tête c'est : comment être bien référencé sur les moteurs de recherche. En temps normal, votre premier travail consisterait à faire : du contenu de qualité, ajouter de la [sémantique](http://googlewebmastercentral.blogspot.fr/2012/07/on-web-semantics.html) à vos articles pour être "compris" des moteurs, optimiser les performances, mettre des liens vers votre sites sur tout le web ...

C'est très bien mais, dans le cas d'une application Ajax, tout cela ne sert strictement à rien si votre contenu n'est pas accessible sans Javascript.

Pour le référencement de mon blog et la rédaction de cet article je me suis très fortement inspiré de l'[article de Google sur le référencement d'une application Ajax](https://developers.google.com/webmasters/ajax-crawling/). Le moteur privilégié dont je parlerai dans cet article sera donc Google, mais ces pratiques sont censées s'appliquer aux principaux moteurs.

## A savoir sur l'indexation (Google)

Vous l'aurez sûrement compris, il y a un hic quand il s'agit d'indexer des applications chargeant les données en Ajax. Le "pourquoi" est simple : les robots des moteurs n'ont pas de moteur Javascript actif. Ils ne pourront donc que lire le HTML brut que le serveur envoie. Or, bien souvent (et c'est le cas de mon blog) le seul HTML pur qu'une application Ajax envoie est le layout global de l'application.
Voila ce que verrait un moteur de recherche qui visiterait n'importe laquelle des pages de mon blog :
mon blog sans JavascriptMon blog chargé en désactivant Javascript
Pas forcément très intéressant pour le référencement, vous me l'accorderez.

Il va donc falloir servir le squelette vide de l'application aux visiteurs et des pages HTML complètes aux robots des moteurs. Ne vous en faites il est possible d'indiquer au robot qui indexe votre application que le contenu est chargé en Ajax.

## Renseigner les robots sur la nature de votre application

Dans l'immédiat, ce qu'on veut c'est pouvoir savoir quand un robot de Google vient demander notre application. Seulement il n'y a pas de moyen vraiment fiable pour savoir si le visiteur actuel est une personne ou un robot. Il y a bien les [user agent](http://fr.wikipedia.org/wiki/User-Agent) mais il changent d'un moteur à l'autre et rien ne vous dit qu'il restera tout le temps le même. Impossible de se baser là dessus.
La solution consiste à indiquer au moteur de recherche que votre application est Ajax pour que quand il interroge votre serveur il lui dise que lui est un robot. Pour faire ça, rien de plus simple, il suffit de mettre un `hashbang` (`#!`) dans vos urls.

Dans votre sitemap.xml, il faudra donc que vos urls contiennent toutes le fameux hashbang (par exemple `/#!/post`) afin que le moteur qui vous indexe sache que les données sont chargées via Ajax.
Le cas particulier de la page d'accueil

Bien souvent l'url de votre page d'accueil ressemble plutôt à 'http://blog.thomasbelin.fr/' que 'http://thomasbelin.fr/#!/'. Seulement le problème ici est que l'url n'indique pas que les données sont chargées en Ajax. Pour cela il vous faudra ajouter dans l'entête de votre layout HTML, la balise méta suivante :

```html
<meta name="fragment" content="!">
```

Ainsi le moteur de recherche qui indexera cette page va refaire un requête vers cette même url mais en considérant qu'il y a un hashbang à la fin.

## Bien répondre au robot d'indexation

A ce niveau, nous savons comment faire savoir au robot que votre application charge ses données en Ajax. Du côté de notre serveur il faut faire deux choses : détecter quand un robot demande l'application et lui répondre en conséquence.

### Détecter le robot ...

Grâce aux urls hachées, le robot va modifier sa façon de requêter votre serveur en remplaçant tous les `#!` par `?_escaped_fragment_=`. Ainsi au lieu d'interroger notre serveur avec `http://thomasbelin.fr/#!/posts` il va le faire avec `http://thomasbelin.fr/?_escaped_fragment_=/posts`
De votre côté, votre serveur recevra donc un paramètre `GET` contenant les paramètres hachés de vos urls. Vous êtes donc sûr que quand la requête contient le paramètre `GET` `_escaped_fragment_` c'est un robot qui vous demande la page. Libre à vous ensuite de faire de l'Url Rewriting ou simplement interpréter le paramètre pour router les demandes du robot.

### ... Et lui répondre

Pour la réponse, rien de plus simple, il suffit de renvoyer une page HTML statique contenant toutes les données qui sont normalement chargées en Ajax par vos clients.

La partie la plus délicate vient ensuite : générer les pages HTML statiques qui seront envoyées au robot d'indexation.

## Générer des snapshots de l'application

Comme on l'a dit plus haut, le robot n'a pas de Javascript activé, il faut donc que toutes les données soient dans la page qu'on envoie du serveur. Cependant ces pages doivent être exactement ce que voit un utilisateur une fois que les données sont chargées ! L'idée va donc être de générer des snapshots de l'application qui seront envoyés aux robots. Pour cela, il y a plusieurs solutions possibles :

- faire une version statique de votre application ;
- faire générer des snapshots par ses visiteurs et automatiser la génération des snapshots via un navigateur headless.

Nous allons mettre de côté la première solution (faire une version statique de l'application) qui demande de coder tout deux fois et devient rapidement impossible à maintenir.

### Faire générer les snapshots par vos visiteurs

Ce n'est pas forcément la solution idéale, mais c'est celle que j'ai adoptée pour mon blog pour une raison simple : je suis limité sur mon serveur et ne peux pas installer de navigateur headless. J'ai donc choisi de faire bosser vos navigateurs à la place :).
Pour cela, et grâce à AngularJS, j'ai placé un callback sur l'événement de chargement d'un état de l'application. Cela donne :

```javascript
$rootScope.$on('$viewContentLoaded', function (event) {
    window.setTimeout(takeSnapshot, 1000);
}
```

Je met également un timeout d'une seconde pour être tout à fait sûr qu'il n'y a pas d'animation en cours lors de l'envoi du snapshot. Et voila donc la fonction qui fait le snapshot et le sauvegarde sur le serveur :

```javascript
var takeSnapshot = function (event) {
    //wrapping the full document in an angular element
    var content = Angular.element(this.window.document.documentElement);
    var url = this.window.document.location.hash.replace('!', '');

    //sending the generated snapshot to the server
    this.http.post('/snapshot', { 'html': content.html(), 'page': url });
}
```

J'envois donc le HTML brut généré par le navigateur client ainsi que la page actuelle au serveur via une requête `POST`.
Côté serveur, il me suffit de sauvegarder le fichier HTML correspondant avec une arborescence liée à la page visitée. De cette façon quand un robot d'indexation demande cette page, mon serveur lui enverra ce fichier HTML.

cette solution, présente deux intérêts particuliers :

- elle est très simple à mettre en place ;
- elle ne consomme (quasiment) aucune ressource côté serveur.

Mais cette solution n'est pas idéale et son principal défaut est que **les clients peuvent tout à fait vous envoyer n'importe quoi** ! Ca peut s'avérer être un très gros problème si jamais vous tombez face à quelqu'un de mal intentionné qui pourra alors envoyer des données fausses à votre serveur (je travaille à sécuriser ce processus. Si vous avez des idées, je suis preneur). En bref, si vous avez les moyens d'utiliser un navigateur headless, faites le !

### Utiliser un navigateur headless

Je ne pourrais que très peu vous parler de cette solution dans la mesure où je n'ai pas pu la mettre en place personnellement. Aussi je vous renvoie vers la [documentation de Google sur ce sujet](https://developers.google.com/webmasters/ajax-crawling/docs/html-snapshot). L'idée principale est que quand un robot demande un état de votre application, le navigateur headless va d'abord s'occuper du chargement de l'état avec ses données puis envoyer le résultat au robot. C'est clairement la solution la plus optimale pour la génération de snapshots.

## Conclusion

Le référencement est une raison pour laquelle le développement d'une application Ajax demande un peu plus d'investissement qu'un site web. Cependant, une fois votre système de snapshots mis en place, vous n'aurez plus jamais à vous en préoccuper et il ne vous restera plus qu'a faire de beaux contenus...
