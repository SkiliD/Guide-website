# Guide Website

Application web de planification de voyages avec guides touristiques. Elle se compose d'un **frontend** Next.js, d'un **backend** Express/TypeScript et d'une base de données **PostgreSQL**.

---

## Prérequis

Installer les outils suivants avant de commencer :

| Outil | Version minimale | Lien |
|-------|-----------------|------|
| **Docker Desktop** | 4.x | https://www.docker.com/products/docker-desktop/ |
| **Node.js** (optionnel, pour dev sans Docker) | 20.x | https://nodejs.org/ |

> Docker Desktop inclut `docker compose`. C'est la seule dépendance obligatoire pour lancer le projet.

---

## Démarrage rapide (Docker)

C'est la méthode recommandée : elle lance la base de données, le backend, le frontend et pgAdmin en une seule commande.

```bash
# Cloner le dépôt
git clone https://github.com/<votre-org>/Guide-website.git
cd Guide-website

# Lancer tous les services
docker compose up -d --build
```

Une fois les conteneurs démarrés :

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| pgAdmin | http://localhost:5050 |

### Comptes de démo

Au premier démarrage, la base est automatiquement initialisée avec des données de démonstration :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@henri.trip` | `admin123` | Admin |
| `user@henri.trip` | `user123` | Utilisateur |

### Commandes Docker utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (reset de la base de données)
docker compose down -v
```

### Accéder à pgAdmin

1. Ouvrir http://localhost:5050
2. Se connecter avec `admin@guide.local` / `admin123`
3. Ajouter un serveur avec les paramètres suivants :
   - **Host** : `db`
   - **Port** : `5432`
   - **Username** : `postgres`
   - **Password** : `postgres`
   - **Database** : `guide_db`

---

## Démarrage sans Docker (développement local)

### 1. Base de données PostgreSQL

Installer et démarrer PostgreSQL localement, puis créer la base :

```bash
createdb guide_db
```

Ou via Docker uniquement pour la base :

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd guide-backend
npm install
npm run dev
```

Le backend démarre sur http://localhost:5000 et initialise automatiquement le schéma et les données de démo.

### 3. Frontend

```bash
cd guide-website
npm install
npm run dev
```

Le frontend démarre sur http://localhost:3000.

---

## Structure du projet

```
Guide-website/
├── docker-compose.yml          # Orchestration de tous les services
├── guide-backend/              # API Express + TypeScript
│   ├── src/
│   │   ├── config/db.ts        # Connexion PostgreSQL + schéma + seed
│   │   ├── routes/             # Routes API
│   │   └── index.ts            # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── guide-website/              # Frontend Next.js
│   ├── app/                    # Pages (App Router)
│   ├── components/             # Composants React
│   ├── lib/                    # API client, types, utilitaires
│   ├── Dockerfile
│   └── package.json
└── README.md
```

---

## Variables d'environnement

Les valeurs par défaut sont configurées dans `docker-compose.yml`. Pour un développement local sans Docker, les valeurs de fallback sont directement dans le code (`db.ts`).

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `postgres` |
| `DB_NAME` | Nom de la base | `guide_db` |
| `PORT` | Port du backend | `5000` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | `your-secret-key-change-in-production` |
| `NEXT_PUBLIC_API_URL` | URL de l'API pour le frontend | `http://localhost:5000` |

---

## Compilation du backend (production)

```bash
cd guide-backend
npm run build       # Compile TypeScript vers dist/
npm run start       # Démarre depuis dist/index.js
```
