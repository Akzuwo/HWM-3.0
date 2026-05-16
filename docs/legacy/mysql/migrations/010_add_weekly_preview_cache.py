"""Add weekly preview cache table."""

from __future__ import annotations

import mysql.connector

from config import get_db_config


def run() -> None:
    conn = mysql.connector.connect(**get_db_config())
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS weekly_preview_cache (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                class_id VARCHAR(20) NOT NULL,
                locale VARCHAR(8) NOT NULL,
                window_start DATE NOT NULL,
                window_end DATE NOT NULL,
                include_todos TINYINT(1) NOT NULL DEFAULT 1,
                summary_markdown MEDIUMTEXT NOT NULL,
                source_hash CHAR(64) NOT NULL,
                created_at DATETIME NOT NULL,
                expires_at DATETIME NOT NULL,
                INDEX idx_weekly_preview_lookup (user_id, class_id, locale, window_start, window_end, include_todos, expires_at),
                INDEX idx_weekly_preview_user_created (user_id, created_at),
                CONSTRAINT fk_weekly_preview_cache_user FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    run()
