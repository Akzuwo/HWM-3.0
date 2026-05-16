"""Add completion state for personal todos."""

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


def _column_exists(cursor: mysql.connector.cursor.MySQLCursor, table_name: str, column_name: str) -> bool:
    cursor.execute(f"SHOW COLUMNS FROM `{table_name}` LIKE %s", (column_name,))
    return cursor.fetchone() is not None


def run() -> None:
    conn = _connect()
    try:
        cursor = conn.cursor()
        try:
            if not _column_exists(cursor, "eintraege", "is_done"):
                cursor.execute("ALTER TABLE eintraege ADD COLUMN is_done TINYINT(1) NOT NULL DEFAULT 0 AFTER is_private")
            cursor.execute("UPDATE eintraege SET is_done = 0 WHERE is_done IS NULL")
            conn.commit()
        finally:
            cursor.close()
    finally:
        conn.close()


if __name__ == "__main__":
    run()
