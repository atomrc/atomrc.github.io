---
layout: post
title: L'intégration continue avec Elastic Bamboo, Atoum et Karma
categories: [bamboo, integration continue]
description: Mettre en place de l'intégration continue avec un serveur Elastic Bamboo et des tests Atoum et Karma
---
Récemment, nous sommes passés à de l'intégration continue chez [DoYouBuzz](http://www.doyoubuzz.com). Etant de fervant utilisateurs des produits Atlassian, nous avons choisi [Bamboo](https://www.atlassian.com/software/bamboo) comme serveur d'intégration continue. Comme toute les étapes n'ont pas toujours été évidentes, j'ai décidé de faire un petit récapitulatif des différentes étapes. Comme les différentes étapes ont toutes des buts distincts et nécessitent des outils/compétences différentes, j'ai séparé le tout dans différents articles. 

Voici donc les différentes étapes : 

- [installation d'Elastic Bamboo avec instance Amazon EC2](/p/configuration-amazon-aws-ec2-elastic-bamboo/) ;
- [utilisation d'un repo en SSH avec Elastic Bamboo]({% post_url 2014-04-22-utiliser-un-repo-en-ssh-avec-elastic-bamboo %}) ;
- [Bamboo et les tests Atoum](/p/lancer-des-tests-atoum-dans-bamboo/) ;
- lancement et interprétation des test karma dans Bamboo (en cours d'écriture).
