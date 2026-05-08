from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

import pdfplumber


BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

DATE_PATTERN = re.compile(r"^\d{2}\.\d{2}\.\d{4}$")
TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")
EXCLUDED_SUBJECT_PREFIXES = {"SH", "SD"}


@dataclass(frozen=True)
class TextBlock:
    text: str
    x0: float
    x1: float
    top: float
    bottom: float


@dataclass(frozen=True)
class ExamEntry:
    class_id: str
    datum: str
    startzeit: str | None
    endzeit: str | None
    fach: str
    beschreibung: str
    lehrperson: str
    raum: str


def find_pdf_files(input_dir: Path) -> list[Path]:
    input_dir.mkdir(parents=True, exist_ok=True)
    return sorted(input_dir.glob("*.pdf"))


def extract_words(page: pdfplumber.page.Page) -> list[TextBlock]:
    words = page.extract_words(x_tolerance=2, y_tolerance=3, keep_blank_chars=False)
    return [
        TextBlock(
            text=word["text"].strip(),
            x0=float(word["x0"]),
            x1=float(word["x1"]),
            top=float(word["top"]),
            bottom=float(word["bottom"]),
        )
        for word in words
        if word["text"].strip()
    ]


def unique_sorted(values: Iterable[float], tolerance: float = 1.5) -> list[float]:
    result: list[float] = []
    for value in sorted(values):
        if not result or abs(result[-1] - value) > tolerance:
            result.append(value)
    return result


def join_words(words: Iterable[TextBlock]) -> str:
    return " ".join(word.text for word in sorted(words, key=lambda item: (item.top, item.x0))).strip()


def normalize_class_id(raw: str) -> str:
    raw = raw.strip()
    match = re.match(r"^([A-Z])(\d{2})([A-Z])$", raw, flags=re.IGNORECASE)
    if match:
        return f"{match.group(1).upper()}{match.group(2)}{match.group(3).lower()}"
    return raw


def detect_class_id(words: list[TextBlock], pdf_path: Path, warnings: list[str]) -> str:
    for index, word in enumerate(words):
        if word.text == "Klasse" and index + 1 < len(words):
            return normalize_class_id(words[index + 1].text)

    fallback = normalize_class_id(pdf_path.stem)
    warnings.append(f"{pdf_path.name}: Klasse nicht im Titel erkannt, verwende Dateiname '{fallback}'.")
    return fallback


def parse_date(value: str) -> str:
    return datetime.strptime(value, "%d.%m.%Y").date().isoformat()


def normalize_time(value: str) -> str | None:
    if not value or value == "00:00":
        return None
    return f"{value}:00"


def subject_prefix(fach: str) -> str:
    return fach.split("-", 1)[0].upper()


def is_excluded_subject(fach: str) -> bool:
    return subject_prefix(fach) in EXCLUDED_SUBJECT_PREFIXES


def extract_exam_from_row(
    blocks: list[TextBlock],
    row_top: float,
    next_row_top: float,
    class_id: str,
    warnings: list[str],
) -> ExamEntry | None:
    row_blocks = [block for block in blocks if row_top - 1 <= block.top < next_row_top - 1]

    date_words = [block for block in row_blocks if 45 <= block.x0 < 110 and DATE_PATTERN.match(block.text)]
    start_words = [block for block in row_blocks if 150 <= block.x0 < 195 and TIME_PATTERN.match(block.text)]
    end_words = [block for block in row_blocks if 190 <= block.x0 < 230 and TIME_PATTERN.match(block.text)]
    subject_words = [block for block in row_blocks if 230 <= block.x0 < 345]
    teacher_words = [block for block in row_blocks if 345 <= block.x0 < 470]
    room_words = [block for block in row_blocks if 470 <= block.x0 < 545]

    if not date_words or not subject_words:
        return None

    subject_words = sorted(subject_words, key=lambda item: (item.top, item.x0))
    fach = subject_words[0].text
    if is_excluded_subject(fach):
        return None

    description_words = subject_words[1:]
    beschreibung = join_words(description_words)
    if not beschreibung:
        warnings.append(f"{class_id}: Prüfung {fach} am {date_words[0].text} hat keine Beschreibung.")

    return ExamEntry(
        class_id=class_id,
        datum=parse_date(date_words[0].text),
        startzeit=normalize_time(start_words[0].text if start_words else ""),
        endzeit=normalize_time(end_words[0].text if end_words else ""),
        fach=fach,
        beschreibung=beschreibung,
        lehrperson=join_words(teacher_words),
        raum=join_words(room_words),
    )


def parse_exam_pdf(pdf_path: Path, warnings: list[str]) -> dict[str, object]:
    entries: list[ExamEntry] = []

    with pdfplumber.open(pdf_path) as pdf:
        first_page_words = extract_words(pdf.pages[0])
        class_id = detect_class_id(first_page_words, pdf_path, warnings)

        for page in pdf.pages:
            words = extract_words(page)
            row_tops = unique_sorted(
                block.top
                for block in words
                if 45 <= block.x0 < 110 and DATE_PATTERN.match(block.text)
            )

            for index, row_top in enumerate(row_tops):
                next_row_top = row_tops[index + 1] if index + 1 < len(row_tops) else row_top + 40
                entry = extract_exam_from_row(words, row_top, next_row_top, class_id, warnings)
                if entry:
                    entries.append(entry)

    return {
        "type": "exam_import",
        "source": pdf_path.name,
        "class_id": class_id,
        "entries": [
            {
                "typ": "pruefung",
                "class_id": entry.class_id,
                "datum": entry.datum,
                "enddatum": entry.datum,
                "startzeit": entry.startzeit,
                "endzeit": entry.endzeit,
                "fach": entry.fach,
                "beschreibung": entry.beschreibung,
                "lehrperson": entry.lehrperson,
                "raum": entry.raum,
            }
            for entry in entries
        ],
    }


def write_json(output_path: Path, data: dict[str, object]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pdf_files = find_pdf_files(INPUT_DIR)
    warnings: list[str] = []
    created_files: list[Path] = []

    print("Gefundene PDFs:")
    if pdf_files:
        for pdf_file in pdf_files:
            print(f"  - {pdf_file.name}")
    else:
        print("  - keine")

    for pdf_file in pdf_files:
        try:
            data = parse_exam_pdf(pdf_file, warnings)
            output_file = OUTPUT_DIR / f"{pdf_file.stem}.json"
            write_json(output_file, data)
            created_files.append(output_file)
        except Exception as exc:
            warnings.append(f"{pdf_file.name}: Verarbeitung fehlgeschlagen: {exc}")

    print("\nErstellte JSON-Dateien:")
    if created_files:
        for output_file in created_files:
            print(f"  - {output_file}")
    else:
        print("  - keine")

    print("\nWarnungen:")
    if warnings:
        for warning in warnings:
            print(f"  - {warning}")
    else:
        print("  - keine")


if __name__ == "__main__":
    main()
