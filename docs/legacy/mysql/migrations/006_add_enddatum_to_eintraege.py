"""Add enddatum column to eintraege and allow the 'ferien' type."""

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


def _ensure_enddatum_column(cursor: mysql.connector.cursor.MySQLCursor) -> None:
    if not _table_exists(cursor, "eintraege"):
        return

    if not _column_exists(cursor, "eintraege", "enddatum"):
        cursor.execute(
            "ALTER TABLE eintraege ADD COLUMN enddatum DATE NULL AFTER datum"
        )
    cursor.execute("UPDATE eintraege SET enddatum = datum WHERE enddatum IS NULL")


def _ensure_typ_enum(cursor: mysql.connector.cursor.MySQLCursor) -> None:
    if not _table_exists(cursor, "eintraege"):
        return

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
        values.append(item)

    if "ferien" in values:
        return

    values.append("ferien")
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
            _ensure_enddatum_column(cursor)
            _ensure_typ_enum(cursor)
            conn.commit()
        finally:
            cursor.close()
    finally:
        conn.close()


if __name__ == "__main__":
    run()
