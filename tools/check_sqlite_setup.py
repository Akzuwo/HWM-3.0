from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1] / "apps" / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db import DATA_DIR, DB_PATH, init_db

IMPORTANT_TABLES = {
    "users",
    "classes",
    "eintraege",
    "stundenplan_entries",
    "todo_subtasks",
    "calendar_preferences",
    "class_schedules",
    "admin_audit_logs",
    "email_verifications",
    "password_resets",
    "weekly_preview_cache",
    "encrypted_grade_vaults",
    "timetable_exceptions",
    "school_holidays",
    "special_days",
    "special_day_lessons",
}


def main() -> int:
    init_db()
    failures: list[str] = []

    if not DATA_DIR.is_dir():
        failures.append(f"missing data directory: {DATA_DIR}")
    if not DB_PATH.is_file():
        failures.append(f"missing SQLite file: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        foreign_keys = conn.execute("PRAGMA foreign_keys").fetchone()[0]
        journal_mode = conn.execute("PRAGMA journal_mode").fetchone()[0]
        tables = {
            row["name"]
            for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }

        missing_tables = sorted(IMPORTANT_TABLES - tables)
        if missing_tables:
            failures.append(f"missing tables: {', '.join(missing_tables)}")
        if int(foreign_keys) != 1:
            failures.append("PRAGMA foreign_keys is not active")
        if str(journal_mode).lower() != "wal":
            failures.append(f"journal_mode is {journal_mode}, expected wal")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS hwm_sqlite_setup_check (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                value TEXT NOT NULL
            )
            """
        )
        cursor = conn.execute("INSERT INTO hwm_sqlite_setup_check (value) VALUES (?)", ("ok",))
        row_id = cursor.lastrowid
        row = conn.execute("SELECT value FROM hwm_sqlite_setup_check WHERE id=?", (row_id,)).fetchone()
        if row is None or row["value"] != "ok":
            failures.append("insert/select smoke check failed")
        conn.execute("DELETE FROM hwm_sqlite_setup_check WHERE id=?", (row_id,))
        conn.commit()
    except sqlite3.Error as exc:
        failures.append(f"sqlite error: {exc}")
    finally:
        conn.close()

    if failures:
        print("SQLite setup check failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"SQLite setup OK: {DB_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
