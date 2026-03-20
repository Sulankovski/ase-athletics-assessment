# ASE Athletics API - Node.js Express Backend

Node.js/Express equivalent of the FastAPI backend. Same project structure, logic, and API.

## Setup

```bash
npm install
```

## Environment

Copy `.env` and configure:

- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` - PostgreSQL
- `JWT_SECRET` - JWT signing secret

## Run

```bash
npm start
# or with auto-reload:
npm run dev
```

Server runs on `http://localhost:8000` (or `PORT` env var).

## API

- `GET /` - Health check
- `POST /auth/login` - Login (form: username, password)
- `POST /auth/register` - Register (JSON: name, email, password)
- `POST /auth/logout` - Logout (Bearer token)
- `GET /auth/me` - Current user (Bearer token)
- `GET /players?limit=10` - List players
- `GET /players/teams` - Distinct team names from DB (sorted; Bearer token)
- `GET /players/positions` - Distinct player positions from DB (sorted; Bearer token)
