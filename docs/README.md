# Dokumentation

## Überblick

Homework Manager 2.0 bündelt Stundenpläne, Hausaufgabenverwaltung, Mitteilungen und Service-Seiten in einer einzigen Plattform. Das Repository enthält den Python-basierten Backend-Dienst, die lokalisierten statischen Frontends sowie Hilfsskripte für Migrationen und Datenimporte. Die Anwendung ist für den Betrieb in einer MySQL-Umgebung optimiert, stellt REST-Endpunkte für die Weboberfläche bereit und verweist für Supportanfragen auf die zentrale Adresse support@akzuwo.ch.

## Neue Funktionen in Version 2.0

* **Überarbeiteter Stundenplan-Importer:** `backend/scripts/import_schedule.py` validiert JSON-Eingaben, erzeugt einen Import-Hash und ersetzt bestehende Einträge inklusive Metadaten. Damit lassen sich mehrere Klassen nacheinander synchronisieren, ohne manuelle Bereinigungsschritte.
* **Feingranulares Rate-Limiting:** Login- und Verifikations-Endpunkte werden durch konfigurierbare Ratenbegrenzung geschützt. Die zugehörigen Umgebungsvariablen (`LOGIN_RATE_LIMIT_*`, `VERIFY_RATE_LIMIT_*`) ermöglichen eine Anpassung je Deployment.
* **Direkter Support-Kanal:** Rückmeldungen laufen gebündelt über support@akzuwo.ch; das frühere Kontaktformular wurde entfernt.
* **Account System:** Jeder Benutzer hat seinen eigenen Account. Jeder Account ist einer Klasse zugeteilt und hat eine Rolle die ihm entsprechende Rechte geben.
* **Beta- und Produktions-Workflows:** Die Basis-URL für Verifizierungslinks orientiert sich am Beta-System (`PRIMARY_TEST_BASE_URL`). Fallback-Konfigurationen sind nicht mehr notwendig, Tests erfolgen direkt gegen die Beta-Instanz.
* **Erweiterte Protokollierung:** Rotierende Logfiles (`/tmp/hwm-backend.log` per Default) erleichtern das Debugging und liefern Kontext für Supportanfragen, ohne dass der Dienst neu gestartet werden muss.

## Projektstruktur

| Pfad | Beschreibung |
| --- | --- |
| `backend/` | Flask-Anwendung inklusive Authentifizierung, Import-Logik, Tests und REST-API. |
| `backend/scripts/` | Hilfsskripte wie der Stundenplan-Importer. |
| `backend/migrations/` | SQL-Migrationsskripte für die aktuelle Datenstruktur. |
| `de/`, `en/`, `fr/`, `it/` | Lokalisierte statische Inhalte, die vom Backend ausgeliefert werden. |
| `frontend/locales/` | JSON-Übersetzungen für dynamische Frontend-Komponenten. |
| `docs/` | Projekt- und Betriebshandbücher (diese Datei). |
| `utils/` | Deployment-Helfer und Verwaltungs-Skripte. |

## Lokale Entwicklung

### Voraussetzungen

* Python 3.10 oder neuer
* MySQL 8.x oder eine kompatible MariaDB-Instanz

### Installation

```bash
cd HWM-2.0
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
```

### Konfiguration

Das Backend lädt seine Konfiguration aus `backend/.env` und aus echten Umgebungsvariablen. Die Datenbankverbindung kommt vollständig aus diesen Werten:

```bash
DB_HOST=<externer-db-host>
DB_PORT=3306
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>
```

Lege lokal zuerst `backend/.env` aus [`backend/.env.example`](../backend/.env.example) an und trage die externe aktuelle Datenbank ein. Fehlende `DB_*`-Werte stoppen den Backend-Start mit einer verständlichen Fehlermeldung. Echte Secrets gehören nur in `.env` oder Deployment-Secrets und dürfen nicht committed werden.
Für lokale Browser-Tests sollte `HWM_LOCAL_DEV=1` gesetzt bleiben; dadurch erlaubt das Backend localhost-CORS und unsichere Session-Cookies über HTTP, ohne den Auth-Debugmodus zu aktivieren. `HWM_DEBUG_MODE=1` ist nur für gezielte Debug-Flows gedacht.

Für das Frontend liegt die Beispielkonfiguration in [`frontend/.env.example`](../frontend/.env.example). Lege lokal `frontend/.env` an:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

Ohne expliziten Wert verwendet Vite im Development-Modus automatisch `http://localhost:5000`; Production-Builds verwenden weiterhin `https://hwm-api.akzuwo.ch`.

### Anwendung lokal starten

Backend:

```bash
cd HWM-3.0
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py
```

Alternativ lässt sich der Stack wie bisher über Gunicorn starten:

```bash
gunicorn --chdir backend app:app
```

Frontend:

```bash
cd HWM-3.0
npm install
npm run dev
```

Damit läuft das Frontend lokal gegen `http://localhost:5000`, während das lokal gestartete Backend die externe Datenbank aus `backend/.env` verwendet. Es wird keine lokale Datenbank, kein SQLite und kein Dummy-Storage benötigt.

Auf Windows kann alternativ das lokale Hilfsskript gestartet werden:

```powershell
.\start-local.ps1
```

Dieses Skript ist in `.gitignore` eingetragen, weil es nur für lokale Maschinen gedacht ist.

## Tests & Qualitätssicherung

Unit- und Integrationstests befinden sich im Verzeichnis `backend/tests`. Nach Aktivierung der virtuellen Umgebung lassen sich alle Tests mit `pytest` ausführen:

```bash
pytest backend/tests
```

Das Test-Setup stellt Dummy-Datenbanken bereit, sodass keine externe Infrastruktur benötigt wird.

### Manuelle QA (Passwort-Reset-Flow)

1. Öffne eine beliebige Sprachversion (`de/login.html`, `en/login.html`, `fr/login.html`, `it/login.html`) und starte den Login-Overlay.
2. Gib eine gültige oder dummy E-Mail-Adresse ein und klicke auf **„Password vergessen?“** / entsprechende Übersetzung. Prüfe, dass eine Erfolgsmeldung erscheint und der Overlay in den neuen Reset-Modus mit Code- und Passwortfeldern wechselt.
3. Teste den **„Reset-Code anfordern“**-Link innerhalb des Reset-Modus erneut; der Status sollte aktualisiert werden, ohne den Modus zu verlassen.
4. Validiere die Eingaben:
   * Leere Code-Eingabe → entsprechende Fehlermeldung.
   * Passwort kürzer als 8 Zeichen → Fehlermeldung zur Mindestlänge.
   * Abweichende Bestätigung → Fehlermeldung zur Übereinstimmung.
5. Gib einen Beispielcode (z. B. `123456`) und zwei identische Passwörter ein und bestätige. Da das Backend eventuell keinen echten Code akzeptiert, erwarte eine Fehlermeldung „Code ungültig“; bei echter Umgebung sollte eine Erfolgsmeldung erscheinen und der Overlay zurück in den Login-Modus wechseln.
6. Überprüfe, dass nach einer erfolgreichen oder simulierten Bestätigung die Login-Eingaben wieder sichtbar sind und die E-Mail erhalten bleibt, sodass ein erneuter Login möglich ist.

## Stundenplan-Import

Der CLI-Befehl [`backend/scripts/import_schedule.py`](../backend/scripts/import_schedule.py) importiert `stundenplan-<klasse>.json`-Dateien in die Tabelle `stundenplan_entries` der neuen Datenstruktur.

```bash
python backend/scripts/import_schedule.py path/zur/stundenplan-5a.json
```

Optional lässt sich die Zielklasse mit `--class <slug|id>` überschreiben sowie die Herkunftsangabe in `class_schedules.source` via `--source` setzen. Die Datenbank-Verbindung wird über die Umgebungsvariablen `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` und `DB_PORT` (Fallback: aktuelle Produktionswerte) konfiguriert.

### JSON-Format

Das Stundenplan-JSON ist ein Objekt mit Wochentags-Schlüsseln. Jeder Wochentag enthält eine Liste von Slots mit Start-/Endzeit, Fachbezeichnung und optionalem Raum.

```json
{
  "Monday": [
    {"start": "08:00", "end": "08:45", "fach": "Mathematik", "raum": "101"},
    {"start": "08:45", "end": "08:50", "fach": "Pause", "raum": "-"}
  ],
  "Tuesday": []
}
```

* Zeiten werden als Strings im Format `HH:MM` erwartet.
* `fach` ist verpflichtend, `raum` wird bei leeren Angaben automatisch zu `"-"` normalisiert.
* Nicht definierte Tage dürfen ausgelassen werden; sie werden intern als leere Listen behandelt.

Der Import löscht bestehende Einträge der Klasse und schreibt die neuen Werte inklusive Metadaten-Hash (`import_hash`) in `class_schedules`.

## Deployment & Test-Instanz

Neue Umgebungsvariablen steuern die Ratenbegrenzung der Login- und Verifikations-Endpunkte:

| Variable | Standardwert | Beschreibung |
| --- | --- | --- |
| `LOGIN_RATE_LIMIT_WINDOW` | `300` Sekunden | Zeitraum, in dem fehlgeschlagene Login-Versuche gezählt werden. |
| `LOGIN_RATE_LIMIT_MAX` | `10` Versuche | Maximal erlaubte Versuche pro IP im Fenster. |
| `VERIFY_RATE_LIMIT_WINDOW` | `3600` Sekunden | Zeitraum für `/api/auth/verify` Anfragen. |
| `VERIFY_RATE_LIMIT_MAX` | `5` Versuche | Maximal erlaubte Verifikationsversuche pro IP im Fenster. |
| `PASSWORD_RESET_REQUEST_WINDOW` | `3600` Sekunden | Zeitraum, in dem Anfragen zur Code-Erstellung pro Identität gezählt werden. |
| `PASSWORD_RESET_REQUEST_MAX` | `5` Versuche | Maximale Anzahl an Code-Anforderungen pro IP/E-Mail im Fenster. |
| `PASSWORD_RESET_VERIFY_WINDOW` | `3600` Sekunden | Zeitraum für Code-Einlösungen beim Passwort-Reset. |
| `PASSWORD_RESET_VERIFY_MAX` | `10` Versuche | Maximale Anzahl Code-Prüfungen pro IP/E-Mail im Fenster. |
| `PASSWORD_RESET_CODE_LIFETIME_SECONDS` | `900` Sekunden | Gültigkeitsdauer eines generierten Reset-Codes. |
| `PASSWORD_RESET_CODE_LENGTH` | `8` Ziffern | Länge des generierten Reset-Codes. |
| `PASSWORD_RESET_SUBJECT` | `Passwort zurücksetzen` | Betreffzeile der Reset-E-Mail. |

Die Standard-URL für E-Mail-Verifikationen orientiert sich jetzt am Beta-System. Über die Variable `PRIMARY_TEST_BASE_URL` (Standard: `https://hwm-beta.akzuwo.ch`) lässt sich die Basis anpassen; sie definiert zugleich `EMAIL_VERIFICATION_LINK_BASE`, sofern letzteres nicht explizit gesetzt wird.

Bei Deployments sollte die Beta-Instanz als primärer Testlauf genutzt werden; ein Fallback ist nicht mehr nötig.

## Support & Rückmeldungen

Technische Rückfragen, Bugreports und allgemeine Hinweise laufen zentral über [support@akzuwo.ch](mailto:support@akzuwo.ch). Bitte gib bei Produktionsvorfällen die betroffene Instanz und einen Zeitstempel an, damit Logs zielgerichtet ausgewertet werden können.

## Internationalisierung & Inhalte

Die statischen Seiten (z. B. `de/index.html`, `fr/login.html`) werden direkt vom Backend ausgeliefert. Sprachspezifische Anpassungen erfolgen in den jeweiligen Ordnern. Übersetzungen für dynamische Inhalte der modernen Oberfläche liegen in `frontend/locales/` als JSON-Dateien. Neue Sprachen werden hinzugefügt, indem sowohl ein Sprachordner mit HTML/JS-Dateien als auch ein Übersetzungspaket angelegt und im Backend registriert wird.
