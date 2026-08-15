# Super Car Rental — Backend

A simple FastAPI backend providing user registration and login for the Super
Car Rental project. It connects to the existing MariaDB/MySQL database
(schema in `../db/db_schema.sql`) and issues JWT access tokens on login.

## Requirements

- Python 3.11+
- A running MariaDB/MySQL server.

## Database setup

Run these against your local MariaDB/MySQL server (as `root`, or another
account allowed to create databases and users):

```bash
# 1. Create the database and the app user (dev-only credentials, see below)
mysql -u root -p < db/setup_user.sql

# 2. Import the schema (tables)
mysql -u root -p supercarrental < db/db_schema.sql

# 3. (optional) Import seed data
mysql -u root -p supercarrental < db/db_data.sql
```

`db/setup_user.sql` creates the `supercarrental` database and a
`supercarrental_app` MySQL user with a fixed, shared dev password
(`supercarrental_dev_pw`). This is intentionally **not a secret** — it's a
local development credential checked into the repo so anyone cloning the
project can stand up a working database without asking anyone for
credentials. Never reuse it for a real/production deployment.

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` (the defaults already match `db/setup_user.sql`,
so this works out of the box for local dev):

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | `mysql://user:password@host:port/dbname` connection string |
| `JWT_SECRET_KEY` | Random secret used to sign JWT access tokens |
| `JWT_ALGORITHM` | JWT signing algorithm (default `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime in minutes (default `60`) |

## Running the server

```bash
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

The API is then available at `http://127.0.0.1:8000`, with interactive docs
at `http://127.0.0.1:8000/docs`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/auth/register` | Create a new user (`first_name`, `last_name`, `email`, `password`) |
| POST | `/auth/login` | Log in with `email` + `password`, returns a JWT access token |
| GET | `/auth/me` | Returns the current user; requires `Authorization: Bearer <token>` |

### Example

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane","last_name":"Doe","email":"jane@example.com","password":"secret123"}'

curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

## Project structure

```
backend/
  main.py         FastAPI app + CORS setup
  config.py        Settings loaded from .env
  database.py      SQLAlchemy engine/session
  models.py        SQLAlchemy models (User)
  schemas.py        Pydantic request/response models
  security.py       Password hashing (bcrypt) and JWT helpers
  routers/
    auth.py          /auth/register, /auth/login, /auth/me
  requirements.txt
  .env.example
```

Passwords are hashed with bcrypt before being stored; the plain password is
never persisted or logged.
