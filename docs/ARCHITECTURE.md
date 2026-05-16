# Architektur

## Monorepo

HWM bleibt ein einzelnes GitHub-Repo. Die technische Trennung passiert ueber Ordner:

| Pfad | Zweck |
| --- | --- |
| `apps/frontend/` | React/Vite/Tailwind-App mit allen HTML-Einstiegen, `src/`, Frontend-Assets und Frontend-Konfiguration. |
| `apps/backend/` | Flask-Backend mit API, Auth, SQLite-Schicht, Schema, Server-Webpanel und Backend-Tools. |
| `apps/control-center/` | Vorbereiteter Platz fuer eine spaetere lokale Control-Center-App. |
| `packages/shared/` | Minimal vorbereiteter Bereich fuer gemeinsame Konstanten, API-Typen oder Dokumentation. |
| `docs/` | Projektunterlagen, Architektur, Entwicklung und Legacy-MySQL-Dumps/Skripte. |
| `scripts/` | Repo-weite Entwickler-Skripte. |
| `tools/` | Repo-weite Checks und Hilfswerkzeuge. |

## Frontend

Die Web-App lebt komplett in `apps/frontend`. Die bisherigen Root-HTML-Dateien sind dort geblieben, weil Vite sie als Multi-Page-Einstiege baut. Legacy-JavaScript und Assets, die noch importiert werden, liegen ebenfalls im Frontend-Bereich.

## Backend

Das Backend ist vom Frontend entkoppelt und berechnet seine Pfade relativ zu `apps/backend`. Die lokale SQLite-Datei liegt unter:

```text
apps/backend/data/hwm.sqlite
```

Das Backend darf fuer den normalen Runtime-Pfad keine MySQL-Konfiguration brauchen. Alte MySQL-Unterlagen liegen nur noch als Legacy-Material unter `docs/legacy/mysql`.

## Oeffentliche API und lokale Tools

Die Flask-API-Routen bleiben oeffentliche Anwendungsschnittstellen fuer Frontend und App. Das lokale Server-Webpanel unter `/server` ist dagegen ein Betriebspanel und nur fuer lokale Zugriffe gedacht.

Runtime-Dateien wie SQLite-Datenbanken, Logs, Imports, Exports, Backups, `dist/` und `node_modules/` werden ignoriert.
