import mysql.connector

from config import get_db_config

DB_CONFIG = get_db_config()


def upgrade():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            ALTER TABLE users
            MODIFY COLUMN role ENUM('student','teacher','class_admin','admin')
            NOT NULL DEFAULT 'student'
            """
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def downgrade():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            ALTER TABLE users
            MODIFY COLUMN role ENUM('student','teacher','admin')
            NOT NULL DEFAULT 'student'
            """
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    upgrade()
