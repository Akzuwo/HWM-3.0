"""Add private todo support to eintraege."""

from __future__ import annotations

import pathlib
import sys

import mysql.connector

BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from config import get_db_config

DB_CONFIG = get_db_config()


def _connect() -> mysql.connector.MySQLConnection:
    return mysql.connector.connect(**DB_CONFIG)


def _table_exists(cursor: mysql.connector.cursor.MySQLCursor, table_name: str) -> bool:
    cursor.execute("SHOW TABLES LIKE %s", (table_name,))
    return cursor.fetchone() is not None


def _column_exists(cursor: mysql.connector.cursor.MySQLCursor, table_name: str, column_name: str) -> bool:
    cursor.execute(f"SHOW COLUMNS FROM `{table_name}` LIKE %s", (column_name,))
    return cursor.fetchone() is not None


def _ensure_typ_enum_contains_todo(cursor: mysql.connector.cursor.MySQLCursor) -> None:
    cursor.execute("SHOW COLUMNS FROM eintraege LIKE 'typ'")
    row = cursor.fetchone()
    if not row:
        return

    column_type = row[1] or ""
    if not column_type.lower().startswith("enum("):
        return

    enum_definition = column_type[5:-1]
    values = []
    for item in enum_definition.split(","):
        item = item.strip()
        if item.startswith("'") and item.endswith("'"):
            item = item[1:-1]
        if item:
            values.append(item)

    if "todo" not in values:
        values.append("todo")

    enum_sql = ", ".join(f"'{value}'" for value in values)
    is_nullable = (row[2] or "").upper() == "YES"
    default_value = row[4]

    null_clause = " NULL" if is_nullable else " NOT NULL"
    default_clause = f" DEFAULT '{default_value}'" if default_value is not None else ""
    cursor.execute(
        f"ALTER TABLE eintraege MODIFY COLUMN typ ENUM({enum_sql}){null_clause}{default_clause}"
    )


def run() -> None:
    conn = _connect()
    try:
        cursor = conn.cursor()
        try:
            if not _table_exists(cursor, "eintraege"):
                return

            _ensure_typ_enum_contains_todo(cursor)

            if not _column_exists(cursor, "eintraege", "owner_user_id"):
                cursor.execute("ALTER TABLE eintraege ADD COLUMN owner_user_id INT NULL AFTER fach")

            if not _column_exists(cursor, "eintraege", "is_private"):
                cursor.execute("ALTER TABLE eintraege ADD COLUMN is_private TINYINT(1) NOT NULL DEFAULT 0 AFTER owner_user_id")

            cursor.execute("UPDATE eintraege SET is_private = 0 WHERE is_private IS NULL")

            cursor.execute("SHOW INDEX FROM eintraege WHERE Key_name = 'idx_eintraege_owner_private'")
            if cursor.fetchone() is None:
                cursor.execute("CREATE INDEX idx_eintraege_owner_private ON eintraege (owner_user_id, is_private)")

            cursor.execute("SHOW INDEX FROM eintraege WHERE Key_name = 'idx_eintraege_private_date'")
            if cursor.fetchone() is None:
                cursor.execute("CREATE INDEX idx_eintraege_private_date ON eintraege (is_private, datum)")

            conn.commit()
        finally:
            cursor.close()
    finally:
        conn.close()


if __name__ == "__main__":
    run()
