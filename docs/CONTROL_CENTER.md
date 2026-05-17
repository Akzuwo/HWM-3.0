# HWM Server Control Center

## Architektur

Das Control Center ist eine Electron-App unter `apps/control-center/`. Der Renderer ist React/Vite, der Main-Prozess steuert Setup, Backend-Prozess, Ordnerzugriff und sichere IPC-Methoden. Nutzerdaten werden nie in den Electron-Installationsordner geschrieben.

## Lokaler Server-Home

Windows-Pfad:

```text
%LOCALAPPDATA%\HWM Server Control Center\server
```

Struktur:

```text
backend/
data/hwm.sqlite
logs/
imports/
exports/
backups/
config/
runtime/
install-info.json
```

`install-info.json` speichert `installedVersion`, `backendMode`, `installPath`, `createdAt` und `lastUpdatedAt`.

## Backend-Modi

`backend.exe` ist der empfohlene Modus. `scripts/build_backend_exe.ps1` baut aus `apps/backend/run_local_server.py` eine PyInstaller-Datei und kopiert sie nach `apps/control-center/resources/backend-exe/backend.exe`.

`Python-Dateien` kopiert `apps/backend` nach `resources/backend-python` und beim Setup in den AppData-Backendordner. Python und `requirements.txt` muessen vorhanden bzw. installierbar sein.

## First-Run-Setup

Beim Start ruft die App `getSetupState()` auf. Wenn keine Installation existiert, erscheint der Setup-Screen:

- Backend-Modus waehlen
- Installationspfad pruefen
- Serverumgebung einrichten
- optional Python-Dependencies installieren

`initializeServerStorage()` erstellt Ordner, kopiert Backend-Dateien, fuehrt `run_local_server.py --init-only --server-home ...` oder `backend.exe --init-only --server-home ...` aus und schreibt `install-info.json`.

## SQLite

Die Datenbank liegt in:

```text
%LOCALAPPDATA%\HWM Server Control Center\server\data\hwm.sqlite
```

Initialisierung:

- `PRAGMA foreign_keys = ON`
- `PRAGMA journal_mode = WAL`
- `PRAGMA busy_timeout = 5000`
- `schema.sql` wird idempotent angewendet
- wichtige Tabellen werden per `quick_check()` geprueft

## Ports

- API: `0.0.0.0:5000`
- Health: `http://127.0.0.1:5000/healthz`
- Lokales Panel: `127.0.0.1:5050/server`

Das Panel bindet standardmaessig nur lokal.

## Sicherheit

- Renderer ohne Node Integration
- `contextIsolation` aktiv
- nur feste IPC-Aktionen
- keine beliebigen Shell-Befehle aus Renderer-Eingaben
- keine `.env`, Tokens, Logs, Datenbanken oder Backups im Electron-Paket
- Ordneroeffnung nur fuer freigegebene HWM-Verzeichnisse

## Build

```powershell
.\scripts\build_control_center.ps1 -BuildBackendExe
```

Parameter:

- `-BuildBackendExe`: baut `backend.exe` vor dem Electron-Installer
- `-SkipBackendExe`: baut ohne neuen backend.exe-Build
- `-Clean`: loescht `dist` und `dist-renderer`
- `-OpenDist`: oeffnet den Ausgabordner

Installer:

```text
apps/control-center/dist/HWM-Server-Control-Center-Setup-<version>.exe
```
