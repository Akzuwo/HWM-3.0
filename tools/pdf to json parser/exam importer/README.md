# Exam Importer

Dieses Tool importiert Prüfungspläne aus PDF-Dateien und erzeugt JSON-Dateien, die später direkt vom Adminpanel verarbeitet werden können.

## Ordnerstruktur

```text
tools/
  pdf to json parser/
    exam importer/
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

Die Ausgabe enthält `class_id`, `source` und eine `entries`-Liste. Jeder Eintrag nutzt die Importfelder `typ`, `datum`, `enddatum`, `startzeit`, `endzeit`, `fach`, `beschreibung` und `class_id`. Zusätzlich werden `lehrperson` und `raum` mitgegeben.

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

Sportprüfungen mit Fachkürzel `SH` oder `SD` werden ignoriert. Die Beschreibung wird aus dem Text nach der Fachbezeichnung plus den folgenden Beschreibungszeilen gebildet.
