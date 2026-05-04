"""Add API-backed timetable feature tables.

Run with the same database environment as the Flask backend:

    python backend/migrations/013_add_timetable_feature_tables.py
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from config import get_db_config  # noqa: E402
import mysql.connector  # noqa: E402


DDL_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS timetable_exceptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(40) NOT NULL,
        class_id INT NOT NULL,
        group_name VARCHAR(100) NULL,
        date DATE NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        lesson_number INT NULL,
        start_time VARCHAR(8) NULL,
        end_time VARCHAR(8) NULL,
        original_subject VARCHAR(255) NULL,
        new_subject VARCHAR(255) NULL,
        original_room VARCHAR(255) NULL,
        new_room VARCHAR(255) NULL,
        original_start_time VARCHAR(8) NULL,
        original_end_time VARCHAR(8) NULL,
        new_start_time VARCHAR(8) NULL,
        new_end_time VARCHAR(8) NULL,
        reason TEXT NULL,
        created_by INT NULL,
        visible_to_students TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_timetable_exceptions_lookup (class_id, start_date, end_date, date, type),
        INDEX idx_timetable_exceptions_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS school_holidays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(40) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        description TEXT NULL,
        created_by INT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_holidays_range (start_date, end_date, type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS special_days (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        scope VARCHAR(20) NOT NULL DEFAULT 'global',
        class_id INT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        mode VARCHAR(40) NOT NULL,
        description TEXT NULL,
        created_by INT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_special_days_range (scope, class_id, start_date, end_date, mode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS special_day_lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        special_day_id INT NOT NULL,
        class_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        room VARCHAR(255) NULL,
        group_name VARCHAR(100) NULL,
        start_time VARCHAR(8) NOT NULL,
        end_time VARCHAR(8) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_special_day_lessons_day (special_day_id, class_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
]


def column_exists(cursor, table: str, column: str) -> bool:
    cursor.execute(f"SHOW COLUMNS FROM {table} LIKE %s", (column,))
    return cursor.fetchone() is not None


def main() -> None:
    conn = mysql.connector.connect(**get_db_config())
    cursor = conn.cursor()
    try:
        for statement in DDL_STATEMENTS:
            cursor.execute(statement)
        if not column_exists(cursor, "stundenplan_entries", "group_name"):
            cursor.execute("ALTER TABLE stundenplan_entries ADD COLUMN group_name VARCHAR(100) NULL AFTER raum")
        if not column_exists(cursor, "stundenplan_entries", "lesson_number"):
            cursor.execute("ALTER TABLE stundenplan_entries ADD COLUMN lesson_number INT NULL AFTER tag")
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
