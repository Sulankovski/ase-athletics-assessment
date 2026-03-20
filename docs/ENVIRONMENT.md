# Environment variables

Copy examples into **`backend/.env`** and **`frontend/.env`** (Vite reads env at build/dev time from `frontend/.env`).

---

## Backend (`backend/.env`)

Loaded from the `backend` folder (see `main.js` and `middleware/database.js`).

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection URI for the `pg` pool. |
| `JWT_SECRET` | Secret used to sign JWTs (use a long random string in production). |

### Optional

| Variable | Default / behavior |
|----------|-------------------|
| `NODE_ENV` | `development` — in **`production`**, `pg` uses SSL (`rejectUnauthorized: false`). |
| `PORT` | **8000** |
| `CORS_ALLOWED_ORIGINS` | Comma-separated extra origins (browser `Origin` header must match). Defaults already include `http://localhost:3000` and `http://127.0.0.1:3000`. |

### Example — local Docker Postgres (same as root `docker-compose.yml`)

```env
NODE_ENV=development
PORT=8000

# postgres:postgres@localhost:5432/ase_athletics
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/ase_athletics

# Generate e.g. openssl rand -base64 32
JWT_SECRET=your-dev-secret-change-me

# Optional: staging front-end origin
# CORS_ALLOWED_ORIGINS=https://app.example.com
```

### Example — cloud Postgres (illustrative)

```env
NODE_ENV=production
PORT=8000

DATABASE_URL=postgresql://user:password@db.example.com:5432/ase_athletics?sslmode=require

JWT_SECRET=<long-random-secret>

CORS_ALLOWED_ORIGINS=https://your-frontend.example.com
```

**Security notes:**

- Never commit real `.env` files; only `.env.example`.
- Rotate `JWT_SECRET` if leaked; existing tokens become invalid only after you also clear/revoke `tokens` if needed.

---

## Frontend (`frontend/.env`)

Vite exposes only variables prefixed with **`VITE_`**.

### Optional

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Absolute base URL of the API. If **unset or empty**, `frontend/src/services/api.js` uses **`/api`** (same origin — works with the Vite dev proxy). Set to e.g. `http://localhost:8000` when the app must talk to the API host directly. |

### Dev with Vite proxy (default in this repo)

`vite.config.js` proxies `/api` → `http://localhost:8000`. If your `fetch`/`axios` uses **`/api/...`** relative URLs, **`VITE_BACKEND_URL` can be empty**.

Example minimal `frontend/.env`:

```env
# Leave empty when using Vite dev proxy and relative /api paths
VITE_BACKEND_URL=
```

### Dev / prod when API is on another host

```env
VITE_BACKEND_URL=http://localhost:8000
```

Or production:

```env
VITE_BACKEND_URL=https://api.your-domain.com
```

Ensure the backend **`CORS_ALLOWED_ORIGINS`** includes your front-end origin when using a browser.

---

## Quick checklist

1. `docker compose up -d` (if using bundled Postgres)  
2. `backend/.env` → `DATABASE_URL`, `JWT_SECRET`  
3. `npm run dev` in `backend` — check console for migrations/seeds  
4. `frontend/.env` → set `VITE_BACKEND_URL` only if not using proxy + `/api`  
5. `npm run dev` in `frontend` → http://localhost:3000  
