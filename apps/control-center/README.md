# HWM Server Control Center

Electron-Desktop-App fuer den lokalen HWM-Serverbetrieb. Beim ersten Start richtet die App eine vollstaendige lokale Serverumgebung unter `%LOCALAPPDATA%\HWM Server Control Center\server` ein.

## Betriebsmodi

- `backend.exe`: empfohlen fuer normale Nutzung. Das Backend wird mit PyInstaller gebuendelt und braucht auf dem Zielsystem kein Python.
- `Python-Dateien`: Entwickler-Modus. Die App installiert/kopiert die Backend-Dateien, startet `run_local_server.py` und braucht Python plus `requirements.txt`.

## First-Run-Setup

Die App erzeugt automatisch:

```text
server/
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

Bestehende Nutzerdaten werden nicht ueberschrieben. `Setup reparieren` erstellt fehlende Ordner/Dateien neu und legt vor DB-Reparaturen ein Backup in `backups/` an.

## Entwicklung

```powershell
cd apps/control-center
npm install
npm run dev
```

## Backend-Ressourcen vorbereiten

```powershell
.\scripts\prepare_control_center_resources.ps1
```

Kopiert das Backend nach `apps/control-center/resources/backend-python` und schliesst Runtime-Daten, `.env`, SQLite-Dateien, Logs, Backups und alte MySQL-Importskripte aus.

## backend.exe bauen

```powershell
.\scripts\build_backend_exe.ps1
```

Output:

```text
apps/control-center/resources/backend-exe/backend.exe
```

## Windows-Installer bauen

Ohne neuen backend.exe-Build:

```powershell
.\scripts\build_control_center.ps1 -SkipBackendExe
```

Mit backend.exe:

```powershell
.\scripts\build_control_center.ps1 -BuildBackendExe -OpenDist
```

Die fertige Datei liegt in:

```text
apps/control-center/dist/HWM-Server-Control-Center-Setup-0.1.0.exe
```

Die Version kommt aus `apps/control-center/package.json`. Zum Erhoehen der Version dort `version` anpassen und neu bauen.
