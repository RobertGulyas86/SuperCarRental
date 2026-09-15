# Super Car Rental

Autókölcsönző marketplace alkalmazás: FastAPI backend + MariaDB/MySQL adatbázis +
React (Vite, TypeScript) frontend.

- `backend/` — FastAPI API (regisztráció/login, autók, autóképek, bérlések). Részletek: [backend/README.md](backend/README.md)
- `frontend/` — React + TypeScript + Vite kliens. Részletek: [frontend/README.md](frontend/README.md)
- `db/` — MariaDB/MySQL séma és seed adatok (`db_schema.sql`, `db_data.sql`, `setup_user.sql`)
- `docs/` — Részletes, képekkel illusztrált projekt dokumentáció: [docs/PROJEKT_DOKUMENTACIO.md](docs/PROJEKT_DOKUMENTACIO.md)

## Gyors indítás

### 1. Adatbázis

```bash
mysql -u root -p < db/setup_user.sql
mysql -u root -p supercarrental < db/db_schema.sql
mysql -u root -p supercarrental < db/db_data.sql   # opcionális, teszt adatok
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Elérhető: `http://127.0.0.1:8000` (interaktív dokumentáció: `http://127.0.0.1:8000/docs`).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Elérhető: `http://localhost:5173` (Vite alapértelmezett portja).

## Elérhető npm szkriptek (frontend)

| Parancs | Leírás |
| --- | --- |
| `npm run dev` | Fejlesztői szerver indítása HMR-rel |
| `npm run build` | Típusellenőrzés + production build |
| `npm run lint` | Oxlint futtatása |
| `npm run preview` | Elkészült build helyi előnézete |
