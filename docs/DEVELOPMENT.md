# Entwicklung

## Voraussetzungen

- Node.js und npm fuer das Frontend
- Python 3 fuer das Backend
- Optional `waitress` fuer produktionsnahen lokalen Backend-Start

## Frontend starten

```powershell
cd apps/frontend
npm install
npm run dev
```

Die API-Basis-URL wird zentral ueber `VITE_API_BASE_URL` gesteuert. Aktuelle Test-API:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Wenn diese Variable nicht gesetzt ist, nutzt das Frontend ebenfalls `http://localhost:5000`.

Spaetere Production-API:

```text
VITE_API_BASE_URL=https://services.akzuwo.ch:5000
```

Build:

```powershell
cd apps/frontend
npm run build
```

Vom Repo-Root funktionieren die Kurzbefehle:

```powershell
npm run dev:frontend
npm run build:frontend
```

## Backend starten

```powershell
cd apps/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Produktionsnah:

```powershell
cd apps/backend
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

Debug wird beim direkten Python-Start nur aktiv, wenn `FLASK_DEBUG=1` gesetzt ist.

## SQLite und lokale Dateien

Das Backend legt diese Ordner selbst an, falls sie fehlen:

```text
apps/backend/data/
apps/backend/logs/
apps/backend/imports/
apps/backend/exports/
apps/backend/backups/
```

Die Datenbank liegt unter `apps/backend/data/hwm.sqlite`. Diese Runtime-Dateien werden nicht committed; nur `.gitkeep` bleibt im Repo.

Backend-Check:

```powershell
python tools/check_sqlite_setup.py
```

oder:

```powershell
npm run check:backend
```

## Server-Webpanel

Lokal erreichbar:

```text
http://127.0.0.1:5050/server
http://127.0.0.1:5050/server/dashboard
http://127.0.0.1:5050/server/logs
http://127.0.0.1:5050/server/files
http://127.0.0.1:5050/server/import
```

Das Panel ist nur fuer `localhost`, `127.0.0.1` und `::1` gedacht.

## Legacy und Tools

Alte MySQL-Dumps und Migrationsskripte liegen unter `docs/legacy/mysql` und sind nicht Teil der normalen Runtime. Repo-weite Werkzeuge bleiben unter `tools/`; Backend-spezifische Importer liegen in `apps/backend/tools` oder `apps/backend/scripts`.
