"""Add subtasks for personal todos."""

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


def run() -> None:
    conn = _connect()
    try:
        cursor = conn.cursor()
        try:
            if not _table_exists(cursor, "todo_subtasks"):
                cursor.execute(
                    """
                    CREATE TABLE todo_subtasks (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        todo_id INT NOT NULL,
                        owner_user_id INT NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        is_done TINYINT(1) NOT NULL DEFAULT 0,
                        sort_order INT NOT NULL DEFAULT 0,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_todo_subtasks_todo (todo_id, sort_order),
                        INDEX idx_todo_subtasks_owner (owner_user_id)
                    )
                    """
                )
            conn.commit()
        finally:
            cursor.close()
    finally:
        conn.close()


if __name__ == "__main__":
    run()
