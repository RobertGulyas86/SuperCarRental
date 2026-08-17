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
| `UPLOAD_DIR` | Local folder where uploaded car images are stored (default `uploads`, relative to `backend/`) |
| `MAX_UPLOAD_SIZE_MB` | Max accepted image size in MB (default `5`) |

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
| POST | `/auth/register` | Create a new user (`first_name`, `last_name`, `email`, `phone_number`, `password`) |
| POST | `/auth/login` | Log in with `email` + `password`, returns a JWT access token |
| GET | `/auth/me` | Returns the current user; requires `Authorization: Bearer <token>` |
| GET | `/cars` | List cars |
| GET | `/cars/{car_id}` | Get a single car |
| POST | `/cars` | Create a car (employee only) |
| PUT | `/cars/{car_id}` | Update a car (employee only) |
| DELETE | `/cars/{car_id}` | Delete a car (employee only) |
| GET | `/cars/{car_id}/images` | List a car's images |
| GET | `/cars/{car_id}/images/{image_id}` | Get a single car image |
| POST | `/cars/{car_id}/images` | Register an image by path/URL, no file bytes (employee only) |
| POST | `/cars/{car_id}/images/upload` | Upload an image file (`multipart/form-data`: `file`, `is_primary`) (employee only) |
| PUT | `/cars/{car_id}/images/{image_id}` | Update a car image's metadata (employee only) |
| DELETE | `/cars/{car_id}/images/{image_id}` | Delete a car image (also removes the file from disk if it was uploaded) (employee only) |

Employee-only endpoints require `Authorization: Bearer <token>` for a user
with `role = employee`; car/image reads are public. `Car.has_highway_vignette`
tracks whether the vehicle comes with a highway vignette.

**Image storage:** uploaded files are saved to disk under `UPLOAD_DIR`
(default `backend/uploads/`, gitignored), namespaced per car as
`uploads/cars/{car_id}/<random-name>.<ext>`. They're served back at
`/uploads/cars/{car_id}/<file>` via a static file mount, and that's the URL
stored in `car_images.image_path`. Accepted types: JPEG, PNG, WebP, GIF, up to
`MAX_UPLOAD_SIZE_MB`. This is local-disk storage suited for local dev/single
server — swap for S3/object storage before any real deployment.

### Example

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane","last_name":"Doe","email":"jane@example.com","phone_number":"+36301234567","password":"secret123"}'

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
  models.py        SQLAlchemy models (User, Car, CarImage)
  schemas.py        Pydantic request/response models
  security.py       Password hashing (bcrypt) and JWT helpers
  routers/
    auth.py          /auth/register, /auth/login, /auth/me
    cars.py           /cars CRUD
    car_images.py      /cars/{car_id}/images CRUD
  requirements.txt
  .env.example
```

Passwords are hashed with bcrypt before being stored; the plain password is
never persisted or logged.
