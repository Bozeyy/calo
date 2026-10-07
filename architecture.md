# Architecture Documentation

## Vue d'ensemble
Application web de suivi quotidien des calories construite avec Next.js (App Router), Prisma, PostgreSQL et un design sobre type Flutter/Material.

## Structure du projet

### Frontend (`src/app/`)
- `layout.tsx` : Layout principal avec police Inter et inclusion du style global (`globals.css`).
- `page.tsx` : Dashboard principal (jauge journalière, macros, graphique de la semaine, historique des aliments consommés du jour, modal d'ajout).
- `login/page.tsx` & `register/page.tsx` : Authentification utilisateur sans surcharge.
- `foods/page.tsx` : Bibliothèque d'aliments et formulaire de création d'aliments personnalisés.
- `history/page.tsx` : Historique des journées passées.
- `components/` : Composants réutilisables (`Sidebar`, etc.).

### Prerendering & Hydratation
- Les dates dynamiques côté client sont initialisées dans un `useEffect` ou dérivées de props (`todayStr`) pour éviter les blocages de pré-rendu Turbopack/Next.js liés à `new Date()`.

### Backend & API (`src/app/api/`)
- `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` : Gestion des sessions via token JWT stocké dans un cookie HTTP-only.
- `/api/foods` : Recherche et création d'aliments.
- `/api/logs` & `/api/logs/[id]` : Journalisation des repas par utilisateur et par date.

### Middleware / Proxy
- `src/proxy.ts` : Proxy Next.js protégeant les routes privées (`/`, `/foods`, `/history`) et redirigeant les utilisateurs non authentifiés vers `/login`.

### Base de données (`prisma/`)
- Schéma Prisma connecté à PostgreSQL (Railway).
- Modèles : `User`, `FoodItem`, `FoodLog`, `FoodLogItem`.
