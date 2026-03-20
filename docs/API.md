# API reference

Base URL (local): **http://localhost:8000**

All JSON bodies use `Content-Type: application/json` unless noted.

## Authentication

- **JWT access tokens** are returned by `POST /api/auth/login`.
- Send the token on protected routes as:  
  `Authorization: Bearer <access_token>`
- Tokens are tracked in the `tokens` table (`jti`); **logout** revokes the token server-side.
- **CORS**: Browser requests must come from an allowed origin (defaults: `http://localhost:3000`, `http://127.0.0.1:3000`; extend with `CORS_ALLOWED_ORIGINS` in `.env`).

| Status | Meaning |
|--------|---------|
| 400 | Validation / bad input |
| 401 | Missing or invalid JWT (`TokenInvalidOrExpiredError` and similar) |
| 403 | CORS origin not allowed |
| 404 | Resource not found (e.g. player, report) |
| 204 | Success with no body (`DELETE` player) |

Error shape (typical): `{ "detail": "Human-readable message" }`

---

## Public / health

### `GET /`

Health check. **No auth.**

**Response:** `{ "message": "ASE Athletics API", "status": "ok" }`

---

## Auth — `/api/auth`

Login and register do **not** require `Authorization`.  
`logout` and `me` require a valid Bearer token.

### `POST /api/auth/login`

**Body (JSON or form-urlencoded):**

| Field | Description |
|--------|-------------|
| `username` or `email` | User email |
| `password` | Plain password |

**Response (200):**

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

### `POST /api/auth/register`

Creates a user. **No token returned** — call `login` after register.

**Body (JSON):** `name`, `email`, `password` (per `validateUserCreate` in `backend/src/models/user.js`).

**Response (200):** User object (no password fields).

### `POST /api/auth/logout`

**Auth:** Bearer token.

Revokes the current token (`jti`).

**Response (200):** `{ "message": "Successfully logged out" }`

### `GET /api/auth/me`

**Auth:** Bearer token.

**Response (200):** Current user profile.

---

## Players — `/api/players`

**All routes require** `Authorization: Bearer <token>`.

> **Route order:** Static paths (`/search`, `/teams`, `/positions`) are registered **before** `/:id` so they are not interpreted as IDs.

### `GET /api/players`

Paginated list. Optional **filter query parameters**: any key in `SEARCH_COLUMNS` (see below) — each value is matched with **`ILIKE`** against the whole column (no `%` wildcards: **case-insensitive equality** on that field, after trim), combined with **AND**.

**Pagination:**

| Query | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `limit` | 25 | 100 |

**Filter keys** (each optional; must match column names on `players`):

`name`, `age`, `team`, `position`, `jersey_number`, `preferred_foot`, `height`, `weight`, `image_url`, `market_value`

**Example:** `GET /api/players?team=Munich&page=1&limit=10`

**Response:** `{ "players": [...], "pagination": { "page", "limit", "total", "totalPages" } }`  
Each player includes nested `stats`, `attributes`, `contract` where applicable.

### `GET /api/players/search`

Full-text-style search: **one** term searched across multiple columns with **OR** (`ILIKE '%term%'`).

| Query | Description |
|-------|-------------|
| `q` or `query` | Search term (required for non-empty results) |
| `page`, `limit` | Same as list |

**Response:** Same shape as `GET /api/players`.

### `GET /api/players/teams`

**Response:** `{ "teams": ["Team A", "Team B", ...] }` — distinct non-empty teams, sorted.

### `GET /api/players/positions`

**Response:** `{ "positions": ["Forward", ...] }` — distinct non-empty positions, sorted.

### `POST /api/players`

Creates a player with optional nested `stats`, `attributes`, `contract` (see `validatePlayerCreate` / parsers in `backend/src/models/player.js`).

**Response (201):** Full player object.

### `GET /api/players/:id`

**Response (200):** Single player with `stats`, `attributes`, `contract`.

### `PUT /api/players/:id`

Partial update. At least one of: player fields, `stats`, `attributes`, `contract` must be present.

**Response (200):** Updated player.

### `DELETE /api/players/:id`

**Response (204):** No body.

### `GET /api/players/:id/reports`

**Response:** `{ "reports": [ ... ] }` — scout reports for the player.

### `POST /api/players/:id/reports`

Creates a report. Body validated by `validateReportCreate` (`backend/src/models/report.js`).

**Response (201):** Report object.

### `PUT /api/players/:id/reports/:reportId`

Partial update; at least one allowed field required.

**Response (200):** Updated report.

---

## Dashboard — `/api/dashboard`

**Auth:** Bearer token.

### `GET /api/dashboard/stats`

Aggregated charts and KPIs for the dashboard UI. Accepts optional **filters** (applied to underlying SQL):

| Query | Aliases | Description |
|-------|---------|-------------|
| `team` | — | Exact filter on team (trimmed string) |
| `position` | — | Exact filter on position |
| `age_min` | `ageMin` | Minimum age (numeric) |
| `age_max` | `ageMax` | Maximum age (numeric) |

**Response:** Large JSON payload; keys use **snake_case** (see `toDashboardStatsResponse` in `backend/src/models/dashboard.js`), including:

- `summary` — `total_players`, `average_age`  
- `top_performers` — `goals`, `assists`, `pace`, `salary` (arrays of player snippets + `value`)  
- `distributions` — `by_team`, `by_position`  
- `goals_by_position`, `assists_by_position`  
- `age_demographics_by_team`, `upcoming_contract_expirations`  
- `radar_comparison` — players with `attributes` for the dashboard radar  
- `applied_filters` — echo of parsed filters  

See `backend/src/services/dashboard.js` for how filters narrow each query.

---

## Notes for front-end clients

- Use **`/api` prefix** consistently (matches `app.use` in `main.js` and Vite dev proxy).
- After login, store `access_token` and attach **`Authorization: Bearer ...`** to `/api/players`, `/api/dashboard`, and authenticated `/api/auth` routes.
