---
layout: post
title: Configuration d'une instance Amazon EC2 pour Elastic Bamboo
categories: [bamboo, aws, integration continue]
description: Tutoriel d'installation d'une instance EC2 pour faire de l'intégration continue avec Bamboo
---

Lors de la mise en place de Bamboo comme serveur d'[intégration continue à DoYouBuzz](/p/integration-continue-avec-bamboo), la phase qui m'a semblé la plus obscure a été la phase de configuration de mon instance AWS EC2. La [documentation d'Altassian sur Elastic Bamboo](https://confluence.atlassian.com/display/BAMBOO/Configuring+Elastic+Bamboo) est vraiment très fournie et même surement un peu trop, la rendant parfois confuse. Voici donc un petit tutoriel qui devrait vous permettre d'avoir un petit serveur d'intégration continue rapidement.

##TL;DR;

En gros :

- la liaison entre Amazon et Bamboo est très facile à faire ;
- la documentation de Bamboo est beaucoup trop fournie pour s'y retrouver ;
- pour voir les images pré-configurées pour Bamboo, attention à être dans la région `US East (Nothern Virginia)` ;
- la création d'une image avec les paquets dont on a besoin c'est très facile une fois qu'on a compris le principe ;
- attention au type d'instance que vous associez aux images, seul le type `micro` fait partie de l'offre gratuite sur Amazon.



##Pourquoi Elastic Bamboo

Avec Bamboo, on avez deux possibilités :

- soit vous installez Bamboo sur un serveur à vous, dans quel cas l'intégration continue se fera sur le même serveur que celui sur lequel vous aurez installé Bamboo ;
- soit vous utilisez Bamboo en [SasS](http://fr.wikipedia.org/wiki/Logiciel_en_tant_que_service) dans quel cas Bamboo utilisera une instance EC2 sur le cloud d'Amazon pour faire vos builds. C'est ce cas là dont nous parlerons ici.

##Liaison entre Amazon AWS et Bamboo

###Côté Amazon
Vous l'aurez compris, pour continuer ce tuto, il va nous falloir un compte Amazon sur lequel seront crées vos instances EC2. Je ne vous ferais pas l’affront de vous dire comment passer cette étape, je vous laisse directement aller [là](http://aws.amazon.com/fr/ec2/).

Une fois qu'on a notre compte, il va falloir générer une clé d'accès à ce compte. Cela permettra à Bamboo de créer/détruire des instances pour lancer vos builds. Pour cela on va se rendre dans la partie identification de votre compte Amazon :

![aws-credentials](http://i.imgur.com/9WV1O5v.png)

Ca se passe dans la partie "Access Keys". Là, on va pouvoir générer une paire de clés pour notre serveur bamboo :

![aws-access-key](http://i.imgur.com/zuv28d9.png)

Il ne faut pas oublier de copier les clés avant de fermer la popup ! Ensuite, on va pouvoir passer à Bamboo.

###Côté Bamboo

De mémoire, quand vous avez une utilisation SaaS de Bamboo, vous ne pourrez pas accéder à l'interface d'administration tant que vous n'aurez pas renseigné vos clés d'accès à Amazon AWS. Il vous suffit donc de renseigner les clés que vous aurez générées à l'étape précédente.

Voila maintenant Bamboo va pouvoir communiquer avec AWS. Et oui c'est aussi simple que ça. Mais c'est aussi là ou les choses se compliquent.

##Création d'une image EC2 pour Bamboo

Jusque là, tout était plutôt facile. La création d'une image a été la première étape sur laquelle j'ai vraiment bloqué. En sois le processus n'est pas très compliqué, mais la documentation est tellement fournie qu'on a l'impression qu'il faut être admin système senior pour pouvoir faire ça. Or pas du tout, quelques notions suffisent !

Ce que j'ai mis du temps à comprendre c'est **qu'on a deux possibilités pour créer nos images** :

- partir d'une image complètement vierge sur laquelle on installe et on configure tous les paquets nécessaires pour que bamboo fonctionne (la version bien barbue) ;
- partir d'une image fournie par Bamboo qui a déjà toutes les configurations par défaut pour Bamboo sur laquelle on va ajouter tous les paquets dont on a besoin pour jouer nos tests (si seulement j'avais compris plus tôt que cette solution existait :) ).

La question qui se pose à ce moment là c'est : Pourquoi je n'avais pas vu qu'il y avait des images configurées pour Bamboo ? Pourtant j'avais été voir dans l'onglet des images dans la configuration de Bamboo, il n'y avait rien !
La réponse est simple : **on ne voit ces images si, et seulement si, on a configuré la région `US East (Nothern Virginia)` dans les préférences globales de Bamboo** -_-.

![bamboo-config-region](http://i.imgur.com/IAoTahE.png)

Ensuite, si on va dans l'onglet "Image Configuration" sur l'admin Bamboo, on doit voir un certain nombre d'images disponibles :

![bamboo-pre-configured-instances](http://i.imgur.com/B9H4SKq.png)

Il va maintenant falloir nous en choisir une qu'on va customiser comme il se doit.

###Pimp My Image

Voila les étapes de personnalisation d'une image Bamboo :

- on lance une instance de l'image qu'on a choisie précédemment ;
- on se connecte dessus pour installer tous les paquets nécessaires ;
- on créé, dans AWS, une nouvelle image à partir de l'instance personnalisés ;
- rend cette image disponible dans Bamboo.

Allez c'est parti !

Dans la liste des images disponibles, on démarre celle qu'on a choisie. On peut voir, dans l'onglet "Instances" de l'admin Bamboo qu'une instance est en train de démarrer à partir de l'image choisie. Une fois celle-ci démarrée (ça peut prendre un peu de temps hein), on va pouvoir se connecter dessus. On clique sur l'identifiant de l'instance pour accéder à ses informations :

![instance-details](http://i.imgur.com/zj7W6Oy.png)

Dans la section "SSH access" on va pouvoir télécharger la clé privée qui nous donnera accès à votre instance puis se connecter à cette dernière via une commande qui est donnée.

Pour pouvoir installer des paquet sur votre instance, on a besoin des droits `root` donc dans la commande qui est donnée, on remplace `ec2-user` par `root`. Ce qui devrait donner quelque chose comme :

    ssh -i /path/to/private/key.pk root@ec2-xxxxxxxx.compute-1.amazonaws.com

Il est également nécessaire de jouer la commande `chmod 400 path/to/private/key.pk` avant cette commande sinon Amazon refusera l'accès !

C'est le moment où on installe tous les paquets dont on a besoin pour lancer les builds du projet !!

Une fois les installations finies, il ne reste plus qu'à créer une nouvelle image à partir de l'instance qui tourne sur Amazon :

![create-image-amazon-instance](http://i.imgur.com/X3peG12.png)

Toujours sur Amazon, on peut aller dans l'onglet `Images > AMIs` et noter l'identifiant de l'image que l'on vient de créer. Ca doit ressembler à `ami-XXXXXXXX`

Retour sur l'interface de Bamboo, on va pouvoir créer une nouvelle image. Rien de bien sorcier, il suffit de bien mettre l'identifiant de l'image qu'on a créée juste avant pour que le lien se fasse bien. **Attention, si vous êtes sur une offre gratuite, à bien mettre `micro` dans le champ "instance type"**, les autres sont hors du compte gratuit Amazon !

##Conclusion

Arrivé ici, on a réussi à configurer une image système sur Amazon qui va nous permettre de jouer les builds de notre projet automatiquement. Je vous propose donc de passer à la suite : 

- [Bamboo et les tests Atoum](/p/lancer-des-tests-atoum-dans-bamboo) ;
- jouer et interpréter des tests Karma dans Bamboo (en cours d'écriture).
