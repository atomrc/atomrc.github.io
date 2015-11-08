---
layout: post
title: "Le guide que j'aurais aimé avoir quand j'ai commencé Flux"
categories: [ReactJS, Flux]
description: Commencer Flux avec la doc officielle n'est pas forcement facile, voila une petite synthèse des grandes idées et concepts de Flux
---

En commençant [Flux](https://facebook.github.io/flux/docs/overview.html#content), j'avoue avoir eu beaucoup de moments de confusion et questions inutiles qui me sont venus à l'esprit. La majorité des questions que je me posais venaient de la confusion qu'il est facile de faire entre la [présentation de Flux](https://facebook.github.io/flux/docs/overview.html#content) et le [Github de Flux](https://github.com/facebook/flux).

Je vous propose donc de revenir un peu sur la source de ma confusion puis de reprendre, avec les idées au clair, les concepts de Flux emsemble.

##Pourquoi j'ai été confus par Flux

La majeure partie de ma confusion venait du fait que je n'avais pas bien compris de quoi la doc traitait.  
Le souci c'est qu'une partie de la doc parle du concept de Flux en montrant des exemple de code (c'est le cas du sempiternel exemple de la TODO list) alors que d'autres parties de la doc parlent de l'[implémentation que Facebook utilise](https://facebook.github.io/flux/docs/dispatcher.html#content) et dont on trouve le code sur Github.

Je n'arrivais pas à voir que Flux n'était pas un framework ni une librairie mais juste un concept. Aussi je prenais la doc comme si c'était la documentation de leur [implémentation de Flux](https://github.com/facebook/flux), or pas uniquement. Seulement, quand vous lisez cette doc dans cet état d'esprit, vous voyez des incohérences partout et vous finissez par vous enerver.

Du coup, pour lire la suite de cet article mettez vous bien en tête que : 

- Flux n'est pas du code mais un concept ;
- les exemples de code ici n'utilisent aucune implémentation de Flux particulière.

Sachez qu'il existe un grand nombre d'implémentations de Flux qui se baladent avec de solides documentations. Je vous invite à consulter ce site qui vous montrera un peu les tendances d'utilisation des différentes implémentations : [Which Flux implementation should I use?](https://github.com/kriasoft/react-starter-kit/issues/22).

##le problème que résout Flux
Dans le modèle MVC classique, vous avez votre modèle (les données brutes) vos contrôleurs (qui passent les données aux vues et qui récupèrent les actions des vues pour mettre à jour le modèle) et vos vues (qui s'occupent simplement d'afficher les donnés calculées dans un template et d'envoyer des évènements aux contrôleurs).
Le souci de ce schéma est que vos contrôleurs font beaucoup trop de choses dans votre application. Les vrais problèmes commencent à apparaitre quand vous commencez à avoir un contrôleur qui gère un type de données et plusieurs vues qui affichent cette même donnée.

La [petite histoire que raconte Facebook](https://www.youtube.com/watch?list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v&v=nYkdrAPrdcw#t=621) pour expliquer le problème que résout Flux parle du chat.  
La première version n'est qu'un petit panel en bas de page, c'est tout. À ce moment là, c'est simplement un petit composant MVC et dispose de son contrôleur.
Ce contrôleur s'occupe de recevoir les messages et récupère les évènements du panel pour envoyer les messages.
Si on devait écrire, de façon très synthétique, la méthode de contrôleur qui gère les nouveaux messages on aurait sûrement quelque chose comme ça : 

```javascript
function onMessage(message) {
    var chatPanel = getChatPanel(message.thread);
    chatPanel.append(message);
}
```

Puis est arrivé le bandeau de notification en *topbar* de Facebook, celle-ci indique (entre autres) le nombre de messages non lus dans le chat. Le code du contrôleur se complexifie alors un peu pour devenir.

```javascript
function onMessage(message) {
    var chatPanel = getChatPanel(message.thread);
    chatPanel.append(message);
    chatNotif.increase(1);

    if (chatPanel.hasFocus()) {
        //si le chat a le focus, on peut décrémenter la notif
        chatNotif.decrease(1);
    }
}
```

Enfin est arrivé la page de chat dédiée, sur laquelle les deux précédents composants peuvent bien sûr être présents.
Notre nouveau code ressemble maintenant à :

```javascript
function onMessage(message) {
    var chatPanel = getChatPanel(message.thread);
    chatPanel.append(message);
    chatNotif.increase(1);
    if (chatPage.currentThread === message.thread) {
        //si la page de chat est ouverte sur la conversation
        //on ajoute le message
        chatPage.append(message);
    }

    if (chatPanel.hasFocus() || chatPage.currentThread === message.thread) {
        chatNotif.decrease(1);
    }
}
```
 
Bon je pense que vous voyez l'idée, plus on rajoute de vues associées à ces données, plus on va rendre nos contrôleurs complexes. Ce qui veut dire un code plus dur à maintenir et à comprendre.  
Notez que vous avez aussi à traiter tous les événements qui peuvent être liés à cette messagerie (focus sur chacune des vues et quand l'utilisateur répond par exemple).

Le problème de fond est : **le contrôleur est responsable de beaucoup trop de choses**

Flux répond à ça en deux points assez simples :

- un **flux d'actions unidirectionnel** ;
- la fin de la séparation des vues et contrôleurs au profit de **controller-views** responsables de transformer les données qu'ils affichent.

##Flux

La principale idée de flux est de faire passer le moindre évènement de votre application au travers d'une boucle qui va parcourir tous vos stores (les éléments qui contiennent les données de votre application, nous reviendrons dessus juste après).  
Si vous allez voire le [code de Flux](https://github.com/facebook/flux/tree/master/src) vous vous rendrez compte qu'il ne se compose en fait que d'un dispatcher (et de quelques helpers). Car en réalité **Flux n'est pas du code mais plutôt une nouvelle façon de penser son code**.

Avec Flux votre codebase va se décomposer de la façon suivante :

- des **stores** qui sont l'endroit où votre modèle va être contenu ;
- des **actions** qui représente toutes les choses que votre appli peut faire ;
- un (et un seul) **dispatcher** qui notifie les stores des actions effectuées ;
- des **controller-views** qui vont transformer et afficher les données qu'on leur donne.

###Les stores
C'est ici que tout vos modèles vont vivre. Les stores sont en fait une représentation complète de l'état, à un instant `t`, de votre application. Il ne doit y avoir **aucun de vos modèles qui vit en dehors d'un store**.  
Si vous vous pliez à cette règle, il vous suffira de faire une sauvegarde des données de vos stores et la recharger plus tard pour pouvoir retrouver l'application dans l'état exact dans laquelle vous l'aviez laissée.

Les stores se comportent comme un modèle observable (il dispose de getters et d'une méthode addListener) à la différence près qu'**il n'a pas de setter**. Et cela nous mène à une autre idée très importante dans Flux : **seul le store peut mettre à jour ses propres données**

À ce stade vous vous demandez donc normalement comment faire pour pouvoir changer l'état de l'application si on a aucun setter dans notre entité qui contient tous les modèles de l'application. C'est à ce moment là que le **dispatcher** entre en jeux.

###Le dispatcher
Le dispatcher est là pour faire transiter **absolument tout ce qu'il se passe sur l'application par vos stores**. Quand je parle de tout ce qui se passe, je parle bien sûr des évènements. Les évènements c'est par exemple :

- « l'utilisateur a cliqué sur le bouton de suppression »
- « l'utilisateur a soumit tel formulaire »
- mais aussi « le serveur a envoyé telle donnée »
- ou encore « le serveur a indiqué que les identifiants de connexion sont faux ».

Bref, quand je dis tout ce qu'il se passe, c'est tout.

Dans le bootstrap de votre application tous vos stores devront donc être enregistrés auprès de ce dispatcher unique qui les préviendra alors dès qu'il se passe quelque chose sur l'applications.  
Le dispatcher est là pour crier bêtement à tous les stores « hey les gars il s'est passé ceci, faites en ce que vous en voulez ». Son rôle s'arrête là.

Par la suite, vos stores eux choisissent de réagir, ou non, aux évènements qu'ils reçoivent. Pour ça, votre store va donner un *callback* à votre dispatcher qui sera appelé à chaque évènement. Souvent ce callback sera composé d'un switch qui va traiter uniquement les cas qui l’intéresse.

Allez, un peu de concret avec un petit bout de code pour illustrer tout ça. Imaginons un store qui garde bien au chaud en mémoire une liste de ... TODOS (et merde, je m'étais juré que je ne prendrais pas cet exemple  … :/ )

On dispose d'un côté d'une liste d'évènements sous forme de constantes

```javascript
var events = {
    //quand l'application reçoit une liste de todos du serveur (ou d'ailleurs)
    RECEIVED_TODOS: "RECEIVED_TODOS",

    //quand l'utilisateur ajoute un nouveau todo
    TODO_ADDED: "TODO_ADDED",

    //quand les todos ont été sauvegardés sur le serveur
    TODOS_SAVED: "TODOS_SAVED"
    //[...] plein d'autres évènements que nous ne traiterons pas ici
};

module.exports = events;
```

et de notre store qui gère les todos :

```javascript
//l'instance unique de notre dispatcher de l'application
var appDispatcher = require("../dispatcher/appDispatcher"),
    //les évènements définis précédemment
    events = require("./events");

//nos todos. inaccessibles depuis l'extérieur et vide pour le moment
//c'est une action qui viendra remplir tout ça
var todos = [];

var TodosStore = {
    //l'unique méthode accessible depuis l'extérieur
    //qui nous retourne simplement les todos
    get: function () {
        return todos;
    }

    //ps il faut rajouter ici les méthodes d'ajout/suppresion
    //d'event listeners (addListener/removeListener)
    //qui serviront pour prévenir les vues que quelque chose
    //a changé
});

//c'est ici que la magie s’opère. On enregistre un callback qui sera appelé dès que quelque chose se passe
appDispatcher.register(function (payload) {
    //dans le payload on a tous les détails de l'évènement (type et données qui va avec)
    var action = payload.actionType,
        data = payload.data;

    //on répond uniquement aux évènements qui nous intéressent
    switch (action) {
        //quand on reçoit les todos, on remplace simplement nos todos
        //par les todos reçus
        case events.RECEIVED_TODOS:
            todos = data.todos;
            this.emitChange(); //stay tuned, on parle de ça bientôt
            break;

        //quand un todo est créé sur le serveur on l'ajoute dans notre 
        //liste de todos
        case events.TODO_ADDED:
            todos.push(data.todo); //on ajoute la nouvelle todo dans la liste
            this.emitChange(); //stay tuned, on parle de ça bientôt
            break;

        //par défaut, on ne fait rien
        //vous noterez par exemple qu'on ne répond pas ici 
        //à l'évènement TODOS_SAVED car il n'aurait aucune influence
        //sur les données brute de ce store
        default:
            break;
    }
}.bind(todosStore));

module.exports = todosStore;
```

Ça y est nous avons de quoi stocker nos données dans l'application mais rien ni pour les afficher ni pour les remplir. Je vous propose donc de parler des vues avant de finir sur les actions.

###Les vues

Allez maintenant qu'on sait comment stocker nos données, voyons un peu comment les afficher. Pour ça, on va utiliser les controller-views.  
L'idée principale du controller-view est de regrouper ensemble le contrôleur et sa vue associée. Ainsi on se débarrasse d'une partie du problème qu'introduit Facebook avec son chat : **le contrôleur responsable de beaucoup de vues**.  
Facebook distingue tout de même deux type de vues différentes dans Flux : les views simples et les containers.

Dans la suite de ce paragraphe, je vais considérer qu'on utilise [React](https://facebook.github.io/react/docs/getting-started.html) pour faire nos vues, et que vous avez une connaissance des [concepts de base de React](https://facebook.github.io/react/docs/getting-started.html). Sachez que rien ne vous oblige à utiliser React pour vos vues.

####les containers

Les containers sont des controller-views un peu spéciaux : ils écoutent les changements d'un store.  
L'idée du container est de centraliser les données relatives à une partie de votre application à un seul endroit. Le container passera ensuite ces données à ses enfants pour affichage.  
Pour reprendre le cas de notre application de TODOS on va avoir envie d'avoir un container qui à accès à l'utilisateur loggé et un autre qui s'occupe des TODOS. Ils écouteront respectivement les `userStore` et `todosStore`.

Vous l’aviez peut-être vu dans le callback passé au dispatcher dans mon exemple précédent, on voit le todosStore appeler la méthode `emitChange`. En réalité, c’est cette méthode qui va permettre aux stores de prévenir les vues que des choses ont changées chez eux. Aussi quand vous créez un nouveau container, vous devez enregistrer un callback auprès des stores dont il dépend (et ne pas oublier de le détruire quand le composant est détruit). Avec React on fait ça dans le `componentWillMount` ce qui nous donne 

```javascript
React.createClass({
    //...
    componentWillMount: function () {
         // à la création du composant, on enregistre le listener
         userStore.addListener(this.onChange);
    },

    componentWillUnmount: function () {
         // à la suppression du composant, on retire le listener
        userStore.removeListener(this.onChange);
    },

    //ce callback est appelé à chaque fois que le userStore change
    onChange: function () {
        this.setState({
            user: userStore.get()
        });
    },

    render: function () {
        //on a ici la dernière valeur du user
        return (<App user={this.state.user}/>);
    }
});
```

Comme son nom l'indique, le container ne fait que contenir des données. Et, à ce titre, comme vous pouvez le voir dans le code précédent, la méthode `render` est la plus simple possible. Elle délègue simplement le rendu à un composant de vue … Et c’est tout !

Ainsi, vos container ne sont responsables que d'une seule chose : mettre à jour les données pour tout le reste des composants. On respecte bien le fameux [Single Responsability Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle) et le débug ne s'en porte que mieux. 

####Les controller-views

Les controller-views ne sont là que pour transformer vos données brutes et les afficher comme vous le voulez. Il reçoivent donc toutes leurs données via des propriétés et sont censés être complètement *stateless*.  
On retrouve, avec les vues, un concept propre à la programmation fonctionnelle : une fonction retournera toujours le même résultat si on lui donne les mêmes paramètres. On appelle ça les [fonctions pures](https://fr.wikipedia.org/wiki/Fonction_pure).  
D'ailleurs avec la [nouvelle syntaxe de composant](https://facebook.github.io/react/blog/2015/09/10/react-v0.14-rc1.html#changelog) que React v0.14 a introduit récemment, vous pouvez déclarer un composant comme étant une simple fonction qui prend en paramètre des `props` et retourne du JSX. Avec cette syntaxe, pas de `state` et on est alors obligé de faire un composant *stateless*.

Pour reprendre notre application de TODOS qu'on a commencé plus tôt, voila à quoi pourrait ressembler notre composant `App` :

```javascript
var App = function (props) {
    var user = props.user;
    return (
        <div className="header">
            <span>{user.firstname}</span>
            <span>{user.lastname}</span>
            <LogoutButton user={user} />
        </div>
        <TodoContainer />
    );
}
```

Note : les composant-fonctions sont les composants les plus simples qu'on puisse trouver. Pas d'event handler dedans, de mixin ni de réécriture de [méthode du cycle de vie du composant](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods) (comme `componentWillMount` par exemple). Ne vous sentez donc pas obligé de n'utiliser que des composant-fonctions. Utilisez les dès que vous pouvez.

###Les actions

Ok si on récapitule on a donc les vues qui récupèrent leurs données depuis les stores qui eux modifient leurs données selon les informations du dispatcher, la question qui réside est : qui donc fait appel au dispatcher ? La réponse est, bien sûr, les actions.  

C'est dans les actions que la magie opère. C'est elles qui sont à l'origine de tout ce qui peut changer l'état de l'application (ajout/suppression/édition d'un TODO, récupérations des TODOs sur le serveur ...).  
Les actions sont donc les éléments qui vont utiliser le dispatcher pour lancer des évènements que les stores vont interpréter.

Le code des actions est souvent très simple. Je vais distinguer deux types d'actions :

- les actions qui n'ont d'effets que sur les données locales qui sont souvent synchrones ;
- les actions qui ont un effets sur des données externes (typiquement qui viennent d'une API) qui sont souvent asynchrones.

Le premier type d'action est vraiment très simple, il ne fait qu'appeler le dispatcher un point c'est tout.  
Considérons ce scénario d'ajout de TODO :

- l'utilisateur édite son TODO tout frais ;
- quand il a fini, il ajoute son TODO dans la liste ;
- il peut en ajouter plein d'autres ;
- une fois qu'il est content de sa liste de TODOs il peut la sauvegarder sur le serveur.

Dans ce scénario, il y a les deux type d'actions dont je vous ai parlé. 

- `addTodo` qui ajoute en local un nouveau TODO ;
- `saveTodos` qui prend tous les nouveaux TODOs et les sauvegarde via une requête AJAX sur le serveur.

si on voulait implémenter ces deux actions, ça nous donnerait quelque chose comme ça :

```javascript
var todoActions = {
    addTodo: function (todo) {
        //"Bon allez ça ça part chez les stores qui savent quoi faire de ce truc"
        dispatcher.dispatch({
            actionType: "TODO_ADDED",
            todo: todo
        });
        //my job here is done
    },

    saveTodos: function (todos) {
        //"OK j'envoie ça au serveur et ensuite je file ça aux stores
        api
            .saveTodos(todos)
            .success(function (response) {
                //OK c'est bon les enfants
                dispatcher.dispatch({
                    actionType: "TODOS_SAVED",
                    todos: response.todos
                });
            })
            .catch(function (response) {
                //oh merde les gars ça a pas marché
                dispatcher.dispatch({
                    actionType: "TODOS_SAVE_FAILED",
                    todos: todos
                });
            });
    }
}
```

Notez que les évènements dispatchés par les actions décrivent des **choses qui se sont passées** et pas ce que doit faire l'application par rapport à cette action. Pour illustrer mon propos voila un exemple qu'on pourrait être tenté de faire.  
Prenons le cas où la sauvegarde sur le serveur s'est mal passée (donc on passe dans le `catch`), on pourrait avoir envie de dispatcher un `"SHOW_NOTIFICATION_TODOS_SAVE_FAIL"`. En faisant ça, on donne à l'action une connaissance de ce que l'application peut faire.  
Or une action ne doit faire que constater ce qu'il se passe et le transmettre.

###Flux en résumé

Pour résumer un peu voila les idées qui sortent de Flux :

- les stores contiennent toutes les données brutes de l'app ;
- les stores représentent l'état de l'application à l'instant `t` et sont donc complètement synchrone ;
- seuls les stores peuvent modifier leurs données ;
- les stores réagissent aux évènements du dispatcher ;
- les stores sont comme un modèle observable mais sans `setter` ;
- les vues écoutent les changements d'un (ou plusieurs) store(s) et se rendent en fonction ;
- une vue qui est reliée à un store est appelée "container" et doit avoir une méthode `render` simplissime ;
- le dispatcher est les yeux des stores vis à vis de l'application (il dit au stores tout ce qu'il se passe) ;
- les actions sont là pour appeler le dispatcher et éventuellement des services externes (API, localStorage ...) ;
- pour nommer un évènement que doit dispatcher une action il faut se poser la question « Que vient-il de se passer dans mon application ? » et pas « Que devrait faire mon application face à ça ? »

Et le petit graphique qui résume très bien les interactions entre les composants :

![Flux illustrated](https://raw.githubusercontent.com/facebook/flux/master/docs/img/flux-diagram-white-background.png)

(ps: Pourquoi ce schéma n'apparait que sur le github et nulle part sur la doc alors qu'il résume bien mieux Flux que les schéma qu'on peut trouver [ici](http://facebook.github.io/flux/docs/overview.html#content))

On pourrait représenter une application Flux comme une fonction qui prend en paramètre un état à un instant `t` et une action et qui retourne l'état à l'état `t+1` :

```
application(state1, action) => state2
```

Si on considère que cette fonction est [pure](https://fr.wikipedia.org/wiki/Fonction_pure) (qu'elle ne fait que retourner un nouvel état sans rien modifier en mémoire pour faire simple), alors tous les états de cette application sont déterministes (une même action ne pourra pas donner deux résultats différents) et vous pouvez par exemple facilement mettre en oeuvre du *undo/redo* (la [doc de Redux](http://rackt.org/redux/docs/recipes/ImplementingUndoHistory.html) explique ça très bien).

##Conclusion

Je trouve l'idée qu'a eu Facebook d'implémenter le concept de Flux entièrement dans sa doc très bonne. C'est un peu comme ces articles qui réimplémente une techno populaire (eg. [Make your own Angular](http://teropa.info/blog/2013/11/03/make-your-own-angular-part-1-scopes-and-digest.html)) pour l'expliquer. C'est très didactique et permet de vraiment comprendre ce qu'il se passe *sous la capuche* (comme disent les américains) des outils qu'on utilise tous les jours (ou presque).  
En revanche je trouve dommage qu'ils n'aient pas plus séparé le concept et l'implémentation dans leur doc. Je reconnais avec le recul que j'aurais pu comprendre ça plus tôt. Je suis surement parti trop vite dans le code sans lire à fond le concept d'abord, mais je pense que je ne suis pas le seul à avoir pris ce chemin.

Outre ça, le concept de Flux est génial et a vraiment changé ma façon de faire mes applications.  
Alors si je peux vous donner un conseil, c'est trouvez vous une implémentation de Flux qui vous va (ou faites la vous même) et lancez vous :)
