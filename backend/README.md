# ASE Athletics API (Node / Express)

REST API for players, auth, dashboard aggregates, and scout reports. Uses **PostgreSQL** via `pg`, **JWT** auth, and automatic **migrations + seeds** on startup.

Full endpoint descriptions: **[../docs/API.md](../docs/API.md)**  
Environment variables: **[../docs/ENVIRONMENT.md](../docs/ENVIRONMENT.md)**  
Monorepo setup: **[../README.md](../README.md)**

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` — minimum **`DATABASE_URL`** and **`JWT_SECRET`**. See `docs/ENVIRONMENT.md` for examples.

## Run

```bash
# Production-style (no file watch)
npm start

# Development (restart on file change — Node 18+)
npm run dev
```

Default URL: **http://localhost:8000** (override with `PORT`).

## Database

- **Migrations:** `migrations/*.sql` — applied once, tracked in `migrations_run`.
- **Seeds:** `seeds/*.js` — run once, tracked in `seeds_run`.
- **Init:** `src/utils/db_init.js` waits for the DB (retries), then runs migrations, then seeds.

Start Postgres locally with the repo root **`docker compose up -d`** (see root README).

## Project structure (src/)

| Path | Role |
|------|------|
| `main.js` | Express app, CORS, routes, error handler |
| `controllers/` | HTTP routers → services |
| `services/` | Business logic |
| `repositories/` | SQL queries |
| `models/` | Validation / DTO mapping |
| `middleware/` | DB client per request, auth, security helpers |
| `utils/` | DB init, JWT helpers |

## Scripts

| Script | Command |
|--------|---------|
| Start | `npm run dev` |
