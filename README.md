# ASE Athletics — Player analytics (assessment)

Full-stack app for browsing football players, statistics, attributes, scout reports, and dashboards. **Backend**: Node.js (Express) + PostgreSQL. **Frontend**: React (Vite) + Redux + Tailwind.

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/API.md](docs/API.md) | HTTP endpoints, auth, request/response notes |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment variables with copy-paste examples |
| [backend/README.md](backend/README.md) | API-only setup and scripts |
| [frontend/README.md](frontend/README.md) | UI dev server, build, proxy |

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **Docker** (optional, for local PostgreSQL)
- **npm** (ships with Node)

## Quick start (full stack)

### 1. Database (Docker)

From the repo root:

```bash
docker compose up -d
```

This starts PostgreSQL **16** on port **5432** with database `ase_athletics`, user/password `postgres` / `postgres` (see `docker-compose.yml`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and JWT_SECRET (see docs/ENVIRONMENT.md)

npm install
npm run dev
```

The API listens on **http://localhost:8000** (or `PORT` in `.env`). On startup it waits for the DB, runs **SQL migrations** from `backend/migrations/`, then **JS seeds** from `backend/seeds/` (each once).

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_BACKEND_URL=http://localhost:8000 if not using Vite proxy (see docs/ENVIRONMENT.md)

npm install
npm run dev
```

The app opens at **http://localhost:3000**. In dev, Vite proxies `/api/*` to the backend (see `frontend/vite.config.js`), so you can omit `VITE_BACKEND_URL` if the UI talks only through `/api`.

### 4. Use the app

1. Open http://localhost:3000  
2. **Register** a user or use seeded credentials if your seeds create test users (check `backend/seeds/`).  
3. **Log in** — JWT is stored client-side and sent as `Authorization: Bearer <token>`.

## Production build (frontend)

```bash
cd frontend
npm run build
```

Serve `frontend/dist/` behind any static host; configure the same API base URL / proxy as in production.

## Project layout

```
ase-athletics-assessment/
├── backend/           # Express API, migrations, seeds
├── frontend/          # React SPA
├── docs/              # API + environment reference
├── docker-compose.yml # Local Postgres
└── README.md          # This file
```

## License / usage

Internal assessment project
