"""Ensure the eintraege table can store shared IDs across multiple classes."""

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


def _primary_key_columns(cursor: mysql.connector.cursor.MySQLCursor, table_name: str) -> list[str]:
    cursor.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
          AND INDEX_NAME = 'PRIMARY'
        ORDER BY SEQ_IN_INDEX
        """,
        (table_name,),
    )
    return [row[0] for row in cursor.fetchall()]


def _ensure_composite_primary_key(cursor: mysql.connector.cursor.MySQLCursor) -> None:
    if not _table_exists(cursor, "eintraege"):
        return

    pk_columns = _primary_key_columns(cursor, "eintraege")
    if pk_columns == ["id", "class_id"]:
        return

    if pk_columns:
        cursor.execute("ALTER TABLE eintraege DROP PRIMARY KEY")

    cursor.execute("ALTER TABLE eintraege ADD PRIMARY KEY (id, class_id)")
    cursor.execute("ALTER TABLE eintraege MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT")


def run() -> None:
    conn = _connect()
    try:
        cursor = conn.cursor()
        try:
            _ensure_composite_primary_key(cursor)
            conn.commit()
        finally:
            cursor.close()
    finally:
        conn.close()


if __name__ == "__main__":
    run()
