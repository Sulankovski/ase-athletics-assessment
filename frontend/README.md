# ASE Athletics frontend (React + Vite)

SPA for dashboards, player profiles, compare view, scout reports, and PDF export.

## Documentation

- **[../README.md](../README.md)** — full stack quick start  
- **[../docs/API.md](../docs/API.md)** — backend endpoints  
- **[../docs/ENVIRONMENT.md](../docs/ENVIRONMENT.md)** — `VITE_*` and CORS  

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

See **Environment** below for `VITE_BACKEND_URL`.

## Development

```bash
npm run dev
```

- **URL:** http://localhost:3000  
- **API proxy:** Requests to **`/api/*`** are forwarded to **http://localhost:8000** (see `vite.config.js`). Prefer same-origin `/api/...` in dev so cookies/CORS match the backend defaults.

## Production build

```bash
npm run build
npm run preview   # optional: serve dist/ locally
```

Output: `frontend/dist/`. Configure your host to serve the SPA and point API calls at your deployed backend; set **`VITE_BACKEND_URL`** at **build time** if the client uses absolute API URLs.

## Environment

| Variable | When to set |
|----------|-------------|
| `VITE_BACKEND_URL` | When the app calls the API by full URL instead of relative `/api` (e.g. no proxy in prod). Example: `https://api.example.com` |

Leave empty in local dev if all services use `/api` through Vite.

## Path alias

`@/` → `src/` (see `vite.config.js`).

## Stack

React 18, React Router 6, Redux Toolkit, Tailwind, Chart.js / react-chartjs-2, jsPDF (profile/compare exports).
