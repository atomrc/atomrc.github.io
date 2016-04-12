---
layout: post
title: "Passer des urls hashbang (#!) au HTML5 pushState"
description: "Après avoir fait tout mon blog avec des urls hashbang, pourquoi et comment je suis passé à des urls HTML5."
redirect_from:
    - /posts/single-page-app-blog-passer-des-urls-hashbang-au-html5-pushstate/
categories: [seo, ajax]
---
Mon dernier article sur le [référencement d'une application Ajax](/p/le-referencement-d-une-application-ajax/) s'appuyait entièrement sur les recommandations de Google pour l'indexation d'une application Javascript et notamment le hack du hashbang. Seulement, peu de temps après avoir écrit cet article, je me suis rendu compte que le hasbang n'était pas optimal du tout et entraînait bon nombre de complications (boutons de réseaux sociaux, référencement, lisibilité du code serveur ...). Je vais donc vous présenter ici les raisons pour lesquelles j'ai décidé de revoir complétement mes urls et surtout tout ce que cela implique.

## les #%!°$+!! de problèmes avec le `#!`

La première chose qu'il faut bien comprendre c'est que le hashbang est un affreux hack pour faire croire, d'une part, à votre navigateur qu'il n'a pas changé de page et d'autre part pour faire savoir aux moteurs de recherche que votre application est Ajax. Or, par définition, un hack n'est pas franchement quelque chose de propre. Et en l'occurrence dans notre cas, notre hack va avec son lot de problèmes.

### Les boutons de réseaux sociaux

ce sont les premiers à m'avoir fait réfléchir au passage vers des urls HTML5. Si jusque là j'avais beaucoup de plaisir à explorer le terrain des urls hashbang, j'ai beaucoup déchanté lorsqu'il a s'agit de passer à l'intégration des boutons de partage. J'avais commencé avec Twitter puis Google+ et ce dernier m'a fait complètement abandonner les `#!`.

### Twitter

Tout semblait bien se passer, les tweets se passaient très bien et les liens vers mon blog marchaient sans problème, seulement le compteur de tweets affichait n'importe quoi (de temps en temps 0, de temps en temps le nombre de liens pointant sur la racine du site). Visiblement pas mal de monde a eu ce problème, en témoignent les posts sur le forum de Twitter ici, là ou encore ici. Et malheureusement pas de réponse claire sur la solution à adopter ... Personnellement j'ai essayé avec les urls contenant le `#!` et les urls avec le `_escaped_fragment_`, rien n'a marché correctement.

### Google+

Si le compte des tweets était un peu génant, avec Google+ c'était carrément la cata puisque je ne pouvais même pas partager mon article. Lorsque je cliquais sur le bouton, celui-ci se transformait en ![Google plus of death](http://i.imgur.com/EWN9CTU.png) et j'avais le droit à un beau code d'erreur -32099. Pareil que pour Twitter, j'ai essayé avec les urls `#!` et `_escaped_fragment_`, mais rien à y faire, ça ne marchait pas ! Contrairement à Twitter, je n'ai pas trouvé de commentaire d'utilisateur essayant de mettre un bouton Google+ sur un site Ajax. Il y a bien des choses sur l'erreur -32099 mais en réalité ça n'aide pas beaucoup puisque ça dit juste qu'il y a une erreur sur le serveur...

### Le référencement

Il faut bien l'avouer, le référencement avec des `#!`, ce n'est pas de tout repos. Vous avez constamment un code spécifique aux moteurs de recherche qui tourne sur votre serveur et il est très fastidieux de tester ce que le robot voit en réalité (vous êtes obligé de tester les urls une à une en remplaçant le `#!` et en désactivant Javascript). Je ne m'en rendais pas compte avant, mais en passant à des urls classiques, je remarque que beaucoup de choses se comportent mieux sur l'interface de Google Webmaster. Par exemple, lorsque j'utilisais la fonction "Explorer comme Google" et que je faisais un demande d'ajout des urls testés dans l'index l'état de l'url mettait un temps fou à passer à l'état "URL envoyée pour indexation". Dès que je suis passé à des urls classiques cet état se met à jour instantanément !

### Toutes les petites choses :

- vos urls ne sont pas très jolies ;
- il n'est pas facile de détecter quand le code serveur pour les robots est cassé ;
- votre conscience de bon développeur vous dit que c'est mal d'utiliser un hack.

## Le passage vers les urls HTML5

HTML5 vient avec une quantité phénoménale de fonctionnalités et parmi elles se cache le History API. Et il se trouve qu'il est là précisément pour faire ce que l'on cherche à faire ici : faire une application Ajax avec des urls pour chaque état ! En m'y mettant, j'avais peur que cela implique beaucoup de changements, mais au final tout s'est passé très bien et très rapidement.

Bonne nouvelle par rapport à mon [précédent article sur le référencement](/p/le-referencement-d-une-application-ajax/), nous allons pouvoir utiliser exactement le même code pour les visiteurs que pour les moteurs de recherche. Plus besoin de faire la distinction. De toute façon vous n'avez plus de moyen fiable pour la faire (du moins plus avec les urls). Deuxième bonne nouvelle, vous allez désormais être **compatible avec les visiteurs sans Javascript**.

L'idée est donc de renvoyer, dans tous les cas, le snapshot d'un état de l'application en fonction de l'url demandé. Ensuite les visiteurs qui ont Javascript navigueront en Ajax sur l'application alors que les visiteurs sans Javascript et les moteurs de recherches ne navigueront qu'au travers des snaphots de l'application.

Pour ce qui est de la génération des snapshots je vous laisse consulter mon [article sur le référencement](/p/le-referencement-d-une-application-ajax/).

## Et voila

Les changements techniques pour passer d'une application en urls hashbang à des urls HTML5 sont relativement minimes. Cependant, réalisez bien que en dehors des petits changement dans le code, vous aurez un gros travail à faire auprès des services liés à votre application. Si cela peut vous aider, voila un petit pense bête des choses que j'ai dû changer pour mon blog suite au changement d'urls :

- supprimer toutes les urls `#!` de Google Webmaster ;
- faire la migrations des commentaires Disqus ;
- mettre à jour les liens internes dans les articles ;
- mettre à jour les liens postés sur les réseaux sociaux.

Et bien sur cette liste s'alonge plus vous utilisez de services différents et devient quasiment ingérable si vous attendez trop longtemps avant de faire ce changement d'urls.

## Conclusion

Lorsque j'ai fais mon blog, je connaissais l'existence de l'[History API](https://developer.mozilla.org/en-US/docs/DOM/Manipulating_the_browser_history) mais je voulais vraiment explorer la piste des urls hashbang. Seulement si cette technique est très bien pour le référencement Google (et probablement d'autre) elle l'est beaucoup moins pour tous les réseaux.
Mon seul regret dans cette histoire est de ne pas avoir compris pourquoi mes boutons Twitter et Google+ ne marchaient pas. J'ai tourné le problème dans beaucoup de sens (surement pas tous) sans que cela n'ai changé quoi que ce soit. Ce qui me navre le plus c'est de n'avoir aucune réponse à donner sur cette question. Je ne comprends pas bien comment Google, qui respecte pourtant le hashbang pour le référencement, ne le supporte pas pour son réseau social ... Il est bien sûr possible que mon problème vienne de mon implémentation du hashbang, cependant, depuis que je suis passé aux urls HTML5 tout fonctionne sans aucun problème :) 
