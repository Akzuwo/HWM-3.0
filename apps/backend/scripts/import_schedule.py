#!/usr/bin/env python3
"""CLI helper to import class schedules from JSON into the database."""

from __future__ import annotations

import argparse
import datetime as _dt
import pathlib
import sys
from typing import Iterable, List, Tuple

BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from db import get_db_connection, init_db
from schedule_importer import (
    ScheduleImportError,
    load_schedule_from_path,
    import_schedule as perform_import,
)


def import_schedule(path: pathlib.Path, *, class_identifier: str | None, source: str) -> Tuple[int, str]:
    schedule = load_schedule_from_path(path)
    imported_at = _dt.datetime.utcnow()

    init_db()
    conn = get_db_connection()
    try:
        identifier = class_identifier or path.stem.replace("stundenplan-", "", 1)
        if not identifier:
            raise ScheduleImportError("Unable to determine class identifier. Use --class.")

        inserted, import_hash, _ = perform_import(
            conn,
            identifier,
            schedule,
            source,
            imported_at=imported_at,
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    return inserted, import_hash


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import class schedules from JSON files")
    parser.add_argument("files", nargs="+", help="Path(s) to stundenplan-<klasse>.json")
    parser.add_argument(
        "--class",
        dest="class_identifier",
        help="Override class identifier (slug or numeric id). Defaults to the value derived from the filename.",
    )
    parser.add_argument(
        "--source",
        default="cli-import",
        help="Source label stored with the class_schedules entry (default: cli-import)",
    )
    return parser.parse_args(argv)


def main(argv: Iterable[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    summary: List[Tuple[pathlib.Path, int, str]] = []

    for filename in args.files:
        path = pathlib.Path(filename).expanduser().resolve()
        if not path.is_file():
            raise ScheduleImportError(f"File not found: {path}")
        inserted, import_hash = import_schedule(path, class_identifier=args.class_identifier, source=args.source)
        summary.append((path, inserted, import_hash))

    for path, inserted, import_hash in summary:
        print(f"Imported {inserted} entries from {path.name} (hash={import_hash})")
    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    try:
        raise SystemExit(main())
    except ScheduleImportError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
