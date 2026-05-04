#!/usr/bin/env python3
"""
Schulnetz Klassenplan-PDF -> HWM Stundenplan JSON

Installation:
  py -m pip install pymupdf

Nutzung:
  py schulnetz_pdf_to_hwm_json.py Klassenplan.pdf -o stundenplan_export.json

Hinweis:
  Das Script ist bewusst halbautomatisch gedacht: Ausgabe danach kurz pruefen.
"""

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    raise SystemExit("PyMuPDF fehlt. Installiere es mit: py -m pip install pymupdf")

DAY_MAP = {
    "Montag": "Monday",
    "Dienstag": "Tuesday",
    "Mittwoch": "Wednesday",
    "Donnerstag": "Thursday",
    "Freitag": "Friday",
}
DAY_WORDS = set(DAY_MAP.keys())
TIME_RE = re.compile(r"^\d{2}:\d{2}$")

# Fachnamen etwas HWM-freundlicher machen. Kannst du beliebig erweitern.
SUBJECT_REPLACEMENTS = {
    "Wirtschaft und Recht": "Wirtschaft",
    "Bildnerisches Gestalten": "Bildnerisches Gestalten",
    "Chemie Praktikum": "Chemie prak.",
    "Physik Praktikum": "Physik prak.",
    "Physik und Anw. Mathematik (Mathematik)": "SPM-MA",
    "Physik und Anw. Mathematik (Physik)": "SPM-PS",
}

PREFIXES_TO_DROP = ["SF ", "EF ", "Freifach ", "Wahlpflicht "]


def clean_cell(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def normalize_subject(subject: str) -> str:
    subject = clean_cell(subject)
    for prefix in PREFIXES_TO_DROP:
        if subject.startswith(prefix):
            subject = subject[len(prefix):]
    for old, new in SUBJECT_REPLACEMENTS.items():
        subject = subject.replace(old, new)
    return clean_cell(subject)


def time_to_minutes(t: str) -> int:
    h, m = map(int, t.split(":"))
    return h * 60 + m


def minutes_to_time(m: int) -> str:
    return f"{m // 60:02d}:{m % 60:02d}"


def add_unique_join(old: str, new: str) -> str:
    parts = []
    for value in (old, new):
        for part in value.split("/"):
            part = clean_cell(part)
            if part and part not in parts:
                parts.append(part)
    return "/".join(parts) if parts else "-"


def extract_rows(pdf_path: Path):
    doc = fitz.open(pdf_path)
    rows = []
    current_day = None
    last_row = None

    for page in doc:
        width = page.rect.width
        words = page.get_text("words")  # x0,y0,x1,y1,text,block,line,word
        by_line = defaultdict(list)

        for x0, y0, x1, y1, text, block, line, word_no in words:
            text = clean_cell(text)
            if not text:
                continue
            # Kopf/Fusszeile grob ignorieren
            if y0 < 45 or y0 > page.rect.height - 35:
                continue
            by_line[(block, line)].append((x0, y0, x1, y1, text))

        lines = sorted(by_line.values(), key=lambda items: min(i[1] for i in items))

        for items in lines:
            items = sorted(items, key=lambda i: i[0])
            texts = [i[4] for i in items]

            # Tag steht links separat oder am Zeilenanfang
            for t in texts:
                if t in DAY_WORDS:
                    current_day = DAY_MAP[t]

            # Zeiten suchen
            times = [t for t in texts if TIME_RE.match(t)]
            if len(times) >= 2 and current_day:
                start, end = times[0], times[1]

                subject_words = []
                room_words = []
                for x0, y0, x1, y1, text in items:
                    if TIME_RE.match(text) or text in DAY_WORDS:
                        continue
                    xr = x0 / width
                    # relative Spalten aus dem Schulnetz-PDF: Fach ca. 0.34-0.56, Raum ab ca. 0.84
                    if 0.32 <= xr < 0.57:
                        subject_words.append(text)
                    elif xr >= 0.83:
                        room_words.append(text)

                subject = normalize_subject(" ".join(subject_words))
                room = clean_cell(" ".join(room_words)) or "-"

                if subject:
                    row = {"day": current_day, "start": start, "end": end, "fach": subject, "raum": room}
                    rows.append(row)
                    last_row = row
                continue

            # Mehrzeilige Fachnamen: Zeile ohne Zeit, aber in Fachspalte
            if last_row and current_day:
                subject_cont = []
                for x0, y0, x1, y1, text in items:
                    xr = x0 / width
                    if 0.32 <= xr < 0.57 and text not in DAY_WORDS:
                        subject_cont.append(text)
                cont = normalize_subject(" ".join(subject_cont))
                if cont and cont not in last_row["fach"]:
                    last_row["fach"] = clean_cell(last_row["fach"] + " " + cont)

    return rows


def merge_parallel_rows(rows):
    merged = {}
    order = []
    for r in rows:
        key = (r["day"], r["start"], r["end"])
        if key not in merged:
            merged[key] = {"start": r["start"], "end": r["end"], "fach": r["fach"], "raum": r["raum"]}
            order.append(key)
        else:
            merged[key]["fach"] = add_unique_join(merged[key]["fach"], r["fach"])
            merged[key]["raum"] = add_unique_join(merged[key]["raum"], r["raum"])
    result = defaultdict(list)
    for day, start, end in sorted(order, key=lambda k: (list(DAY_MAP.values()).index(k[0]), time_to_minutes(k[1]), time_to_minutes(k[2]))):
        result[day].append(merged[(day, start, end)])
    return result


def gap_label(start_min: int, end_min: int) -> str:
    # Kleine Luecken sind Pausen, lange Luecken ueber Mittag Mittagspause, sonst Freilektion
    if end_min - start_min <= 20:
        return "Pause"
    if start_min <= time_to_minutes("13:10") and end_min >= time_to_minutes("11:25"):
        return "Mittagspause"
    return "Freilektion"


def fill_gaps(day_entries):
    day_entries = sorted(day_entries, key=lambda e: time_to_minutes(e["start"]))
    filled = []
    prev_end = "00:00"

    for entry in day_entries:
        if time_to_minutes(entry["start"]) > time_to_minutes(prev_end):
            label = "Unterrichtsfrei" if prev_end == "00:00" else gap_label(time_to_minutes(prev_end), time_to_minutes(entry["start"]))
            filled.append({"start": prev_end, "end": entry["start"], "fach": label, "raum": "-"})
        filled.append(entry)
        prev_end = entry["end"]

    if time_to_minutes(prev_end) < time_to_minutes("23:59"):
        filled.append({"start": prev_end, "end": "23:59", "fach": "Unterrichtsfrei", "raum": "-"})
    return filled


def build_hwm_json(rows, fill_free_time=True):
    grouped = merge_parallel_rows(rows)
    output = {}
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
        entries = grouped.get(day, [])
        output[day] = fill_gaps(entries) if fill_free_time else entries
    output["Saturday"] = [{"start": "00:00", "end": "23:59", "fach": "Wochenende (Samstag)", "raum": "-"}]
    output["Sunday"] = [{"start": "00:00", "end": "23:59", "fach": "Wochenende (Sonntag)", "raum": "-"}]
    return output


def main():
    parser = argparse.ArgumentParser(description="Schulnetz-Klassenplan-PDF in HWM-JSON umwandeln")
    parser.add_argument("pdf", type=Path, help="Pfad zum Schulnetz-Klassenplan-PDF")
    parser.add_argument("-o", "--output", type=Path, default=Path("stundenplan_export.json"), help="Ausgabe-JSON")
    parser.add_argument("--no-fill-gaps", action="store_true", help="Keine Pausen/Freilektionen/Unterrichtsfrei einfuegen")
    args = parser.parse_args()

    rows = extract_rows(args.pdf)
    data = build_hwm_json(rows, fill_free_time=not args.no_fill_gaps)

    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Fertig: {args.output}")
    print("Bitte Ausgabe pruefen, besonders SF/EF/Wahlpflicht/Freifach und parallele Gruppen.")


if __name__ == "__main__":
    main()
