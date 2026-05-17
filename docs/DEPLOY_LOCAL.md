# Lokales HWM Deployment mit Control Center

## Empfohlen: Control Center Installer

```powershell
.\scripts\build_control_center.ps1 -BuildBackendExe -OpenDist
```

Installiere danach:

```text
apps/control-center/dist/HWM-Server-Control-Center-Setup-0.1.0.exe
```

Beim ersten Start richtet die App den Server unter `%LOCALAPPDATA%\HWM Server Control Center\server` ein.

## Backend-Modus waehlen

- `backend.exe`: kein Python auf dem Zielsystem noetig.
- `Python-Dateien`: gut fuer Entwicklung; Python und `requirements.txt` werden benoetigt.

## Manuell testen

Backend-Python:

```powershell
cd apps/backend
py -3 run_local_server.py --init-only --server-home "$env:TEMP\hwm-test"
py -3 run_local_server.py --server-home "$env:TEMP\hwm-test" --api-host 127.0.0.1 --api-port 5000 --panel-host 127.0.0.1 --panel-port 5050
```

Backend-Exe:

```powershell
.\apps\control-center\resources\backend-exe\backend.exe --init-only --server-home "$env:TEMP\hwm-test-exe"
```

Checks:

```text
http://127.0.0.1:5000/healthz
http://127.0.0.1:5050/server
```

## Daten

Produktive lokale Daten liegen nur in AppData:

```text
%LOCALAPPDATA%\HWM Server Control Center\server\data\hwm.sqlite
```

Backups liegen unter `server\backups`. Build-Artefakte und Electron-Ressourcen enthalten keine echten Datenbanken, Logs oder Secrets.
