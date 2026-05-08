from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import pdfplumber


BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

LESSON_TIMES = [
    ("07:10", "07:55"),
    ("08:00", "08:45"),
    ("08:50", "09:35"),
    ("09:50", "10:35"),
    ("10:40", "11:25"),
    ("11:30", "12:15"),
    ("12:20", "13:05"),
    ("13:10", "13:55"),
    ("14:00", "14:45"),
    ("15:00", "15:45"),
    ("15:50", "16:35"),
    ("16:40", "17:25"),
    ("17:30", "18:15"),
    ("18:30", "19:15"),
    ("19:20", "20:05"),
    ("20:10", "20:55"),
]

SUBJECT_MAPPING = {
    "MA": "Mathematik",
    "DE": "Deutsch",
    "EN": "Englisch",
    "FR": "Französisch",
    "IT": "Italienisch",
    "GS": "Geschichte",
    "CH": "Chemie",
    "PH": "Physik",
    "BG": "Bildnerisches Gestalten",
    "MU": "Musik",
    "WR": "Wirtschaft",
    "PS": "Psychologie",
    "PSP": "Psychologie/Pädagogik",
    "SB": "Sport",
    "SD": "Sport",
    "SH": "Sport",
    "KS": "Klassenstunde",
    "SWR": "Schwerpunktfach",
    "WPS": "Wahlpflicht/Spezialfach",
    "FF": "Freifach",
}

ROOM_PATTERN = re.compile(r"^(?:[A-Z]?\d[\dA-Z./,]*|T\d+|E\d+|Ruo[A-Z]|div\.|[-])$")
SUBJECT_CODE_PATTERN = re.compile(r"^[A-ZÄÖÜ]{2,4}")
TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")
BLUE_FILL = (0.721569, 0.854902, 0.94902)
GERMAN_DAY_NAMES = {
    "Montag": "Monday",
    "Dienstag": "Tuesday",
    "Mittwoch": "Wednesday",
    "Donnerstag": "Thursday",
    "Freitag": "Friday",
    "Samstag": "Saturday",
    "Sonntag": "Sunday",
}
FOCUS_SUBJECT_ORDER = ["SBC", "SWR", "SBG"]


@dataclass(frozen=True)
class TextBlock:
    text: str
    x0: float
    x1: float
    top: float
    bottom: float

    @property
    def center_x(self) -> float:
        return (self.x0 + self.x1) / 2

    @property
    def center_y(self) -> float:
        return (self.top + self.bottom) / 2


@dataclass(frozen=True)
class LessonBlock:
    start: str
    end: str
    fach: str
    raum: str
    focus_family: str | None = None


@dataclass(frozen=True)
class RectBlock:
    x0: float
    x1: float
    top: float
    bottom: float
    fill: tuple[float, ...] | None


def find_pdf_files(input_dir: Path) -> list[Path]:
    input_dir.mkdir(parents=True, exist_ok=True)
    return sorted(input_dir.glob("*.pdf"))


def extract_text_blocks(page: pdfplumber.page.Page) -> list[TextBlock]:
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


def extract_rect_blocks(page: pdfplumber.page.Page) -> list[RectBlock]:
    return [
        RectBlock(
            x0=float(rect["x0"]),
            x1=float(rect["x1"]),
            top=float(rect["top"]),
            bottom=float(rect["bottom"]),
            fill=tuple(rect["non_stroking_color"])
            if isinstance(rect.get("non_stroking_color"), tuple)
            else None,
        )
        for rect in page.rects
    ]


def unique_sorted(values: Iterable[float], tolerance: float = 1.0) -> list[float]:
    result: list[float] = []
    for value in sorted(values):
        if not result or abs(result[-1] - value) > tolerance:
            result.append(value)
    return result


def detect_day_columns(page: pdfplumber.page.Page) -> list[tuple[float, float]]:
    vertical_lines = [
        line["x0"]
        for line in page.lines
        if abs(line["x0"] - line["x1"]) < 0.5 and line["height"] > 400
    ]
    boundaries = unique_sorted(vertical_lines)
    if len(boundaries) >= 8:
        return [(boundaries[index], boundaries[index + 1]) for index in range(7)]

    raise ValueError("Konnte die sieben Tagesspalten im PDF nicht zuverlässig erkennen.")


def detect_lesson_rows(page: pdfplumber.page.Page) -> list[tuple[float, float]]:
    horizontal_lines = [
        line["top"]
        for line in page.lines
        if abs(line["y0"] - line["y1"]) < 0.5 and 35 <= line["width"] <= 60
    ]
    boundaries = unique_sorted(horizontal_lines)
    lesson_boundaries = [value for value in boundaries if value >= 55]
    if len(lesson_boundaries) >= len(LESSON_TIMES) + 1:
        return [
            (lesson_boundaries[index], lesson_boundaries[index + 1])
            for index in range(len(LESSON_TIMES))
        ]

    raise ValueError("Konnte die Lektionen/Zeitfenster im PDF nicht zuverlässig erkennen.")


def is_blue_fill(fill: tuple[float, ...] | None) -> bool:
    if fill is None or len(fill) != len(BLUE_FILL):
        return False
    return all(abs(actual - expected) < 0.01 for actual, expected in zip(fill, BLUE_FILL))


def overlaps_vertically(top: float, bottom: float, rect: RectBlock) -> bool:
    return min(bottom, rect.bottom) - max(top, rect.top) > 1


def is_blue_marked_row(top: float, bottom: float, rects: Sequence[RectBlock]) -> bool:
    for rect in rects:
        if not is_blue_fill(rect.fill):
            continue
        if rect.x0 <= 300 <= rect.x1 and overlaps_vertically(top, bottom, rect):
            return True
    return False


def blocks_in_cell(
    blocks: list[TextBlock],
    column: tuple[float, float],
    row: tuple[float, float],
) -> list[TextBlock]:
    left, right = column
    top, bottom = row
    return [
        block
        for block in blocks
        if block.x0 >= left + 1
        and block.x1 <= right - 1
        and block.top >= top + 1
        and block.bottom <= bottom - 1
    ]


def group_lines(blocks: list[TextBlock]) -> list[list[TextBlock]]:
    lines: list[list[TextBlock]] = []
    for block in sorted(blocks, key=lambda item: (item.center_y, item.x0)):
        for line in lines:
            if abs(line[0].center_y - block.center_y) <= 4:
                line.append(block)
                break
        else:
            lines.append([block])

    for line in lines:
        line.sort(key=lambda item: item.x0)
    return lines


def is_teacher_suffix(text: str) -> bool:
    return text.startswith("(") and text.endswith(")")


def is_room_token(text: str) -> bool:
    normalized = text.strip()
    return bool(ROOM_PATTERN.match(normalized)) or "..." in normalized


def normalize_subject_code(text: str) -> str:
    cleaned = re.sub(r"\([^)]*\)", "", text).strip()
    cleaned = cleaned.split("-", 1)[0].strip()
    cleaned = re.sub(r"[^A-ZÄÖÜ]", "", cleaned)
    return cleaned


def parse_subject(text: str, warnings: list[str]) -> str | None:
    if is_teacher_suffix(text) or is_room_token(text):
        return None

    match = SUBJECT_CODE_PATTERN.match(text)
    code = normalize_subject_code(match.group(0) if match else text)
    if not code:
        return None

    mapped = SUBJECT_MAPPING.get(code)
    if mapped:
        return mapped

    fallback = normalize_subject_code(text) or text
    warnings.append(f"Unbekanntes Fachkürzel '{code}' in Block '{text}', verwende '{fallback}'.")
    return fallback


def nearest_room(subject: TextBlock, room_blocks: list[TextBlock]) -> str:
    if not room_blocks:
        return "-"

    room = min(room_blocks, key=lambda block: abs(block.center_x - subject.center_x))
    return room.text.strip() or "-"


def unique_join(values: Iterable[str]) -> str:
    result: list[str] = []
    for value in values:
        if value and value not in result:
            result.append(value)
    return "/".join(result) if result else "-"


def ordered_join(values: Iterable[str]) -> str:
    result = [value for value in values if value]
    return "/".join(result) if result else "-"


def parse_cell(
    cell_blocks: list[TextBlock],
    row: tuple[float, float],
    warnings: list[str],
) -> tuple[str, str] | None:
    if not cell_blocks:
        return None

    row_mid = (row[0] + row[1]) / 2
    lines = group_lines(cell_blocks)
    room_blocks = [
        block
        for line in lines
        for block in line
        if block.center_y <= row_mid and is_room_token(block.text)
    ]

    subjects: list[tuple[str, str]] = []
    for block in sorted(cell_blocks, key=lambda item: (item.center_y, item.x0)):
        if block.center_y < row_mid - 1:
            continue
        fach = parse_subject(block.text, warnings)
        if fach:
            subjects.append((fach, nearest_room(block, room_blocks)))

    if not subjects:
        return None

    return unique_join(fach for fach, _ in subjects), unique_join(raum for _, raum in subjects)


def merge_lesson_blocks(blocks: list[LessonBlock]) -> list[LessonBlock]:
    merged: dict[tuple[str, str], list[LessonBlock]] = {}
    for block in blocks:
        merged.setdefault((block.start, block.end), []).append(block)

    result: list[LessonBlock] = []
    for (start, end), group in merged.items():
        result.append(
            LessonBlock(
                start=start,
                end=end,
                fach=unique_join(item.fach for item in group),
                raum=unique_join(item.raum for item in group),
            )
        )
    return sorted(result, key=lambda item: time_to_minutes(item.start))


def merge_list_lesson_blocks(
    blocks: list[LessonBlock],
    focus_families: set[str],
) -> list[LessonBlock]:
    merged: dict[tuple[str, str], list[LessonBlock]] = {}
    for block in blocks:
        merged.setdefault((block.start, block.end), []).append(block)

    result: list[LessonBlock] = []
    for (start, end), group in merged.items():
        present_focus: dict[str, list[LessonBlock]] = {}
        for block in group:
            if block.focus_family is not None:
                present_focus.setdefault(block.focus_family, []).append(block)

        normal_blocks = [block for block in group if block.focus_family is None]

        if present_focus:
            ordered_focus: list[LessonBlock] = []
            for family in FOCUS_SUBJECT_ORDER:
                if family not in focus_families:
                    continue
                existing_blocks = present_focus.get(family)
                if existing_blocks:
                    ordered_focus.append(
                        LessonBlock(
                            start,
                            end,
                            unique_join(block.fach for block in existing_blocks),
                            unique_join(block.raum for block in existing_blocks),
                            family,
                        )
                    )
                else:
                    ordered_focus.append(LessonBlock(start, end, f"{family} Frei", "-", family))

            for family, blocks_for_family in present_focus.items():
                if family not in FOCUS_SUBJECT_ORDER:
                    ordered_focus.append(
                        LessonBlock(
                            start,
                            end,
                            unique_join(block.fach for block in blocks_for_family),
                            unique_join(block.raum for block in blocks_for_family),
                            family,
                        )
                    )

            result.append(
                LessonBlock(
                    start=start,
                    end=end,
                    fach=unique_join(
                        [block.fach for block in ordered_focus]
                        + [block.fach for block in normal_blocks]
                    ),
                    raum=ordered_join(
                        [block.raum for block in ordered_focus]
                        + [block.raum for block in normal_blocks]
                    ),
                )
            )
            continue

        result.append(
            LessonBlock(
                start=start,
                end=end,
                fach=unique_join(block.fach for block in group),
                raum=unique_join(block.raum for block in group),
            )
        )

    return sorted(result, key=lambda item: time_to_minutes(item.start))


def merge_split_words(words: list[TextBlock]) -> str:
    return " ".join(word.text for word in sorted(words, key=lambda item: item.x0)).strip()


def time_to_minutes(value: str) -> int:
    hours, minutes = value.split(":", 1)
    return int(hours) * 60 + int(minutes)


def make_free_block(start: str, end: str, label: str) -> dict[str, str]:
    return {"start": start, "end": end, "fach": label, "raum": "-"}


def label_gap(start: str, end: str) -> str:
    gap = time_to_minutes(end) - time_to_minutes(start)
    if gap <= 20:
        return "Pause"

    midday_start = time_to_minutes("11:25")
    midday_end = time_to_minutes("13:10")
    if time_to_minutes(start) < midday_end and time_to_minutes(end) > midday_start:
        return "Mittagspause"

    return "Unterrichtsfrei"


def fill_free_times(day_name: str, lessons: list[LessonBlock]) -> list[dict[str, str]]:
    if not lessons and day_name in {"Saturday", "Sunday"}:
        german_name = "Samstag" if day_name == "Saturday" else "Sonntag"
        return [make_free_block("00:00", "23:59", f"Wochenende ({german_name})")]

    if not lessons:
        return [make_free_block("00:00", "23:59", "Unterrichtsfrei")]

    result: list[dict[str, str]] = []
    current = "00:00"
    for lesson in lessons:
        if time_to_minutes(lesson.start) > time_to_minutes(current):
            result.append(make_free_block(current, lesson.start, label_gap(current, lesson.start)))

        result.append(
            {
                "start": lesson.start,
                "end": lesson.end,
                "fach": lesson.fach,
                "raum": lesson.raum,
            }
        )
        current = lesson.end

    if time_to_minutes(current) < time_to_minutes("23:59"):
        result.append(make_free_block(current, "23:59", "Unterrichtsfrei"))

    return result


def detect_list_layout(blocks: list[TextBlock]) -> bool:
    headers = {"Beginn", "Ende", "Fach", "Lehrperson", "Raum"}
    found = {block.text for block in blocks if block.top < 140}
    return len(headers & found) >= 4


def detect_day_markers(blocks: list[TextBlock]) -> list[tuple[float, str]]:
    markers: list[tuple[float, str]] = []
    for block in blocks:
        day = GERMAN_DAY_NAMES.get(block.text)
        if day and block.x0 < 170:
            markers.append((block.top, day))
    return sorted(markers, key=lambda item: item[0])


def day_for_row(row_top: float, markers: list[tuple[float, str]], current_day: str | None) -> str | None:
    for marker_top, day in markers:
        if marker_top <= row_top + 3:
            current_day = day
        else:
            break
    return current_day


def normalize_list_subject(subject: str) -> str:
    subject = re.sub(r"\s+", " ", subject).strip()
    return subject


def is_blacklisted_list_subject(subject: str) -> bool:
    normalized = subject.lower()
    return (
        normalized.startswith("freifach")
        or normalized == "perkussion"
        or normalized.startswith("wahlpflicht")
    )


def normalize_focus_subject(subject: str, room: str) -> LessonBlock | None:
    subject = normalize_list_subject(subject)
    subject_without_parentheses = re.sub(r"\s*\([^)]*\)", "", subject).strip()

    if subject_without_parentheses.startswith("EF "):
        return LessonBlock("", "", "Ergänzungsfächer", "diverse")

    if not subject_without_parentheses.startswith("SF "):
        return None

    if subject_without_parentheses == "SF Biologie und Chemie":
        parenthetical = " ".join(re.findall(r"\(([^)]*)\)", subject)).lower()
        if "chemie" in parenthetical:
            return LessonBlock("", "", "SBC-CH", room, "SBC")
        if "bio" in parenthetical:
            return LessonBlock("", "", "SBC-BI", room, "SBC")
        return LessonBlock("", "", "SBC", room, "SBC")

    if subject_without_parentheses == "SF Wirtschaft und Recht":
        return LessonBlock("", "", "SWR", room, "SWR")

    if subject_without_parentheses == "SF Bildnerisches Gestalten":
        return LessonBlock("", "", "SBG", room, "SBG")

    focus_name = subject_without_parentheses.removeprefix("SF ").strip() or "Schwerpunktfach"
    focus_code = re.sub(r"[^A-ZÄÖÜ]", "", focus_name.upper())[:4] or "SF"
    return LessonBlock("", "", focus_name, room, focus_code)


def normalize_list_lesson(start: str, end: str, subject: str, room: str) -> LessonBlock | None:
    if is_blacklisted_list_subject(subject):
        return None

    focus_lesson = normalize_focus_subject(subject, room)
    if focus_lesson:
        return LessonBlock(
            start=start,
            end=end,
            fach=focus_lesson.fach,
            raum=focus_lesson.raum,
            focus_family=focus_lesson.focus_family,
        )

    clean_subject = re.sub(r"\s*\([^)]*\)", "", subject).strip()
    return LessonBlock(start=start, end=end, fach=clean_subject, raum=room)


def extract_list_row(
    blocks: list[TextBlock],
    row_top: float,
    next_row_top: float,
) -> LessonBlock | None:
    row_blocks = [block for block in blocks if row_top - 1 <= block.top < next_row_top - 1]
    start_words = [block for block in row_blocks if 175 <= block.x0 < 235 and TIME_PATTERN.match(block.text)]
    end_words = [block for block in row_blocks if 235 <= block.x0 < 292 and TIME_PATTERN.match(block.text)]
    if not start_words or not end_words:
        return None

    subject_words = [block for block in row_blocks if 292 <= block.x0 < 462]
    room_words = [block for block in row_blocks if 674 <= block.x0 < 790]
    subject = normalize_list_subject(merge_split_words(subject_words))
    room = merge_split_words(room_words) or "-"

    if not subject:
        return None

    start = start_words[0].text
    end = end_words[0].text
    if start == end or start == "00:00" and end == "23:59":
        return None

    return normalize_list_lesson(start, end, subject, room)


def parse_list_layout_pdf(pdf: pdfplumber.PDF, warnings: list[str]) -> dict[str, list[dict[str, str]]]:
    lessons_by_day: dict[str, list[LessonBlock]] = {day: [] for day in DAY_NAMES}
    current_day: str | None = None

    for page in pdf.pages:
        blocks = extract_text_blocks(page)
        rects = extract_rect_blocks(page)
        markers = detect_day_markers(blocks)

        start_times = sorted(
            (
                block
                for block in blocks
                if 175 <= block.x0 < 235 and TIME_PATTERN.match(block.text)
            ),
            key=lambda block: block.top,
        )
        row_tops = unique_sorted((block.top for block in start_times), tolerance=2.5)
        row_tops = [top for top in row_tops if top < 545]

        for index, row_top in enumerate(row_tops):
            next_row_top = row_tops[index + 1] if index + 1 < len(row_tops) else row_top + 16
            row_bottom = min(next_row_top, row_top + 12.5)
            current_day = day_for_row(row_top, markers, current_day)
            if current_day is None:
                warnings.append(
                    f"Zeile bei y={row_top:.1f} konnte keinem Wochentag zugeordnet werden."
                )
                continue

            if is_blue_marked_row(row_top, row_bottom, rects):
                continue

            lesson = extract_list_row(blocks, row_top, next_row_top)
            if lesson:
                lessons_by_day[current_day].append(lesson)

    focus_families = {
        lesson.focus_family
        for lessons in lessons_by_day.values()
        for lesson in lessons
        if lesson.focus_family is not None
    }

    return {
        day: fill_free_times(day, merge_list_lesson_blocks(lessons, focus_families))
        for day, lessons in lessons_by_day.items()
    }


def parse_pdf(pdf_path: Path, warnings: list[str]) -> dict[str, list[dict[str, str]]]:
    lessons_by_day: dict[str, list[LessonBlock]] = {day: [] for day in DAY_NAMES}

    with pdfplumber.open(pdf_path) as pdf:
        first_page_blocks = extract_text_blocks(pdf.pages[0])
        if detect_list_layout(first_page_blocks):
            return parse_list_layout_pdf(pdf, warnings)

        for page_number, page in enumerate(pdf.pages, start=1):
            blocks = extract_text_blocks(page)
            columns = detect_day_columns(page)
            rows = detect_lesson_rows(page)

            for day_index, day_name in enumerate(DAY_NAMES):
                for lesson_index, row in enumerate(rows):
                    cell = blocks_in_cell(blocks, columns[day_index], row)
                    parsed = parse_cell(cell, row, warnings)
                    if not parsed:
                        continue

                    fach, raum = parsed
                    start, end = LESSON_TIMES[lesson_index]
                    lessons_by_day[day_name].append(LessonBlock(start, end, fach, raum))

            if page_number > 1:
                warnings.append(
                    f"{pdf_path.name}: Seite {page_number} wurde verarbeitet; bitte Mehrseiten-PDF manuell prüfen."
                )

    return {
        day: fill_free_times(day, merge_lesson_blocks(lessons))
        for day, lessons in lessons_by_day.items()
    }


def write_json(output_path: Path, data: dict[str, list[dict[str, str]]]) -> None:
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
            data = parse_pdf(pdf_file, warnings)
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
