---
title: "Quelques questions courantes avec Flux"
categories: [ReactJS, Flux]
description: Les quelques questions que je me suis posé en utilisant Flux
---

Lors de ma découverte de Flux, je me suis posé un certain nombre de questions. Je voudrais vous les exposer ici, pas simplement parce que vous risquez de vous les poser mais surtout parce que les réponses mettent en valeur les principes de Flux.

## Où faire mes requêtes AJAX ?

Réponse courte : dans les créateurs d'actions.

Explication : On pourrait penser que les stores sont responsables des requêtes AJAX, seulement la doc de Flux nous dit que les stores doivent être synchrones. Donc à partir de là on devrait accepter que l'AJAX ne se fait pas dans les stores, mais allons un peu plus loin pour en être complétement convaincu.  

On va raisoner par l'absurde pour répondre à cette question. Flux nous dit que les stores représentent un état de l'application à l'instant `t`. Si on garde en tête qu'un changement d'état de votre application est en réalité une fonction qui prend en paramètres l'état `t` et une action. Admettons donc qu'une action déclenche une requête AJAX dans l'un de vos stores. Au moment du dispatch de l'action, les données du store sont dans un certain état et changent une fois la requête terminée. Or il n'y a pas eu de nouvelle action déclenchée au moment du retour de la requête donc votre application n'a pas changée d'état alors que les données de votre store si. Ce qui veut dire que à l'instant `t` de l'application votre store peut être dans deux états différents, ce qui est incohérent avec le postulat de base.

## Comment nommer mes actions ?

Réponse courte : il faut se poser la question « Que vient-il de se passer sur mon application ? »

Explication : Il faut voire les actions comme des éléments stupides. elles sont là pour informer de ce qu'il se passe et, en aucun cas, décider de ce qu'il faut faire quand quelque chose se produit. Il faut considérer qu'elles ne connaissent rien de l'application dans laquelle elles évoluent et n'ont aucune idée de ce qu'il va se passer quand elle vont émettre un évènement.

Les actions doivent donc pas ressembler à `SHOW_TODOS` mais plutôt `TODOS_RECEIVED`. De manière générale **construire ses noms d'actions au passé** aide ;)

## Comment choisir entre un composant statefull ou un nouveau store ?

La réponse par défaut est : faites un store. Selon mon opinion, le seul cas de figure ou un composant statefull est envisageable serait pour un composant très gérénique qui n'a aucune logique métier liée à votre application et que vous pouriez utiliser sur un projet qui n'a rien à voir.

Par exemple, si vous faites un date picker générique, à mon sens il est plutôt conseillé de faire un composant statefull. En revanche le composant métier qui utilisera votre date picker devra avoir son store.

Le point faible de cette réponse est qu'elle rentre en contradiction avec la réponse à la première question. A l'ouverture de votre date picker l'état change visuellement sans qu'il y ai eu changement d'état de l'application.  
On peut répondre à ça que ça n'est pas un changement d'état de l'application puisque les objets métier n'ont pas changés. Au même titre qu'on ne stocke pas dans un store l'état du scroll du user ou encore la position de sa souris.

## À vous
Bref voila les quelques questions qui m'ont fait réfléchir en me penchant sur Flux. J'espère qu'elles vous seront utiles et qu'elles vous permettrons de mieux penser en Flux.  
N'hésitez pas à partager les questions qui vont ont fait cogiter et à rebondir sur les réponses que j'apporte ici.

A bon entendeur ;)
