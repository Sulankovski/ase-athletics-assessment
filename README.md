# ASE Athletics Assessment

## Quick Start

1. Copy `backend/.env.example` to `backend/.env` and adjust for your environment (local/production):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Start PostgreSQL (Docker):
   ```bash
   docker-compose up -d
   ```

3. Start the API (from project root). Migrations and seeds run automatically on startup:
   ```bash
   python -m uvicorn backend.src.main:app --reload
   ```

### API Endpoints

- **GET /** - Root/health check
- **GET /api/players** - List first 10 players (use `?limit=N` for more)
- **GET /docs** - Swagger UI documentation (Players group)
