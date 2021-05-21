---
title: Utiliser un repo SSH avec Atlassian Elastic Bamboo
categories: [bamboo, integration continue]
description: Donner des accès SSH à votre instance EC2 pour Elastic Bamboo
---

Quand vous faites de l'intégration continue avec un repository, vous avez plusieurs possibilités :

- le repo est Open Source et vous n'avez besoin d'aucune autorisation pour le cloner ;
- le repo est privé et vous fournissez un login/mot de passe pour y accéder ;
- le repo est privé vous avez une paire de clés (privée/publique) SSH enregistrées pour votre machine auprès de votre serveur GIT (ou SVN ou que sais-je).

La solution SSH va s'avérer très pratique lorsque vous utilisez, par exemple, des submodules privés dans votre application.

Si les deux premières possibilités sont très simples à mettre en place dans Elastic Bamboo, il va falloir ruser un peu pour utiliser la dernière.

L'idée reste tout de même assez simple : copier les clés SSH (privée et publique) dans le répertoire `~/.shh` de votre utilisateur Bamboo à chaque lancement de l'instance Amazon EC2.

Avant tout, je vous invite à aller lire [mon article sur la configuration d'une instance Amazon EC2 pour Elastic Bamboo](/p/configuration-amazon-aws-ec2-elastic-bamboo/).

## Génération d'une paire de clés pour votre image

Bon comme il est toujours bon de le rappeler, voila comment générer une paire de clés SSH. **Attention à ne pas mettre de passphrase à votre clé sinon votre script restera bloqué sur une invite d'input !**

```bash
ssh-keygen -t rsa
```

Une fois cette commande exécutée, deux choses à faire : 

- ajouter votre clé publique (générée par défaut dans `~/.ssh/id_rsa.pub`) comme clé autorisée sur votre serveur GIT ;
- garder les contenus de `~/.ssh/id_rsa`et `~/.ssh/id_rsa.pub`de côté pour la prochaine étape ;).

## Installer les clés sur vos instances EC2

La suite consiste à donner les clés SSH fraichement générées à vos instances Amazon afin de leur donner accès à votre serveur GIT.

Et pour ça on va utiliser les scripts de démarrage d'une image disponibles dans l'interface d'admin d'Elastic Bamboo.

![Configuration d'images Elastic Bamboo](//i.imgur.com/SlYZQK2.png)

Une fois dans le formulaire d'édition de l'image que l'on veut utiliser pour les tests, on va remplir le champ 'Instance startup script'. Je vous propose de mettre le script complet ici et j'explique après ;)

```bash
rm -rf /home/bamboo/.ssh 2> /dev/null
mkdir /home/bamboo/.ssh
 
cat << EOF > /home/bamboo/.ssh/config
Host bitbucket.org
StrictHostKeyChecking no
UserKnownHostsFile /dev/null
EOF

cat << EOF > /home/bamboo/.ssh/id_rsa.pub
ssh-rsa <The public key here> BambooElaticInstance
EOF
 
cat << EOF > /home/bamboo/.ssh/id_rsa
-----BEGIN RSA PRIVATE KEY-----
<The private key here>
-----END RSA PRIVATE KEY-----
EOF

chown bamboo -R /home/bamboo/.ssh

chmod 600 /home/bamboo/.ssh/id_rsa
chmod 600 /home/bamboo/.ssh/config
```

A savoir sur les script de démarrage d'instance :

- ils sont lancés à chaque lancement d'une machine Amazon ;
- ils sont exécutés en tant que `root` user de la machine (vous avez donc tous les droits) ;
- ils sont lancés avant le lancement des agents Bamboo.

Bon décomposons le script que je vous ai donné plus haut : 
On commence par supprimer un éventuel précédent répertoire `.ssh`. On envoie la sortie d'erreur sur `/dev/null` pour ne pas faire planter le script si le répertoire n'existe pas :

```bash
rm -rf /home/bamboo/.ssh 2> /dev/null
```

On configure SSH pour ne pas qu'il demande confirmation avant d'ajouter un serveur qu'il n'a jamais utilisé. Il faudra donc remplacer `bitbucket.org` par le nom du serveur que vous utilisez. Cette commande permet de ne pas bloquer le script sur une attente d'input utilisateur :

```bash
cat << EOF > /home/bamboo/.ssh/config
Host bitbucket.org
StrictHostKeyChecking no
UserKnownHostsFile /dev/null
EOF
```

On copie le contenu de la clé publique générée à la première étape dans le répertoire qui va bien sur notre instance :

```bash
cat << EOF > /home/bamboo/.ssh/id_rsa.pub
ssh-rsa <The public key here> BambooElaticInstance
EOF
```

Même chose pour la clé privée :

```bash
cat << EOF > /home/bamboo/.ssh/id_rsa
-----BEGIN RSA PRIVATE KEY-----
<The private key here>
-----END RSA PRIVATE KEY-----
EOF
```

Jusque là, on travaillait avec l'utilisateur `root`, on donne donc le répertoire `.ssh` et son contenu à l'utilisateur `bamboo` :

```bash
chown bamboo -R /home/bamboo/.ssh
```

Enfin on protège les clés générée sans quoi SSH refusera de fonctionner :

```bash
chmod 600 /home/bamboo/.ssh/id_rsa
chmod 600 /home/bamboo/.ssh/config
```

Une fois toutes ces étapes faites vous pourrez démarrer une nouvelle instance à partir de votre image fraichement configurée et faire le test ultime à partir de cette dernière :

```bash
git clone git@bitbucket.com:username/yourrepo.git
```

Si ça marche, c'est que vous êtes bon pour passer à l'étape de tests de votre application (des [tests Atoum par exemple](/p/lancer-des-tests-atoum-dans-bamboo/) ;) ).
