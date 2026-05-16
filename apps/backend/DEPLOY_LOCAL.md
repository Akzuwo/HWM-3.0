# Lokaler produktionsnaher Backend-Start

Das Backend nutzt standardmaessig eine lokale SQLite-Datenbank unter:

```powershell
apps\backend\data\hwm.sqlite
```

Der Pfad wird im Code relativ zum Backend-Ordner berechnet. Es ist keine `.env`-Variable fuer den SQLite-Pfad noetig. Beim Start werden `data/`, `logs/`, `imports/` und die Datenbankdatei automatisch angelegt.

## Installation

```powershell
cd apps/backend
pip install -r requirements.txt
```

## Start mit Waitress

```powershell
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

Der Flask-Debugmodus ist fuer diesen Start nicht erforderlich. Wenn der direkte Python-Start genutzt wird, wird Debug nur aktiviert, wenn `FLASK_DEBUG=1` gesetzt ist.

## SQLite pruefen

```powershell
python ..\..\tools\check_sqlite_setup.py
```

Der Check initialisiert die Datenbank, prueft wichtige Tabellen, `PRAGMA foreign_keys`, WAL-Modus und eine kleine Insert/Select/Delete-Operation.

## Lokales Server-Webpanel

Das lokale Panel ist unter diesen Routen verfuegbar:

```text
http://localhost:5000/server
http://localhost:5000/server/dashboard
http://localhost:5000/server/logs
http://localhost:5000/server/files
http://localhost:5000/server/import
```

Zugriff ist nur von `localhost`, `127.0.0.1` oder `::1` erlaubt. Externe Anfragen erhalten `403`.

## Backup

Die Datenbank liegt nicht in einem oeffentlich ausgelieferten Ordner. Fuer ein lokales Backup reicht im gestoppten Betrieb eine Kopie dieser Dateien:

```text
apps/backend/data/hwm.sqlite
apps/backend/data/hwm.sqlite-wal
apps/backend/data/hwm.sqlite-shm
```

Wenn der Server laeuft, sollte ein konsistentes Backup ueber SQLite erstellt werden, z. B. mit dem `sqlite3`-CLI-Befehl `.backup`.

## Import alter Daten

Alte SQLite-DB-Dateien koennen in `apps/backend/imports/` abgelegt oder ueber `/server/import` hochgeladen werden. Der Import laeuft nie automatisch beim App-Start. Vor dem Import zeigt das Panel Tabellen, Datensatzanzahlen und ID-Konflikte an. Als Konfliktstrategie stehen `ueberspringen`, `ueberschreiben` und `abbrechen` zur Auswahl.

## Manuelle Smoke-Checks

- Start ohne externe Datenbank-Umgebungswerte.
- `/healthz` muss `200` liefern.
- Nach Login oder Test-Session muss `/api/me` `200` liefern.
- Admin-Routen wie `/api/admin/classes` muessen SQLite-Daten lesen/schreiben.
- `/api/todos` muss private To-dos erstellen und lesen.
- `/server/dashboard` muss lokal `200` liefern.
- `/server/dashboard` muss von nicht-lokaler Adresse `403` liefern.
- `/server/import/preview` muss fuer eine Datei in `apps/backend/imports/` eine Vorschau anzeigen.
