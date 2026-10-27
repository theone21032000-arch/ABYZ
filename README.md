# ABYZ

Première phase du produit ABYZ : un workspace de conception logiciel orienté
traçabilité, avec les espaces ThinkPad, Visual Thinking, Blueprint et Prompt
Studio.

## Lancer localement

Ouvrir `index.html` dans un navigateur moderne. Aucune dépendance ou étape de
build n'est nécessaire pour cette phase de prototype.

## Fonctions incluses

- Navigation entre les principaux espaces ABYZ.
- ThinkPad éditable avec blocs de réflexion et sauvegarde locale du navigateur.
- Carte de relations avec ajout de concept.
- Blueprint de spécification et Prompt Studio copiable.
- Création de projet locale et interface responsive.

## Limites explicites

Ce socle n'implémente pas encore l'authentification, PostgreSQL/Prisma, les
connexions d'IA, la collaboration, ni les intégrations externes. Les zones qui
dépendent de ces services l'indiquent dans l'interface plutôt que de les
présenter comme opérationnelles.

## Données serveur

Le schéma PostgreSQL de départ se trouve dans `prisma/schema.prisma`. Copiez
`.env.example` vers `.env`, renseignez une instance PostgreSQL, puis exécutez
`npx prisma generate` et `npx prisma migrate dev --name init` lorsque la CLI
Prisma est disponible dans votre environnement.

L'authentification réelle requiert encore le choix d'un fournisseur compatible
avec votre déploiement (par exemple Auth.js ou Clerk). Elle ne sera pas simulée.
