from __future__ import annotations

import datetime as _dt
import os
import sqlite3
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence

BASE_DIR = Path(__file__).resolve().parent
SERVER_HOME = Path(os.getenv("HWM_SERVER_HOME", str(BASE_DIR))).resolve()
DATA_DIR = SERVER_HOME / "data"
DB_PATH = DATA_DIR / "hwm.sqlite"
SCHEMA_PATH = BASE_DIR / "schema.sql"
IMPORTANT_TABLES = {"classes", "users", "eintraege", "admin_audit_logs"}


class SQLiteCursor:
    def __init__(self, raw_cursor: sqlite3.Cursor, *, as_dict: bool = False):
        self._cursor = raw_cursor
        self._as_dict = as_dict

    @property
    def lastrowid(self) -> int | None:
        return self._cursor.lastrowid

    @property
    def rowcount(self) -> int:
        return self._cursor.rowcount

    def execute(self, query: str, params: Sequence[Any] | Mapping[str, Any] = ()):
        self._cursor.execute(query, _normalise_params(params))
        return self

    def executemany(self, query: str, seq_of_params: Iterable[Sequence[Any] | Mapping[str, Any]]):
        self._cursor.executemany(query, [_normalise_params(params) for params in seq_of_params])
        return self

    def fetchone(self):
        return self._format_row(self._cursor.fetchone())

    def fetchall(self):
        return [self._format_row(row) for row in self._cursor.fetchall()]

    def close(self) -> None:
        self._cursor.close()

    def _format_row(self, row: sqlite3.Row | None):
        if row is None:
            return None
        converted = {key: _maybe_parse_temporal(key, row[key]) for key in row.keys()}
        if self._as_dict:
            return converted
        names = [item[0] for item in self._cursor.description or []]
        return tuple(converted.get(name) for name in names)


class SQLiteConnection:
    def __init__(self):
        self._conn = sqlite3.connect(DB_PATH, timeout=5)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")
        self._conn.execute("PRAGMA journal_mode = WAL")
        self._conn.execute("PRAGMA busy_timeout = 5000")

    def cursor(self):
        return SQLiteCursor(self._conn.cursor())

    def dict_cursor(self):
        return SQLiteCursor(self._conn.cursor(), as_dict=True)

    def execute(self, query: str, params: Sequence[Any] | Mapping[str, Any] = ()):
        return self._conn.execute(query, _normalise_params(params))

    def commit(self) -> None:
        self._conn.commit()

    def rollback(self) -> None:
        self._conn.rollback()

    def close(self) -> None:
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            self.commit()
        else:
            self.rollback()
        self.close()


def _normalise_params(params: Sequence[Any] | Mapping[str, Any] | None):
    if params is None:
        return ()
    if isinstance(params, Mapping):
        return {key: _normalise_value(value) for key, value in params.items()}
    return tuple(_normalise_value(value) for value in params)


def _normalise_value(value: Any) -> Any:
    if isinstance(value, _dt.datetime):
        return value.isoformat(sep=" ", timespec="seconds")
    if isinstance(value, _dt.time):
        return value.isoformat(timespec="seconds")
    if isinstance(value, _dt.date):
        return value.isoformat()
    if isinstance(value, bool):
        return 1 if value else 0
    return value


def _maybe_parse_temporal(column: str, value: Any) -> Any:
    if not isinstance(value, str) or not value:
        return value
    if column not in {"created_at", "updated_at", "expires_at", "used_at", "last_login_at", "email_verified_at", "deleted_at", "imported_at"} and not column.endswith("_at"):
        return value
    try:
        return _dt.datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return value


def get_db_connection() -> SQLiteConnection:
    return SQLiteConnection()


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    conn = sqlite3.connect(DB_PATH, timeout=5)
    try:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA busy_timeout = 5000")
        conn.executescript(schema)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def quick_check() -> dict[str, Any]:
    conn = sqlite3.connect(DB_PATH, timeout=5)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA busy_timeout = 5000")
        tables = {
            row[0]
            for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        }
        missing = sorted(IMPORTANT_TABLES - tables)
        return {
            "ok": not missing,
            "db_path": str(DB_PATH),
            "missing_tables": missing,
            "table_count": len(tables),
        }
    finally:
        conn.close()


def fetch_one(query: str, params=()):
    with get_db_connection() as conn:
        cur = conn.dict_cursor()
        try:
            cur.execute(query, params)
            return cur.fetchone()
        finally:
            cur.close()


def fetch_all(query: str, params=()):
    with get_db_connection() as conn:
        cur = conn.dict_cursor()
        try:
            cur.execute(query, params)
            return cur.fetchall()
        finally:
            cur.close()


def execute(query: str, params=()):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params)
        conn.commit()
        return cur.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def execute_many(query: str, list_of_params):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.executemany(query, list_of_params)
        conn.commit()
        return cur.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
