---
title: "Regex : tips and tricks"
tags: [regex]
excerpt: Petites astuces utiles avec les regex
lang: fr
date: 2014-09-05
---

Allez comme je sais que vous adorez les Expressions Régulières, voila quelques tricks sympas :).  
**Attention, ces techniques ne sont pas disponibles sur tous les moteurs d'expressions régulières**. Pour savoir si les astuces dont je parle dans cet article sont disponibles dans votre langage préféré, je vous invite à consulter ce tableau [Comparison of Regular Expression engines](http://en.wikipedia.org/wiki/Comparison_of_regular_expression_engines).

## la répétition "ungreedy"

Par défault la répétition va essayer de matcher le plus de caractères possibles. Par exemple (en JavaScript) :

```javascript
var reg = /<.*>/,
    str = "a piece of html: <html><head></head></html>";

console.log(str.match(reg)[0]);
//print : "<html><head></head></html>"
```

Mais souvent vous voulez limiter la portée de votre répétition pour ne matcher que **la plus petite chaine**. Dans ce cas là, on va utiliser la répétition "ungreedy" en utilisant le symbole `?` après la répétition. Ce qui nous donne donc : 

```javascript
var reg = /<.*?>/,
    str = "a piece of html: <html><head></head></html>";

console.log(str.match(reg)[0]);
//print : "<html>"
```

Une autre solution pour arriver à ce résultat serait : 

```javascript
var reg = /<[^>]*>/;
```
Moins sexy tout de même :)

Vous pouvez utiliser cette astuce avec tous les types de répétitions (le `*`, le `+`, les `{.,.}` et le `?`).

## le lookahead

Parfois, avez besoin de faire des vérifications dans votre chaine de caractères, sans pour autant vous déplacer dedans.  
Exemple typique, vérifier que différentes conditions sont présentes dans la chaine, sans savoir dans quel ordre elles seront.  
Admettons que vous voulez trouver toutes les phrases ou apparaissent à la fois `Felix` et `stratosphere` dans la chaîne suivante :  

```
I heard Felix is going to jump from the stratosphere.  
I know he's going to do it.  
Felix is the best.  
The stratosphere isn't far enough for Felix.
```

On va alors utiliser un lookahead pour vérifier que les mots `Felix` et  `stratosphere` sont présents dans la chaine sans faire attention à leur position. Pour cela il serait idéal **de lire la chaine mais sans ce déplacer dedans** ! C'est justement le but du lookahead qui permet de simplement regarder sans faire avancer le pointeur de lecture de votre regex.

L'idée est donc d'aller regarder si `stratosphere` est dans la chaine, puis si `Felix` est dans cette même chaine (en partant toujours du début) et si ces deux conditions sont réunies alors commencer le matching.

Le lookahead (positif) s'écrit `(?=regex)` (il existe également le lookup négatif qui cherche quelque chose qui ne doit pas exister qui s'écrit `(?!regex)`)

Voila la solution au problème précédent (toujours en JavaScript :)) :

```javascript
var reg = /(?=.*stratosphere)(?=.*Felix).*?\./g;
    str = "I heard Felix is going to jump from the stratosphere.\n I know he's going to do it.\n Felix is the best.\n The stratosphere isn't far enough for Felix.";

console.log(str.match(reg)); //[ "I heard Felix is going to jump from the stratosphere.", " The stratosphere isn't far enough for Felix." ]
```

Une solution possible sans utiliser les lookahead serait : 

```javascript
var reg = /.*(Felix.*stratosphere|stratosphere.*Felix).*/g;
```

Vous saisissez l'idée : on vérifie que on trouve :

- soit `Felix` puis `stratosphere` ;
- soit `stratosphere` puis `Felix`.

Encore une fois, un petit manque de sexy :)

Un bon use case de cette technique serait par exemple de **vérifier qu'un password dispose d'au moins une majuscule et d'un digit**. (Je vous laisse ça en exercice ;))

Voila n'hésitez pas à laisser d'autres techniques pratiques que vous utilisez avec nos chères amies les `regex`.
