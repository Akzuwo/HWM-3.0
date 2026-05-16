"""Create table for password reset codes."""

from __future__ import annotations

import mysql.connector


def upgrade(cursor: mysql.connector.cursor.MySQLCursor) -> None:
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            code VARCHAR(16) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_password_resets_user (user_id),
            INDEX idx_password_resets_email (email),
            INDEX idx_password_resets_code (code),
            CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id)
                REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )


__all__ = ["upgrade"]
