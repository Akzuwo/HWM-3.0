# HWM 3.0

Homework Manager ist jetzt als Monorepo organisiert: Web-Frontend, Flask-Backend und das vorbereitete Control Center liegen getrennt im selben GitHub-Repo.

## Struktur

```text
apps/
  frontend/        React/Vite/Tailwind-Web-App
  backend/         Flask-API, SQLite, Server-Webpanel
  control-center/  Platzhalter fuer spaetere lokale Desktop-/Server-App
packages/
  shared/          Platz fuer gemeinsame Typen, Konstanten und Verträge
docs/              Architektur, Entwicklung und Legacy-Unterlagen
scripts/           repo-weite Hilfsskripte
tools/             repo-weite Checks und Werkzeuge
```

## Frontend

```powershell
cd apps/frontend
npm install
npm run dev
npm run build
```

Die Frontend-API-Basis-URL ist zentral konfiguriert. Aktuelle Test-API:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Spaetere Production-API:

```text
VITE_API_BASE_URL=https://services.akzuwo.ch:5000
```

Alternativ vom Repo-Root:

```powershell
npm run dev:frontend
npm run build:frontend
```

## Backend

```powershell
cd apps/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Produktionsnah lokal:

```powershell
cd apps/backend
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

Die SQLite-Datenbank wird automatisch unter `apps/backend/data/hwm.sqlite` angelegt. `data/`, `logs/`, `imports/`, `exports/` und `backups/` sind Runtime-Ordner und werden nicht committed.

## Control Center

`apps/control-center` ist vorbereitet, aber noch nicht als echte App scaffolded:

```powershell
npm run dev:control
npm run build:control
```

## Checks

```powershell
npm run check:backend
npm run build:frontend
```

Weitere Details stehen in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) und [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
