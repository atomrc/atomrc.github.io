---
layout: post
published: false
title: Utiliser un repo SSH avec Elastic Bamboo
categories: [bamboo, integration continue]
description: Donner des accès SSH à votre instance EC2 pour Elastic Bamboo
---

Quand vous faites de l'intégration continue avec un repository, vous avez plusieurs possiblités :

- le repo est Open Source et vous n'avez besoin d'aucune autorisation pour le cloner ;
- le repo est privé et vous fournissez un login/mot de passe pour y accéder ;
- le repo est privé vous avez une paire de clés (privée/publique) SSH enregistrées pour votre machine auprès de votre serveur de versionnement.

La solution SSH va s'avérer très pratique lorsque vous utiliser, par exemple, des submodules privés dans votre application.

Si les deux premières possibilités sont très simples à mettre en place dans Elastic Bamboo, il va falloir ruser un peu pour utiliser la dernière.

L'idée reste tout de même assez simple : copier les clés SSH (privée et publique) dans le répertoire `~/.shh` de votre utilisateur Bamboo à chaque lancement de l'instance Amazon EC2.

Et pour ça on va utiliser les scripts de démarrage de l'instance disponibles dans l'interface d'admin d'Elastic Bamboo.
