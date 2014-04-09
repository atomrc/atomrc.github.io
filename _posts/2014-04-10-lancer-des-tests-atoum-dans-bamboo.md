---
layout: post
published: false
title: Configuration d'une instance Amazon EC2 pour Elastic Bamboo
categories: [atoum, bamboo, integration continue]
description: Tutoriel d'installation d'une instance EC2 pour faire de l'intégration continue avec Bamboo
---

Lors de la mise en place de Bamboo comme serveur d'[intégration continue à DoYouBuzz](/p/integration-continue-avec-bamboo), la phase qui m'a semblée la plus dure a été la phase de configuration de mon instance AWS EC2. La [documentation d'Altassian sur Elastic Bamboo](https://confluence.atlassian.com/display/BAMBOO/Configuring+Elastic+Bamboo) est vraiment très fournie et même surement un peu trop, la rendant parfois confuse. Voici donc un petit tutoriel qui devrait vous permettre d'avoir un petit serveur d'intégration continue rapidement.

##Pourquoi Elastic Bamboo

Avec Bamboo, vous avez deux possibilités :

- soit vous installez Bamboo sur un serveur à vous, dans quel cas l'intégration continue se fera sur le même serveur que celui sur lequel vous aurez installé Bamboo ;
- soit vous utilisez Bamboo en [SasS](http://fr.wikipedia.org/wiki/Logiciel_en_tant_que_service) dans quel cas Bamboo utilisera une instance EC2 sur le cloud d'Amazon pour faire vos builds. C'est ce cas là dont nous parlerons ici.

##Liaison entre Amazon AWS et Bamboo

Vous l'aurez compris, pour continuer ce tuto, il va vous falloir un compte Amazon sur lequel seront crées vos instances EC2. Je ne vous ferais pas l'afront de vous dire comment passer cette étape, je vous laisse directement aller [là](http://aws.amazon.com/fr/ec2/).

Une fois que vous avez votre compte, il va falloir générer une clé d'accès à ce compte. Cela permettra à Bamboo de créer/détruire des instances pour lancer vos builds. Pour cela il faut vous rendre dans la partie identification de votre compte Amazon :

![aws-credentials](http://i.imgur.com/9WV1O5v.png).

Une fois là, vous pourrez générer une clé d'accès pour votre serveur Bamboo. Ca se passe dans la partie "Access Keys". Là, vous allez pouvoir générer une paire clé privée/clé plublique pour votre serveur bamboo.
