"""Add encrypted grade vault storage.

Run with the same database environment as the Flask backend:

    python backend/migrations/014_add_encrypted_grade_vaults.py
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from config import get_db_config  # noqa: E402
import mysql.connector  # noqa: E402


DDL_STATEMENT = """
CREATE TABLE IF NOT EXISTS encrypted_grade_vaults (
    user_id INT PRIMARY KEY,
    vault_json MEDIUMTEXT NOT NULL,
    revision INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_encrypted_grade_vaults_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""


def main() -> None:
    conn = mysql.connector.connect(**get_db_config())
    cursor = conn.cursor()
    try:
        cursor.execute(DDL_STATEMENT)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
