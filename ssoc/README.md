# Social Summer of Code (SSOC) site

Full-stack site for Social Summer of Code, imported from
[jaysaadana5/ssoc](https://github.com/jaysaadana5/ssoc) and wired up to build
and run as a self-contained stack (including the database).

## Architecture

| Layer        | Tech                                   | Location            |
| ------------ | -------------------------------------- | ------------------- |
| Frontend     | Static HTML/CSS/JS (multi-page)        | `frontend/public/`  |
| Backend/API  | FastAPI (async)                        | `backend/server.py` |
| Database     | MongoDB (via `motor`)                  | external service    |

The frontend is a static site (the `src/` CRA scaffold is unused — see
`src/App.js`). Its JavaScript calls the API at `window.location.origin + '/api'`,
so **the frontend and the API must be served from the same origin**. To make that
work out of the box, the backend now mounts `frontend/public` at `/` and serves
the JSON API under `/api` from the same process. The `/api` routes always take
precedence over the static mount.

Default site content (site-data, footer, organizers, projects, etc.) is seeded
into MongoDB automatically the first time the relevant endpoint is read.

## Quick start (Docker — recommended)

Brings up MongoDB **and** the backend (which serves the site) with one command:

```bash
cd ssoc
docker compose up --build
```

Then open:

- Site: <http://localhost:8000>
- API:  <http://localhost:8000/api/site-data>

Data is persisted in the `mongo_data` Docker volume.

## Quick start (without Docker)

Requires Python 3.11+ and a MongoDB instance reachable via `MONGO_URL`.

```bash
cd ssoc/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # then edit MONGO_URL / DB_NAME if needed
uvicorn server:app --host 0.0.0.0 --port 8000
```

The backend reads `MONGO_URL` and `DB_NAME` from `backend/.env` (see
`.env.example`). With `SERVE_STATIC=true` (the default) it also serves the static
site, so the whole thing runs on port 8000.

## Configuration

| Variable       | Default                       | Purpose                                             |
| -------------- | ----------------------------- | --------------------------------------------------- |
| `MONGO_URL`    | *(required)*                  | MongoDB connection string                           |
| `DB_NAME`      | *(required)*                  | Database name                                       |
| `SERVE_STATIC` | `true`                        | Serve `frontend/public` from the API server         |
| `STATIC_DIR`   | `../frontend/public`          | Override the static directory to serve              |

Set `SERVE_STATIC=false` if an external ingress/CDN serves the frontend
separately (as on the original Emergent hosting).

## Frontend dev server (optional)

The static site can also be served on its own for iteration:

```bash
cd ssoc/frontend
yarn install
yarn start          # serves frontend/public on http://localhost:3000
```

Note: in this mode the API calls resolve to `http://localhost:3000/api`, so point
that origin at the backend (e.g. a dev proxy) or just use the single-origin
backend setup above.

## Tests

Backend tests live in `backend/tests/`. They target a running API/MongoDB
instance; start the stack first, then run `pytest` from `backend/`.

## Notes on this import

- `backend/requirements.txt`: the `emergentintegrations` pin (an
  Emergent-platform-only package, never imported by the code) is commented out so
  dependencies install from public PyPI. Re-enable it only when deploying on
  Emergent.
- Added for local/self-hosting: the static mount in `server.py`,
  `backend/.env.example`, `backend/Dockerfile`, and `docker-compose.yml`.
