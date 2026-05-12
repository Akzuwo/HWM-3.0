"""
Migration 008: add last_class_change DATETIME NULL to users table
"""

from __future__ import annotations

import mysql.connector
from contextlib import closing
from config import get_db_config


def upgrade():
    cfg = get_db_config()
    conn = mysql.connector.connect(**cfg)
    try:
        with closing(conn):
            cursor = conn.cursor()
            try:
                # only add column if it doesn't exist
                cursor.execute("SHOW COLUMNS FROM users LIKE 'last_class_change'")
                if cursor.fetchone() is None:
                    cursor.execute("ALTER TABLE users ADD COLUMN last_class_change DATETIME NULL AFTER updated_at")
                    print('Added last_class_change column to users')
                else:
                    print('Column last_class_change already exists')
            finally:
                cursor.close()
            conn.commit()
    finally:
        conn.close()


def downgrade():
    cfg = get_db_config()
    conn = mysql.connector.connect(**cfg)
    try:
        with closing(conn):
            cursor = conn.cursor()
            try:
                cursor.execute("SHOW COLUMNS FROM users LIKE 'last_class_change'")
                if cursor.fetchone() is not None:
                    cursor.execute("ALTER TABLE users DROP COLUMN last_class_change")
                    print('Dropped last_class_change column from users')
                else:
                    print('Column last_class_change does not exist')
            finally:
                cursor.close()
            conn.commit()
    finally:
        conn.close()
