# Schedule Importer

Dieses Tool importiert Klassenstundenpläne aus PDF-Dateien und erzeugt daraus JSON-Dateien im HWM-Stundenplanformat.

## Ordnerstruktur

```text
tools/
  pdf to json parser/
    schedule importer/
      input/
      output/
      pdf_to_json_parser.py
      README.md
      requirements.txt
```

PDF-Dateien werden in `input/` abgelegt. Für jede PDF-Datei wird in `output/` eine JSON-Datei mit gleichem Dateinamen erzeugt.

Beispiel:

```text
input/example.pdf
output/example.json
```

## Installation

```bash
pip install -r requirements.txt
```

## Verwendung

```bash
python pdf_to_json_parser.py
```

Das Script gibt am Ende aus, welche PDFs gefunden wurden, welche JSON-Dateien erstellt wurden und welche Warnungen während der Erkennung aufgetreten sind.

## Hinweis

Die Erkennung basiert auf dem aktuellen Tabellenlayout der Stundenplan-PDFs. Bei neuen oder geänderten PDF-Layouts muss die Ausgabe manuell geprüft und die Layout-Erkennung bei Bedarf angepasst werden.
