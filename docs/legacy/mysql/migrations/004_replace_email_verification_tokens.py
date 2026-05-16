"""Replace email verification tokens with numeric codes."""

from __future__ import annotations

import mysql.connector


def _column_exists(cursor: mysql.connector.cursor.MySQLCursor, table: str, column: str) -> bool:
    cursor.execute(f"SHOW COLUMNS FROM {table} LIKE %s", (column,))
    return cursor.fetchone() is not None


def _index_exists(cursor: mysql.connector.cursor.MySQLCursor, table: str, index: str) -> bool:
    cursor.execute(f"SHOW INDEX FROM {table} WHERE Key_name=%s", (index,))
    return cursor.fetchone() is not None


def upgrade(cursor: mysql.connector.cursor.MySQLCursor) -> None:
    cursor.execute("DELETE FROM email_verifications")

    if _index_exists(cursor, 'email_verifications', 'uq_email_verifications_token'):
        cursor.execute("ALTER TABLE email_verifications DROP INDEX uq_email_verifications_token")

    if _column_exists(cursor, 'email_verifications', 'token'):
        cursor.execute("ALTER TABLE email_verifications CHANGE token code VARCHAR(8) NOT NULL")
    elif not _column_exists(cursor, 'email_verifications', 'code'):
        cursor.execute("ALTER TABLE email_verifications ADD COLUMN code VARCHAR(8) NOT NULL AFTER email")

    if _column_exists(cursor, 'email_verifications', 'verified_at'):
        cursor.execute("ALTER TABLE email_verifications DROP COLUMN verified_at")

    if not _column_exists(cursor, 'email_verifications', 'failed_attempts'):
        cursor.execute(
            "ALTER TABLE email_verifications ADD COLUMN failed_attempts INT NOT NULL DEFAULT 0 AFTER expires_at"
        )

    if not _index_exists(cursor, 'email_verifications', 'idx_email_verifications_code'):
        cursor.execute("ALTER TABLE email_verifications ADD INDEX idx_email_verifications_code (code)")


__all__ = ["upgrade"]
