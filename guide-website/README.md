# Guide Website (Frontend)

Application Next.js pour visualiser des guides de voyage.

## Prerequis

- Node.js 20+
- npm 10+
- (Optionnel) Docker Desktop

## Demarrage rapide (mode mock, sans backend)

Le projet est configure pour fonctionner avec des donnees mock par defaut.

1. Installer les dependances :

```bash
npm install
```

2. Copier l'environnement exemple :

```bash
cp .env.example .env.local
```

3. Lancer le projet :

```bash
npm run dev
```

4. Ouvrir http://localhost:3000

## Utiliser le vrai backend

Dans `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Puis relancer `npm run dev`.

## Docker (frontend seul)

```bash
npm run docker:up
```

Application disponible sur http://localhost:3000

Arreter les conteneurs :

```bash
npm run docker:down
```
