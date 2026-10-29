# ABYZ — Workspace de conception & de raisonnement logiciel

ABYZ est une application fullstack pensée pour structurer, expliciter et matérialiser les idées logicielles avant la phase de build. Elle articule l'exploration conceptuelle, l'architecture visuelle, la spécification technique et la génération de briefs IA exploitables.

---

## 🚀 Stack technique

- **Framework :** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Authentification :** [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **Base de données :** PostgreSQL hébergé sur [Neon](https://neon.tech/)
- **ORM :** [Prisma Client](https://www.prisma.io/) avec adaptateur serverless `@prisma/adapter-pg`
- **Validation :** [Zod](https://zod.dev/)
- **Design & Responsive :** CSS moderne sur-mesure avec design system dark tech, support mobile/tablette/desktop (tiroir off-canvas, absence de débordement horizontal).

---

## 🛠️ Fonctionnalités clés

1. **Tableau de bord des projets (`/`)**
   - Authentification Clerk intégrée (flux de connexion/inscription).
   - Liste des projets synchronisée en temps réel depuis Neon.
   - Création interactive de nouveaux projets (nom, type, intention).
   - Cartes projets dynamiques avec métadonnées (statut, type, dernière modification).

2. **Workspace projet & raisonnement (`/projects/[id]`)**
   - **ThinkPad & Reasoning Pad :** Zone d'exploration libre avec insertion de blocs méthodologiques (*Idea, Objective, User, Feature, Question, Decision, Constraint*) et sauvegarde locale instantanée.
   - **Visual Architecture :** Cartographie interactive des concepts et dépendances de l'application.
   - **Blueprint (Specs) :** Spécifications formelles et cahier des charges prêts à l'audit.
   - **Prompt Studio :** Générateur de prompts IA synthétisant les décisions pour transmission directe aux agents de code.
   - **Assistant ABYZ :** Guide contextuel rappelant les invariants et suggérant les questions critiques à trancher.

3. **Expérience Responsive globale**
   - Navigation mobile optimisée avec menu hamburger (tiroir off-canvas avec overlay).
   - Adaptation sans chevauchement de 375px (mobile) à 1280px+ (desktop).
   - Empilement vertical fluide des blocs de réflexion et des grilles.

---

## ⚙️ Configuration & Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Variables d'environnement

Créer un fichier `.env` à la racine du projet avec les identifiants requis :

```env
# Connexion Neon PostgreSQL
DATABASE_URL="postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"

# Authentification Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

### 3. Base de données & Prisma

Générer le client Prisma et appliquer les migrations :

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 💻 Commandes disponibles

- **Démarrage en développement :**
  ```bash
  npm run dev
  ```
  L'application est accessible sur [http://localhost:3000](http://localhost:3000).

- **Build de production :**
  ```bash
  npm run build
  ```

- **Lancement en production :**
  ```bash
  npm run start
  ```

- **Linting :**
  ```bash
  npm run lint
  ```

---

## 📂 Structure du projet

```text
├── app/
│   ├── api/
│   │   └── projects/          # API REST (CRUD projets & détail /api/projects/[id])
│   ├── components/            # Composants partagés (ex: auth-controls)
│   ├── projects/[id]/         # Espace de travail de raisonnement (ThinkPad, etc.)
│   ├── sign-in/ & sign-up/    # Routes d'authentification Clerk
│   ├── layout.tsx             # Root layout avec ClerkProvider
│   ├── next.css               # Styles Next.js & responsive
│   └── page.tsx               # Dashboard projets principal
├── prisma/
│   └── schema.prisma          # Modèles Project, User, Thought
├── src/
│   └── lib/                   # Clients DB (Neon/Prisma), validateurs Zod, requêtes
└── styles.css                 # Design system global (Dark UI, ThinkPad, Blueprint)
```
