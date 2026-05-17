import json
import os
import datetime
import re
import time
import logging
import smtplib
import html
import traceback
import uuid
import hashlib
import secrets as pysecrets
import urllib.request
import urllib.error
from collections import OrderedDict, deque
from contextlib import closing
from email.message import EmailMessage
from pathlib import Path
import sqlite3
from typing import Dict, Optional, Tuple, Any, Iterable, List

from logging.handlers import RotatingFileHandler

import pytz
from flask import Flask, jsonify, request, session, make_response, send_from_directory, Response, g
from functools import wraps
from fnmatch import fnmatch
from flask_cors import CORS

from auth.utils import calculate_token_expiry, generate_numeric_code, verify_password, hash_password
from class_ids import DEFAULT_ENTRY_CLASS_ID, ENTRY_CLASS_ID_SET
from config import get_contact_smtp_settings
from db import DB_PATH, DATA_DIR, init_db, get_db_connection
from schedule_importer import (
    ScheduleImportError,
    import_schedule as perform_schedule_import,
    load_schedule_from_json_bytes,
    load_schedule_from_json_text,
    load_schedule_from_payload,
)
from server_panel import init_server_panel

# ---------- APP INITIALISIEREN ----------
BASE_DIR = Path(__file__).resolve().parent
SERVER_HOME = Path(os.getenv("HWM_SERVER_HOME", str(BASE_DIR))).resolve()
LOGS_DIR = SERVER_HOME / "logs"
IMPORTS_DIR = SERVER_HOME / "imports"
EXPORTS_DIR = SERVER_HOME / "exports"

HWM_DEBUG_MODE = (os.getenv('HWM_DEBUG_MODE', '').strip().lower() in {'1', 'true', 'yes', 'on', 'debug'})

HWM_LOCAL_DEV = (os.getenv('HWM_LOCAL_DEV', '').strip().lower() in {'1', 'true', 'yes', 'on'})

app = Flask(__name__, static_url_path="/")

LOCAL_DEV_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:4174",
    "http://127.0.0.1:4174",
]
LOCAL_DEV_CORS_ORIGIN_PATTERNS = [
    "http://localhost:*",
    "http://127.0.0.1:*",
]

# Session‐Cookies auch cross‐site erlauben
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax" if (HWM_DEBUG_MODE or HWM_LOCAL_DEV) else "None",
    SESSION_COOKIE_SECURE=not (HWM_DEBUG_MODE or HWM_LOCAL_DEV)
)

app.secret_key = pysecrets.token_hex(32)
app.logger.info('Using an ephemeral Flask session key for this process.')

# ---------- CORS ----------
ALLOWED_CORS_ORIGINS = [
    "https://homework-manager.akzuwo.ch",
    "https://hw-manager.akzuwo.ch",
    "https://hwm-beta.akzuwo.ch",
    "https://hwm2.akzuwo.ch",
    "https://services.akzuwo.ch",
    *LOCAL_DEV_CORS_ORIGINS,
]
ALLOWED_CORS_ORIGIN_PATTERNS = [
    "https://*.homework-manager.pages.dev",
    "https://*.hwm-2-preview.pages.dev",
    *LOCAL_DEV_CORS_ORIGIN_PATTERNS,
]
for _origin in (os.getenv("HWM_CORS_ORIGINS") or "").split(","):
    _origin = _origin.strip()
    if _origin and _origin not in ALLOWED_CORS_ORIGINS:
        ALLOWED_CORS_ORIGINS.append(_origin)

# Environment configuration for the production deployment of the Homework Manager backend.
# SMTP credentials are centralised in config.py to avoid duplication across modules.
if HWM_DEBUG_MODE:
    _contact_settings = {
        "host": "localhost",
        "user": None,
        "password": None,
        "recipient": "debug@localhost",
        "from_address": "debug@localhost",
    }
else:
    try:
        _contact_settings = get_contact_smtp_settings()
    except RuntimeError:
        app.logger.warning("SMTP contact settings are incomplete; contact form mail delivery is disabled until configured.")
        _contact_settings = {
            "host": "localhost",
            "user": None,
            "password": None,
            "recipient": None,
            "from_address": "no-reply@localhost",
        }
CONTACT_SMTP_HOST = _contact_settings["host"]
CONTACT_SMTP_USER = _contact_settings["user"]
CONTACT_SMTP_PASSWORD = _contact_settings["password"]
CONTACT_RECIPIENT = _contact_settings["recipient"]
CONTACT_FROM_ADDRESS = _contact_settings["from_address"]
CONTACT_SMTP_PORTS = (587, 465)

LOG_FILE_PATH = os.getenv('HWM_LOG_FILE', str(LOGS_DIR / 'hwm-backend.log'))
LOG_MAX_BYTES = int(os.getenv('HWM_LOG_MAX_BYTES', 2 * 1024 * 1024))
LOG_BACKUP_COUNT = int(os.getenv('HWM_LOG_BACKUP_COUNT', 5))
LOG_DEFAULT_LINE_LIMIT = max(int(os.getenv('HWM_LOG_DEFAULT_LINES', 500)), 1)
LOG_MAX_LINE_LIMIT = max(int(os.getenv('HWM_LOG_MAX_LINES', 5000)), LOG_DEFAULT_LINE_LIMIT)
LOG_FILE_HANDLER = None
_LOG_HANDLER_LOGGERS = (app.logger, logging.getLogger())

CLASS_ADMIN_ROLES = {'admin', 'class_admin'}
ENTRY_MANAGER_ROLES = {'admin', 'teacher', 'class_admin'}
GLOBAL_ENTRY_CLASS_ID = "default"
TODO_STATUS_OPEN = "offen"
TODO_STATUS_IN_PROGRESS = "in_bearbeitung"
TODO_STATUS_DONE = "beendet"
TODO_STATUS_VALUES = {TODO_STATUS_OPEN, TODO_STATUS_IN_PROGRESS, TODO_STATUS_DONE}


def _get_runtime_contact_settings() -> Dict[str, Optional[str]]:
    """Return SMTP settings, reloading from the environment if possible."""

    try:
        return get_contact_smtp_settings()
    except RuntimeError:
        return {
            "host": CONTACT_SMTP_HOST,
            "user": CONTACT_SMTP_USER,
            "password": CONTACT_SMTP_PASSWORD,
            "recipient": CONTACT_RECIPIENT,
            "from_address": CONTACT_FROM_ADDRESS,
        }


def _remove_existing_log_handler() -> None:
    global LOG_FILE_HANDLER
    handler = LOG_FILE_HANDLER
    if handler is None:
        return
    for logger in _LOG_HANDLER_LOGGERS:
        if handler in getattr(logger, 'handlers', []):
            logger.removeHandler(handler)
    try:
        handler.close()
    except Exception:
        pass
    LOG_FILE_HANDLER = None


def _setup_file_logging() -> None:
    global LOG_FILE_HANDLER
    _remove_existing_log_handler()

    if not LOG_FILE_PATH:
        return

    directory = os.path.dirname(LOG_FILE_PATH)
    if directory:
        try:
            os.makedirs(directory, exist_ok=True)
        except OSError as exc:
            app.logger.warning('Failed to create log directory ?: ?', directory, exc)
            return

    try:
        handler = RotatingFileHandler(
            LOG_FILE_PATH,
            maxBytes=LOG_MAX_BYTES,
            backupCount=LOG_BACKUP_COUNT,
            encoding='utf-8',
        )
    except OSError as exc:
        app.logger.warning('Failed to initialise log handler for %s: %s', LOG_FILE_PATH, exc)
        return

    formatter = logging.Formatter('%(asctime)s %(levelname)s [%(name)s] %(message)s')
    handler.setFormatter(formatter)
    handler.setLevel(logging.INFO)

    for logger in _LOG_HANDLER_LOGGERS:
        logger.addHandler(handler)
        if logger.level == logging.NOTSET or logger.level > logging.INFO:
            logger.setLevel(logging.INFO)

    LOG_FILE_HANDLER = handler


def _resolve_active_log_path() -> Optional[str]:
    handler = LOG_FILE_HANDLER
    if handler is not None:
        handler_path = getattr(handler, 'baseFilename', None)
        if handler_path:
            return handler_path
    return LOG_FILE_PATH or None


def _tail_log_file(path: str, max_lines: int) -> Tuple[str, bool]:
    truncated = False
    buffer = deque(maxlen=max_lines)
    with open(path, 'r', encoding='utf-8', errors='replace') as fh:
        for line in fh:
            if len(buffer) == buffer.maxlen:
                truncated = True
            buffer.append(line)
    return ''.join(buffer), truncated


_setup_file_logging()
init_server_panel(
    app,
    base_dir=SERVER_HOME,
    logs_dir=LOGS_DIR,
    imports_dir=IMPORTS_DIR,
    exports_dir=EXPORTS_DIR,
    get_log_path=_resolve_active_log_path,
)


def _log_user_event(event: str, user_id: Optional[int] = None, **details: object) -> None:
    """Write a structured audit log entry to the application logger."""

    if user_id is None:
        try:
            user_id = int(session.get('user_id'))
        except (TypeError, ValueError):
            user_id = session.get('user_id')

    serialized: Dict[str, Any] = {}
    for key, value in details.items():
        serialized[key] = _serialize_value(value)

    try:
        encoded_details = json.dumps(serialized, ensure_ascii=False, sort_keys=True)
    except (TypeError, ValueError):
        encoded_details = str(serialized)

    app.logger.info('AUDIT event=%s user_id=%s details=%s', event, user_id, encoded_details)


def _log_request_error(status: int, message: str, *, exc: Optional[BaseException] = None) -> str:
    error_id = uuid.uuid4().hex[:12]
    log_line = "Request error path=%s method=%s status=%s error_id=%s message=%s"
    if exc is not None:
        app.logger.error(
            log_line + " traceback=%s",
            request.path,
            request.method,
            status,
            error_id,
            message,
            traceback.format_exc(),
        )
    else:
        app.logger.warning(
            log_line,
            request.path,
            request.method,
            status,
            error_id,
            message,
        )
    return error_id


def _sync_session_user(user: Dict[str, Any], *, conn=None) -> Dict[str, Any]:
    user_id = int(user['id'])
    role = str(user.get('role') or 'student').strip() or 'student'
    class_id_value = user.get('class_id')
    class_id: Optional[int] = None
    class_slug: Optional[str] = None

    if class_id_value is not None:
        try:
            class_id = int(class_id_value)
        except (TypeError, ValueError):
            class_id = None

    if class_id is not None:
        session['class_id'] = class_id
        if conn is not None:
            try:
                class_slug = _load_class_slug(conn, class_id)
            except sqlite3.Error:
                class_slug = None
    else:
        session.pop('class_id', None)

    if class_slug:
        session['class_slug'] = class_slug
        try:
            session['entry_class_id'] = _normalize_entry_class_id(class_slug)
        except ValueError:
            session.pop('entry_class_id', None)
    elif class_id is None:
        session.pop('class_slug', None)
        session.pop('entry_class_id', None)

    session['user_id'] = user_id
    session['role'] = role
    session['is_admin'] = role == 'admin'
    session['is_class_admin'] = role in CLASS_ADMIN_ROLES

    current_user = {
        'id': user_id,
        'email': user.get('email'),
        'role': role,
        'class_id': class_id,
        'class_slug': session.get('class_slug'),
    }
    g.user = current_user
    return current_user


def _auth_error(status: int, message: str) -> Tuple[int, Dict[str, str], Optional[BaseException]]:
    return status, {'status': 'error', 'message': message}, None


def _authenticate_request() -> Tuple[Optional[Dict[str, Any]], Optional[Tuple[int, Dict[str, str], Optional[BaseException]]]]:
    if HWM_DEBUG_MODE:
        session['user_id'] = 1
        session['role'] = 'admin'
        session['is_admin'] = True
        session['is_class_admin'] = True
        session['class_slug'] = session.get('class_slug') or 'l23a-test'
        session['entry_class_id'] = session.get('entry_class_id') or 'l23a-test'
        g.user = {
            'id': 1,
            'role': 'admin',
            'email': 'debug@localhost',
            'class_id': session.get('class_id'),
            'class_slug': session.get('class_slug'),
        }
        return g.user, None

    raw_user_id = session.get('user_id')
    role = session.get('role')
    if raw_user_id is None or role is None:
        return None, _auth_error(401, 'not_authenticated')

    try:
        user_id = int(raw_user_id)
    except (TypeError, ValueError):
        session.clear()
        return None, _auth_error(401, 'not_authenticated')

    g.user = {
        'id': user_id,
        'role': str(role),
        'email': session.get('email'),
        'class_id': _get_session_class_id(),
        'class_slug': session.get('class_slug'),
    }
    return g.user, None

def _resolve_cors_origin() -> Optional[str]:
    origin = request.headers.get("Origin")
    if not origin:
        return None

    if origin in ALLOWED_CORS_ORIGINS:
        return origin

    for pattern in ALLOWED_CORS_ORIGIN_PATTERNS:
        if fnmatch(origin, pattern):
            return origin

    return None


def _is_local_dev_origin(origin: Optional[str]) -> bool:
    if not origin:
        return False
    if origin in LOCAL_DEV_CORS_ORIGINS:
        return True
    return any(fnmatch(origin, pattern) for pattern in LOCAL_DEV_CORS_ORIGIN_PATTERNS)


@app.before_request
def _configure_session_cookie_security():
    local_request = _is_local_dev_origin(request.headers.get("Origin")) or request.host.startswith(("localhost:", "127.0.0.1:"))
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax" if local_request or HWM_DEBUG_MODE or HWM_LOCAL_DEV else "None"
    app.config["SESSION_COOKIE_SECURE"] = not (local_request or HWM_DEBUG_MODE or HWM_LOCAL_DEV)


CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": ALLOWED_CORS_ORIGINS + ALLOWED_CORS_ORIGIN_PATTERNS}},
    methods=["GET","HEAD","POST","OPTIONS","PUT","DELETE"],
    allow_headers=["Content-Type", "X-Role", "Authorization"]
)
# ---------- DATABASE ----------
try:
    init_db()
except sqlite3.Error as exc:
    app.logger.exception("Failed to initialise local SQLite database at %s", DB_PATH)
    raise RuntimeError("Local SQLite database could not be initialised.") from exc


def get_connection():
    return get_db_connection()


def _ensure_seed_admin_user() -> None:
    email = (os.getenv("SEED_ADMIN_EMAIL") or "admin@localhost").strip().lower()
    password = os.getenv("SEED_ADMIN_PASSWORD") or "ChangeMe123!"
    now = datetime.datetime.utcnow()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, password_hash FROM users WHERE role='admin' ORDER BY id ASC LIMIT 1")
        row = cursor.fetchone()
        if row and row[1] != "local-debug-placeholder":
            return
        password_hash = hash_password(password)
        if row:
            cursor.execute(
                "UPDATE users SET email=?, password_hash=?, is_active=1, email_verified_at=?, updated_at=? WHERE id=?",
                (email, password_hash, now, now, row[0]),
            )
        else:
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, role, class_id, is_active, email_verified_at, created_at, updated_at)
                VALUES (?, ?, 'admin', 1, 1, ?, ?, ?)
                """,
                (email, password_hash, now, now, now),
            )
        conn.commit()
        app.logger.info("Seed admin user is available as %s", email)
    except sqlite3.Error:
        conn.rollback()
        app.logger.exception("Failed to ensure seed admin user")
        raise
    finally:
        cursor.close()
        conn.close()


_ensure_seed_admin_user()


def _next_entry_id(conn) -> int:
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM eintraege")
        row = cursor.fetchone()
        return int(row[0] if row else 1)
    finally:
        cursor.close()


def _serialize_value(value: Any) -> Any:
    if isinstance(value, datetime.datetime):
        if value.tzinfo is not None:
            value = value.astimezone(datetime.timezone.utc).replace(tzinfo=None)
        return value.isoformat(timespec='seconds')
    if isinstance(value, datetime.date):
        return value.isoformat()
    return value


def _serialize_rows(rows: Iterable[Dict[str, Any]]) -> Iterable[Dict[str, Any]]:
    serialized = []
    for row in rows:
        serialized.append({key: _serialize_value(value) for key, value in row.items()})
    return serialized


DEBUG_CLASSES = [
    {
        'id': None,
        'slug': GLOBAL_ENTRY_CLASS_ID,
        'title': 'Alle Klassen',
        'description': 'Schulweite Einträge',
        'is_active': 1,
    },
    {
        'id': 23,
        'slug': 'l23a-test',
        'title': 'Test class L23a',
        'description': 'Lokale Kalender-Debugklasse',
        'is_active': 1,
    },
    {
        'id': 24,
        'slug': 'u24f-test',
        'title': 'Test class U24f',
        'description': 'Zweite Debugklasse für verlinkte Einträge',
        'is_active': 1,
    },
]


def _debug_calendar_entries() -> List[Dict[str, Any]]:
    today = datetime.date.today()
    month_start = today.replace(day=1)

    def day(offset: int) -> str:
        return (month_start + datetime.timedelta(days=offset)).isoformat()

    return [
        {
            'id': 9001,
            'class_id': 'l23a-test',
            'beschreibung': 'Mathematik: Analysis Übungsserie 4\nKurze Besprechung in der nächsten Lektion.',
            'datum': day(1),
            'enddatum': day(1),
            'startzeit': None,
            'endzeit': None,
            'typ': 'hausaufgabe',
            'fach': 'Mathematik',
            'owner_user_id': 1,
            'is_private': False,
            'is_owned': False,
            'can_edit': True,
        },
        {
            'id': 9002,
            'class_id': 'l23a-test',
            'beschreibung': 'Englisch Prüfung: Unit 7 Vocabulary und Writing.',
            'datum': day(5),
            'enddatum': day(5),
            'startzeit': '09:40:00',
            'endzeit': None,
            'typ': 'pruefung',
            'fach': 'Englisch',
            'owner_user_id': 1,
            'is_private': False,
            'is_owned': False,
            'can_edit': True,
        },
        {
            'id': 9003,
            'class_id': GLOBAL_ENTRY_CLASS_ID,
            'beschreibung': 'Frühlingsferien',
            'datum': day(12),
            'enddatum': day(18),
            'startzeit': None,
            'endzeit': None,
            'typ': 'ferien',
            'fach': '',
            'owner_user_id': 1,
            'is_private': False,
            'is_owned': False,
            'can_edit': True,
        },
        {
            'id': 9004,
            'class_id': 'u24f-test',
            'beschreibung': 'Sporttag Anmeldung kontrollieren.',
            'datum': day(21),
            'enddatum': day(21),
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': '',
            'owner_user_id': 1,
            'is_private': False,
            'is_owned': False,
            'can_edit': True,
        },
        {
            'id': 9101,
            'beschreibung': 'Präsentation für Geschichte vorbereiten.',
            'datum': day(7),
            'enddatum': day(7),
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'is_done': 0,
            'todo_status': TODO_STATUS_IN_PROGRESS,
            'is_private': True,
            'is_owned': True,
            'can_edit': False,
            'can_update_status': True,
        },
        {
            'id': 9102,
            'beschreibung': 'Abgeschlossene Debug-ToDo, nur mit Einstellung sichtbar.',
            'datum': day(9),
            'enddatum': day(9),
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'is_done': 1,
            'todo_status': TODO_STATUS_DONE,
            'is_private': True,
            'is_owned': True,
            'can_edit': False,
            'can_update_status': True,
        },
    ]


def _debug_calendar_preferences() -> Dict[str, Any]:
    return {
        'muted_subjects': [],
        'show_completed_todos': False,
    }


def _parse_pagination(default_size: int = 25, max_size: int = 100) -> Tuple[int, int]:
    try:
        page = int(request.args.get('page', 1))
    except (TypeError, ValueError):
        page = 1
    if page < 1:
        page = 1

    try:
        page_size = int(request.args.get('page_size', default_size))
    except (TypeError, ValueError):
        page_size = default_size
    if page_size < 1:
        page_size = default_size
    page_size = min(page_size, max_size)
    return page, page_size


def _log_admin_action(conn, action: str, entity_type: str, entity_id: Optional[int] = None, details: Optional[Dict[str, Any]] = None) -> None:
    actor_id = session.get('user_id')
    if not actor_id:
        return

    payload = None
    if details is not None:
        try:
            payload = json.dumps(details, ensure_ascii=False)
        except (TypeError, ValueError):
            payload = None

    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (actor_id, action, entity_type, entity_id, payload),
        )
    except sqlite3.Error:
        app.logger.exception('Failed to write admin audit log')
    finally:
        cursor.close()


def _touch_class_schedule(conn, class_id: Optional[int]) -> None:
    if not class_id:
        return
    cursor = conn.cursor()
    try:
        timestamp = datetime.datetime.utcnow()
        cursor.execute(
            "UPDATE class_schedules SET updated_at=? WHERE class_id=?",
            (timestamp, class_id),
        )
    except sqlite3.Error:
        app.logger.exception('Failed to update class_schedules timestamp for class ?', class_id)
    finally:
        cursor.close()


def _pagination_response(data: Iterable[Dict[str, Any]], total: int, page: int, page_size: int):
    return jsonify(
        {
            'status': 'ok',
            'data': list(_serialize_rows(data)),
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
            },
        }
    )


def _normalize_todo_subtasks(raw_subtasks: Any) -> List[Dict[str, Any]]:
    if raw_subtasks is None:
        return []
    if not isinstance(raw_subtasks, list):
        raise ValueError('invalid_subtasks')

    subtasks: List[Dict[str, Any]] = []
    for index, item in enumerate(raw_subtasks):
        if isinstance(item, str):
            title = item.strip()
            is_done = False
        elif isinstance(item, dict):
            title = (item.get('title') or item.get('text') or '').strip()
            is_done = _parse_bool(item.get('is_done', item.get('done', False)), default=False)
        else:
            raise ValueError('invalid_subtasks')

        if not title:
            continue
        if len(title) > 255:
            raise ValueError('subtask_too_long')
        subtasks.append({'title': title, 'is_done': is_done, 'sort_order': index})

    return subtasks


def _load_todo_subtasks(conn, todo_ids: Iterable[int], owner_user_id: int) -> Dict[int, List[Dict[str, Any]]]:
    ids = [int(todo_id) for todo_id in todo_ids if todo_id is not None]
    if not ids:
        return {}

    placeholders = ','.join(['?'] * len(ids))
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            f"""
            SELECT id, todo_id, title, is_done, sort_order
            FROM todo_subtasks
            WHERE owner_user_id=?
              AND todo_id IN ({placeholders})
            ORDER BY todo_id ASC, sort_order ASC, id ASC
            """,
            (int(owner_user_id), *ids),
        )
        grouped: Dict[int, List[Dict[str, Any]]] = {todo_id: [] for todo_id in ids}
        for row in cursor.fetchall() or []:
            todo_id = int(row.get('todo_id') or 0)
            grouped.setdefault(todo_id, []).append(
                {
                    'id': row.get('id'),
                    'title': row.get('title') or '',
                    'is_done': bool(row.get('is_done')),
                    'sort_order': row.get('sort_order') or 0,
                }
            )
        return grouped
    finally:
        cursor.close()


def _replace_todo_subtasks(conn, todo_id: int, owner_user_id: int, subtasks: List[Dict[str, Any]]) -> None:
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM todo_subtasks WHERE todo_id=? AND owner_user_id=?",
            (int(todo_id), int(owner_user_id)),
        )
        for subtask in subtasks:
            cursor.execute(
                """
                INSERT INTO todo_subtasks (todo_id, owner_user_id, title, is_done, sort_order)
                VALUES (?,?,?,?,?)
                """,
                (
                    int(todo_id),
                    int(owner_user_id),
                    subtask['title'],
                    1 if subtask.get('is_done') else 0,
                    int(subtask.get('sort_order') or 0),
                ),
            )
    finally:
        cursor.close()


def _parse_bool(value: Any, default: bool = True) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        value = value.strip().lower()
        if value in {'1', 'true', 'yes', 'on'}:
            return True
        if value in {'0', 'false', 'no', 'off'}:
            return False
    return default


def _ensure_int(value: Any, allow_none: bool = True) -> Optional[int]:
    if value is None:
        return None if allow_none else None
    try:
        ivalue = int(value)
    except (TypeError, ValueError):
        return None
    return ivalue


DEFAULT_CLASS_SLUG = (os.getenv('DEFAULT_CLASS_SLUG', 'default') or 'default').strip().lower() or 'default'
WEEKDAY_ORDER = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]
_WEEKDAY_CANONICAL_MAP = {day.lower(): day for day in WEEKDAY_ORDER}
_WEEKDAY_INDEX_MAP = {day: index for index, day in enumerate(WEEKDAY_ORDER)}
SCHOOL_WEEKDAYS = WEEKDAY_ORDER[:5]
TIMETABLE_TIMEZONE = pytz.timezone(os.getenv('HWM_TIMETABLE_TIMEZONE', 'Europe/Zurich'))
TIMETABLE_REAL_LESSON_SEARCH_DAYS = max(int(os.getenv('HWM_TIMETABLE_SEARCH_DAYS', 370)), 30)
TIMETABLE_NON_LESSON_SUBJECTS = {
    'pause',
    'mittagspause',
    'unterrichtsfrei',
    'frei',
    'freilektion',
    'wochenende',
    '-',
}
TIMETABLE_EXCEPTION_TYPES = {
    'cancellation',
    'room_change',
    'time_shift',
    'replacement',
    'extra_lesson',
}
SPECIAL_DAY_MODES = {'no_lessons', 'show_notice_keep_plan', 'replace_plan'}


def _canonicalize_weekday(value: Any) -> str:
    if value is None:
        raise ValueError('invalid_tag')
    text = str(value).strip()
    if not text:
        raise ValueError('invalid_tag')
    canonical = _WEEKDAY_CANONICAL_MAP.get(text.lower())
    return canonical or text


def _schedule_entry_sort_key(entry: Dict[str, Any]) -> Tuple[int, str, str]:
    tag_value = entry.get('tag')
    start_value = entry.get('start') or ''
    if tag_value:
        text = str(tag_value).strip()
        canonical = _WEEKDAY_CANONICAL_MAP.get(text.lower())
        if canonical:
            return _WEEKDAY_INDEX_MAP[canonical], canonical, start_value
        return len(WEEKDAY_ORDER), text, start_value
    return len(WEEKDAY_ORDER), '', start_value

CONTACT_MAX_FILE_SIZE = int(os.getenv('CONTACT_MAX_FILE_SIZE', 2 * 1024 * 1024))
CONTACT_RATE_LIMIT = {}
CONTACT_RATE_LIMIT_WINDOW = int(os.getenv('CONTACT_RATE_LIMIT_WINDOW', 3600))
CONTACT_RATE_LIMIT_MAX = int(os.getenv('CONTACT_RATE_LIMIT_MAX', 5))
CONTACT_MIN_DURATION_MS = int(os.getenv('CONTACT_MIN_DURATION_MS', 3000))
CONTACT_MIN_MESSAGE_LENGTH = int(os.getenv('CONTACT_MIN_MESSAGE_LENGTH', 20))
CONTACT_USER_COOLDOWN = {}
CONTACT_USER_COOLDOWN_SECONDS = int(os.getenv('CONTACT_USER_COOLDOWN_SECONDS', 120))
CONTACT_TARGET_ADDRESS = os.getenv('CONTACT_TARGET_ADDRESS', 'support@akzuwo.ch')

PRIMARY_TEST_BASE_URL = os.getenv('PRIMARY_TEST_BASE_URL', 'https://hwm-beta.akzuwo.ch')
LOGIN_RATE_LIMIT = {}
LOGIN_RATE_LIMIT_WINDOW = int(os.getenv('LOGIN_RATE_LIMIT_WINDOW', 300))
LOGIN_RATE_LIMIT_MAX = int(os.getenv('LOGIN_RATE_LIMIT_MAX', 10))
VERIFY_RATE_LIMIT = {}
VERIFY_RATE_LIMIT_WINDOW = int(os.getenv('VERIFY_RATE_LIMIT_WINDOW', 3600))
VERIFY_RATE_LIMIT_MAX = int(os.getenv('VERIFY_RATE_LIMIT_MAX', 5))

PASSWORD_RESET_REQUEST_LIMIT = {}
PASSWORD_RESET_REQUEST_WINDOW = int(os.getenv('PASSWORD_RESET_REQUEST_WINDOW', 3600))
PASSWORD_RESET_REQUEST_MAX = int(os.getenv('PASSWORD_RESET_REQUEST_MAX', 5))
PASSWORD_RESET_VERIFY_LIMIT = {}
PASSWORD_RESET_VERIFY_WINDOW = int(os.getenv('PASSWORD_RESET_VERIFY_WINDOW', 3600))
PASSWORD_RESET_VERIFY_MAX = int(os.getenv('PASSWORD_RESET_VERIFY_MAX', 10))
PASSWORD_RESET_CODE_LENGTH = int(os.getenv('PASSWORD_RESET_CODE_LENGTH', 8))
PASSWORD_RESET_CODE_LIFETIME_SECONDS = int(os.getenv('PASSWORD_RESET_CODE_LIFETIME_SECONDS', 15 * 60))
PASSWORD_RESET_FROM_ADDRESS = os.getenv('PASSWORD_RESET_FROM_ADDRESS', CONTACT_FROM_ADDRESS or CONTACT_SMTP_USER or CONTACT_RECIPIENT)
PASSWORD_RESET_SUBJECT = os.getenv('PASSWORD_RESET_SUBJECT', 'Passwort zurücksetzen')
PASSWORD_CHANGE_FROM_ADDRESS = os.getenv('PASSWORD_CHANGE_FROM_ADDRESS', CONTACT_FROM_ADDRESS or CONTACT_SMTP_USER or CONTACT_RECIPIENT)
PASSWORD_CHANGE_SUBJECT = os.getenv('PASSWORD_CHANGE_SUBJECT', 'Passwort geändert')

EMAIL_VERIFICATION_CODE_LIFETIME_SECONDS = int(os.getenv('EMAIL_VERIFICATION_CODE_LIFETIME_SECONDS', 8 * 60))
EMAIL_VERIFICATION_FROM_ADDRESS = os.getenv('EMAIL_VERIFICATION_FROM_ADDRESS', CONTACT_FROM_ADDRESS or CONTACT_SMTP_USER or CONTACT_RECIPIENT)
EMAIL_VERIFICATION_SUBJECT = os.getenv('EMAIL_VERIFICATION_SUBJECT', 'Bitte E-Mail-Adresse bestätigen')

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip() or os.getenv('OPENAI_API_KEY', '').strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant').strip() or 'llama-3.1-8b-instant'
WEEKLY_PREVIEW_CACHE_TTL_MINUTES = max(int(os.getenv('WEEKLY_PREVIEW_CACHE_TTL_MINUTES', 45)), 1)
WEEKLY_PREVIEW_MAX_ITEMS = max(int(os.getenv('WEEKLY_PREVIEW_MAX_ITEMS', 120)), 1)
WEEKLY_PREVIEW_MAX_CHARS = max(int(os.getenv('WEEKLY_PREVIEW_MAX_CHARS', 12000)), 500)
WEEKLY_PREVIEW_TIMEOUT_SECONDS = max(int(os.getenv('WEEKLY_PREVIEW_TIMEOUT_SECONDS', 20)), 5)
WEEKLY_PREVIEW_OUTPUT_MAX_CHARS = 900
WEEKLY_PREVIEW_OUTPUT_MAX_BULLETS = 10

REGISTRATION_ALLOWED_DOMAIN = os.getenv('REGISTRATION_ALLOWED_DOMAIN', '@sluz.ch').lower()


def require_role(*roles):
    """Decorator to guard endpoints behind role-based access control."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if request.method == 'OPTIONS':
                return fn(*args, **kwargs)
            _, auth_error = _authenticate_request()
            if auth_error:
                status, payload, exc = auth_error
                _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
                return jsonify(payload), status

            current_role = session.get('role')
            if roles:
                allowed = current_role in roles
            else:
                allowed = current_role is not None
            if not allowed:
                _log_request_error(403, 'forbidden')
                return jsonify(status='error', message='forbidden'), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def _get_session_class_id() -> Optional[int]:
    class_id = session.get('class_id')
    try:
        return int(class_id) if class_id is not None else None
    except (TypeError, ValueError):
        return None


def _get_session_entry_class_id() -> Optional[str]:
    """Resolve the class identifier used for entry queries."""

    raw_value = session.get('entry_class_id')
    if raw_value:
        try:
            normalized = _normalize_entry_class_id(raw_value)
        except ValueError:
            session.pop('entry_class_id', None)
        else:
            return normalized

    class_slug = session.get('class_slug')
    if class_slug:
        try:
            normalized = _normalize_entry_class_id(class_slug)
        except ValueError:
            return None
        session['entry_class_id'] = normalized
        return normalized

    return None


def _normalize_entry_class_id(raw_value: Optional[object]) -> str:
    value = (str(raw_value).strip() if raw_value is not None else '').replace(' ', '')
    if not value or value.isdigit() or len(value) < 2:
        return DEFAULT_ENTRY_CLASS_ID

    prefix, suffix = value[:-1], value[-1]
    normalized = f"{prefix.upper()}{suffix.lower()}"
    if normalized not in ENTRY_CLASS_ID_SET:
        raise ValueError('invalid_class_id')
    return normalized


def _normalize_entry_class_id_list(raw_values: Optional[object]) -> List[str]:
    if raw_values is None:
        return []

    if isinstance(raw_values, str):
        candidates = [raw_values]
    elif isinstance(raw_values, (list, tuple, set, frozenset)):
        candidates = list(raw_values)
    else:
        raise ValueError('invalid_class_id')

    normalized: List[str] = []
    for candidate in candidates:
        normalized_id = _normalize_entry_class_id(candidate)
        if normalized_id not in normalized:
            normalized.append(normalized_id)

    if not normalized:
        raise ValueError('invalid_class_id')
    return normalized


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return fn(*args, **kwargs)
        _, auth_error = _authenticate_request()
        if auth_error:
            status, payload, exc = auth_error
            _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
            return jsonify(payload), status
        if session.get('role') != 'admin':
            _log_request_error(403, 'forbidden')
            return jsonify(status='error', message='forbidden'), 403
        return fn(*args, **kwargs)

    return wrapper


def require_class_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return fn(*args, **kwargs)
        _, auth_error = _authenticate_request()
        if auth_error:
            status, payload, exc = auth_error
            _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
            return jsonify(payload), status
        role = session.get('role')
        if role not in CLASS_ADMIN_ROLES:
            _log_request_error(403, 'forbidden')
            return jsonify(status='error', message='forbidden'), 403
        return fn(*args, **kwargs)

    return wrapper


def require_entry_manager(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return fn(*args, **kwargs)
        _, auth_error = _authenticate_request()
        if auth_error:
            status, payload, exc = auth_error
            _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
            return jsonify(payload), status
        role = session.get('role')
        if role not in ENTRY_MANAGER_ROLES:
            _log_request_error(403, 'forbidden')
            return jsonify(status='error', message='forbidden'), 403
        return fn(*args, **kwargs)

    return wrapper


def require_authenticated(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return fn(*args, **kwargs)
        _, auth_error = _authenticate_request()
        if auth_error:
            status, payload, exc = auth_error
            _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
            return jsonify(payload), status
        return fn(*args, **kwargs)

    return wrapper


def require_class_context(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return fn(*args, **kwargs)
        _, auth_error = _authenticate_request()
        if auth_error:
            status, payload, exc = auth_error
            _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
            return jsonify(payload), status
        class_id = _get_session_class_id()
        if class_id is None:
            _log_request_error(403, 'class_required')
            return jsonify(status='error', message='class_required'), 403
        g.active_class_id = class_id
        return fn(*args, **kwargs)

    return wrapper


def _get_request_ip() -> str:
    forwarded_for = request.headers.get('X-Forwarded-For', '')
    if forwarded_for:
        candidate = forwarded_for.split(',')[0].strip()
        if candidate:
            return candidate
    return request.remote_addr or 'unknown'


def _check_rate_limit(bucket, identifier: str, window: int, maximum: int) -> bool:
    now = time.time()
    entry = bucket.get(identifier)
    if entry and now < entry['reset']:
        entry['count'] += 1
    else:
        entry = {'count': 1, 'reset': now + window}
        bucket[identifier] = entry
    return entry['count'] <= maximum


def _check_contact_rate_limit(ip_address: str) -> bool:
    return _check_rate_limit(
        CONTACT_RATE_LIMIT,
        ip_address,
        CONTACT_RATE_LIMIT_WINDOW,
        CONTACT_RATE_LIMIT_MAX,
    )


def _is_contact_user_limited(user_id: int) -> bool:
    if user_id is None:
        return False
    last_activity = CONTACT_USER_COOLDOWN.get(user_id)
    if last_activity is None:
        return False
    return (time.time() - last_activity) < CONTACT_USER_COOLDOWN_SECONDS


def _mark_contact_user_activity(user_id: int) -> None:
    if user_id is None:
        return
    CONTACT_USER_COOLDOWN[user_id] = time.time()


def _deliver_email(
    to_address: str,
    subject: str,
    body: str,
    *,
    sender: Optional[str] = None,
    reply_to: Optional[str] = None,
    attachment: Optional[Tuple[bytes, str, Optional[str]]] = None,
    html_body: Optional[str] = None,
) -> None:
    contact_settings = _get_runtime_contact_settings()
    host = contact_settings["host"]
    user = contact_settings["user"]
    password = contact_settings["password"]
    recipient = contact_settings["recipient"]
    from_address = contact_settings["from_address"]

    if not host:
        raise RuntimeError('Email delivery is not configured')

    message = EmailMessage()
    message['Subject'] = subject.strip() or 'Homework Manager'
    message['To'] = to_address

    final_sender = sender or from_address or user or recipient
    if final_sender:
        message['From'] = final_sender
    if reply_to:
        message['Reply-To'] = reply_to

    message.set_content(body)

    if html_body:
        message.add_alternative(html_body, subtype='html')

    if attachment:
        file_data, filename, content_type = attachment
        if file_data:
            maintype, subtype = (content_type or 'application/octet-stream').split('/', 1)
            message.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=filename)

    ports_to_try = []
    for port in CONTACT_SMTP_PORTS:
        if port and port not in ports_to_try:
            ports_to_try.append(port)

    if not ports_to_try:
        raise RuntimeError('No SMTP ports configured')

    last_error: Optional[Exception] = None
    primary_port = ports_to_try[0]

    for port in ports_to_try:
        server = None
        try:
            if port == 465:
                server = smtplib.SMTP_SSL(host, port, timeout=10)
            else:
                server = smtplib.SMTP(host, port, timeout=10)
                server.starttls()

            if user and password:
                server.login(user, password)

            server.send_message(message)

            if port != primary_port:
                app.logger.info('Email sent via fallback SMTP port %s', port)

            return
        except (OSError, smtplib.SMTPException) as exc:
            last_error = exc
            app.logger.warning('Failed to send email via SMTP port %s: %s', port, exc)
        finally:
            if server is not None:
                try:
                    server.quit()
                except Exception:
                    pass

    if last_error is not None:
        app.logger.error('Unable to send email after trying ports: %s', ports_to_try)
        raise last_error

    raise RuntimeError('mail_failed')


def _send_contact_email(sender_email: str, subject: str, body: str, attachment=None) -> None:
    contact_settings = _get_runtime_contact_settings()
    recipient = CONTACT_TARGET_ADDRESS or contact_settings["recipient"]
    from_address = contact_settings["from_address"]
    user = contact_settings["user"]

    if not recipient:
        raise RuntimeError('Contact email is not configured')

    final_subject = subject.strip() or 'Kontaktanfrage'
    prefixed_subject = f"[Homework Manager] {final_subject}"
    sender = from_address or user or recipient

    _deliver_email(
        recipient,
        prefixed_subject,
        body,
        sender=sender,
        reply_to=sender_email or None,
        attachment=attachment,
    )


def _send_verification_email(email_address: str, code: str, expires_at: datetime.datetime) -> None:
    if not email_address:
        raise ValueError('email_address is required')

    expiration_text = expires_at.strftime('%d.%m.%Y %H:%M UTC')
    body = (
        "Hallo,\n\n"
        "bitte bestätige deine E-Mail-Adresse für den Homework Manager mit dem folgenden Code:\n"
        f"{code}\n\n"
        f"Der Code ist bis {expiration_text} gültig.\n\n"
        "Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.\n"
    )

    html_body = (
        '<html><body>'
        '<p>Hallo,</p>'
        '<p>bitte bestätige deine E-Mail-Adresse für den Homework Manager mit dem folgenden Code:</p>'
        f'<p><strong>{html.escape(code)}</strong></p>'
        f'<p>Der Code ist bis {html.escape(expiration_text)} gültig.</p>'
        '<p>Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>'
        '</body></html>'
    )

    contact_settings = _get_runtime_contact_settings()
    sender = (
        EMAIL_VERIFICATION_FROM_ADDRESS
        or contact_settings["from_address"]
        or contact_settings["user"]
        or contact_settings["recipient"]
    )

    _deliver_email(
        email_address,
        EMAIL_VERIFICATION_SUBJECT,
        body,
        sender=sender,
        html_body=html_body,
    )


def _send_password_reset_email(email_address: str, code: str, expires_at: datetime.datetime) -> None:
    if not email_address:
        raise ValueError('email_address is required')

    expiration_text = expires_at.strftime('%d.%m.%Y %H:%M UTC')
    body = (
        "Hallo,\n\n"
        "du hast eine Zurücksetzung deines Passworts für den Homework Manager angefordert."
        " Verwende den folgenden Code, um ein neues Passwort zu setzen:\n"
        f"{code}\n\n"
        f"Der Code ist bis {expiration_text} gültig.\n\n"
        "Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.\n"
    )

    html_body = (
        '<html><body>'
        '<p>Hallo,</p>'
        '<p>du hast eine Zurücksetzung deines Passworts für den Homework Manager angefordert. '
        'Verwende den folgenden Code, um ein neues Passwort zu setzen:</p>'
        f'<p><strong>{html.escape(code)}</strong></p>'
        f'<p>Der Code ist bis {html.escape(expiration_text)} gültig.</p>'
        '<p>Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>'
        '</body></html>'
    )

    contact_settings = _get_runtime_contact_settings()
    sender = (
        PASSWORD_RESET_FROM_ADDRESS
        or contact_settings["from_address"]
        or contact_settings["user"]
        or contact_settings["recipient"]
    )

    _deliver_email(
        email_address,
        PASSWORD_RESET_SUBJECT,
        body,
        sender=sender,
        html_body=html_body,
    )


def _send_password_change_email(email_address: str) -> None:
    if not email_address:
        raise ValueError('email_address is required')

    body = (
        "Hallo,\n\n"
        "dies ist eine Bestätigung: Dein Passwort für den Homework Manager wurde soeben geändert."
        " Falls du diese Änderung nicht selbst vorgenommen hast, sichere deinen Account bitte sofort "
        "und kontaktiere das Support-Team.\n"
    )

    html_body = (
        '<html><body>'
        '<p>Hallo,</p>'
        '<p>dies ist eine Bestätigung: Dein Passwort für den Homework Manager wurde soeben geändert.</p>'
        '<p>Falls du diese Änderung nicht selbst vorgenommen hast, sichere deinen Account bitte umgehend '
        'und kontaktiere das Support-Team.</p>'
        '</body></html>'
    )

    contact_settings = _get_runtime_contact_settings()
    sender = (
        PASSWORD_CHANGE_FROM_ADDRESS
        or contact_settings["from_address"]
        or contact_settings["user"]
        or contact_settings["recipient"]
    )

    _deliver_email(
        email_address,
        PASSWORD_CHANGE_SUBJECT,
        body,
        sender=sender,
        html_body=html_body,
    )


@app.route('/api/admin/logs', methods=['GET', 'OPTIONS'])
@require_role('admin')
def admin_logs() -> Response:
    if request.method == 'OPTIONS':
        return _cors_preflight()

    active_path = _resolve_active_log_path()
    if not active_path:
        return jsonify(status='error', message='log_unavailable'), 503

    lines_requested = request.args.get('lines', type=int) or LOG_DEFAULT_LINE_LIMIT
    lines_requested = max(1, min(lines_requested, LOG_MAX_LINE_LIMIT))

    try:
        exists = os.path.exists(active_path)
    except OSError:
        app.logger.exception('Failed to check existence of log file %s', active_path)
        return jsonify(status='error', message='log_unavailable'), 503

    if not exists:
        return jsonify(
            status='ok',
            logs='',
            source=active_path,
            missing=True,
            truncated=False,
            lines=lines_requested,
        )

    try:
        content, truncated = _tail_log_file(active_path, lines_requested)
    except FileNotFoundError:
        return jsonify(
            status='ok',
            logs='',
            source=active_path,
            missing=True,
            truncated=False,
            lines=lines_requested,
        )
    except OSError:
        app.logger.exception('Failed to read log file %s', active_path)
        return jsonify(status='error', message='log_unavailable'), 503

    return jsonify(
        status='ok',
        logs=content,
        source=active_path,
        missing=False,
        truncated=truncated,
        lines=lines_requested,
    )


@app.route('/api/admin/schedule-import', methods=['POST', 'OPTIONS'])
@require_role('admin')
def admin_schedule_import():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    json_payload = request.get_json(silent=True)
    class_identifier = (
        request.args.get('class')
        or request.args.get('class_identifier')
        or request.form.get('class')
        or request.form.get('class_identifier')
    )
    source = (
        request.args.get('source')
        or request.form.get('source')
        or 'admin_api'
    )

    schedule = None
    try:
        if 'file' in request.files and request.files['file'] and request.files['file'].filename:
            file_storage = request.files['file']
            schedule = load_schedule_from_json_bytes(file_storage.read())
        else:
            schedule_payload = None
            if json_payload is not None:
                if isinstance(json_payload, dict):
                    schedule_payload = json_payload.get('schedule', json_payload)
                    class_identifier = (
                        class_identifier
                        or json_payload.get('class_identifier')
                        or json_payload.get('class')
                    )
                    payload_source = json_payload.get('source')
                    if payload_source:
                        source = payload_source
                else:
                    schedule_payload = json_payload
            else:
                schedule_text = request.form.get('schedule')
                if schedule_text:
                    schedule = load_schedule_from_json_text(schedule_text)

            if schedule is None and schedule_payload is not None:
                schedule = load_schedule_from_payload(schedule_payload)

        if schedule is None:
            raise ScheduleImportError('No schedule payload provided')

        if not class_identifier:
            raise ScheduleImportError('Class identifier is required')

        source = source or 'admin_api'

        conn = get_connection()
        try:
            inserted, import_hash, _ = perform_schedule_import(
                conn,
                class_identifier,
                schedule,
                source,
            )
            conn.commit()
        except ScheduleImportError as exc:
            conn.rollback()
            return jsonify(status='error', message=str(exc)), 400
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    except ScheduleImportError as exc:
        return jsonify(status='error', message=str(exc)), 400

    return jsonify(status='ok', inserted=inserted, import_hash=import_hash)


def _load_exam_import_payload_from_bytes(raw: bytes) -> Dict[str, Any]:
    try:
        return json.loads(raw.decode('utf-8-sig'))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError('invalid_json') from exc


def _normalize_exam_import_entries(payload: Any, fallback_class_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        entries = payload
        top_level_class = fallback_class_id
    elif isinstance(payload, dict):
        entries = payload.get('entries')
        top_level_class = payload.get('class_id') or payload.get('class') or fallback_class_id
    else:
        raise ValueError('invalid_payload')

    if not isinstance(entries, list) or not entries:
        raise ValueError('entries_required')

    normalized: List[Dict[str, Any]] = []
    for index, item in enumerate(entries, start=1):
        if not isinstance(item, dict):
            raise ValueError(f'entry_{index}_invalid')

        typ = str(item.get('typ') or 'pruefung').strip()
        if typ != 'pruefung':
            raise ValueError(f'entry_{index}_invalid_type')

        class_values = item.get('class_ids')
        class_id = item.get('class_id') or item.get('class') or top_level_class
        if class_values is None:
            if not class_id:
                raise ValueError(f'entry_{index}_class_id_required')
            class_values = [class_id]

        try:
            class_ids = _normalize_entry_class_id_list(class_values)
        except ValueError as exc:
            raise ValueError(f'entry_{index}_invalid_class_id') from exc
        if not class_ids:
            raise ValueError(f'entry_{index}_class_id_required')

        datum_raw = item.get('datum') or item.get('date')
        datum = _parse_iso_date(datum_raw)
        if datum is None:
            raise ValueError(f'entry_{index}_invalid_date')

        enddatum_raw = item.get('enddatum') or item.get('end_date') or datum.isoformat()
        enddatum = _parse_iso_date(enddatum_raw)
        if enddatum is None or enddatum < datum:
            raise ValueError(f'entry_{index}_invalid_end_date')

        startzeit = item.get('startzeit') or item.get('start_time') or None
        endzeit = item.get('endzeit') or item.get('end_time') or None

        def normalize_time(value: Any) -> Optional[str]:
            if value in (None, ''):
                return None
            text = str(value).strip()
            if not text:
                return None
            if len(text) == 5:
                text = f'{text}:00'
            return text[:8]

        normalized.append({
            'class_ids': class_ids,
            'beschreibung': str(item.get('beschreibung') or item.get('description') or '').strip(),
            'datum': datum.isoformat(),
            'enddatum': enddatum.isoformat(),
            'startzeit': normalize_time(startzeit),
            'endzeit': normalize_time(endzeit),
            'typ': 'pruefung',
            'fach': str(item.get('fach') or item.get('subject') or '').strip(),
        })

    return normalized


@app.route('/api/admin/exam-import', methods=['POST', 'OPTIONS'])
@require_role('admin')
def admin_exam_import():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    fallback_class_id = (
        request.args.get('class')
        or request.args.get('class_id')
        or request.form.get('class')
        or request.form.get('class_id')
    )

    try:
        if 'file' in request.files and request.files['file'] and request.files['file'].filename:
            payload = _load_exam_import_payload_from_bytes(request.files['file'].read())
        else:
            payload = request.get_json(silent=True)
            if payload is None:
                text_payload = request.form.get('exam_import') or request.form.get('entries')
                if not text_payload:
                    raise ValueError('payload_required')
                payload = json.loads(text_payload)

        entries = _normalize_exam_import_entries(payload, fallback_class_id)
    except json.JSONDecodeError:
        return jsonify(status='error', message='invalid_json'), 400
    except ValueError as exc:
        return jsonify(status='error', message=str(exc)), 400

    if not entries:
        return jsonify(status='error', message='entries_required'), 400

    if HWM_DEBUG_MODE:
        created = sum(len(entry['class_ids']) for entry in entries)
        return jsonify(status='ok', imported=len(entries), created=created, debug=True)

    user_id = int(session.get('user_id') or 0)
    conn = get_connection()
    cur = conn.cursor()
    imported = 0
    created = 0
    try:
        for entry in entries:
            class_ids = entry['class_ids']
            first_class = class_ids[0]
            entry_id = _next_entry_id(conn)
            cur.execute(
                """
                INSERT INTO eintraege (id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    entry_id,
                    first_class,
                    entry['beschreibung'],
                    entry['datum'],
                    entry['enddatum'],
                    entry['startzeit'],
                    entry['endzeit'],
                    entry['typ'],
                    entry['fach'],
                    user_id or None,
                    0,
                ),
            )
            created += 1

            for extra_class in class_ids[1:]:
                cur.execute(
                    """
                    INSERT INTO eintraege (id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?)
                    """,
                    (
                        entry_id,
                        extra_class,
                        entry['beschreibung'],
                        entry['datum'],
                        entry['enddatum'],
                        entry['startzeit'],
                        entry['endzeit'],
                        entry['typ'],
                        entry['fach'],
                        user_id or None,
                        0,
                    ),
                )
                created += 1
            imported += 1

        conn.commit()
        _log_user_event('exam_import', imported=imported, created=created)
    except Exception as exc:
        conn.rollback()
        app.logger.exception('Exam import failed')
        return jsonify(status='error', message=str(exc)), 500
    finally:
        cur.close()
        conn.close()

    return jsonify(status='ok', imported=imported, created=created)


def _load_admin_user(conn) -> Optional[Dict[str, object]]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            "SELECT id, email, password_hash, is_active, email_verified_at, role FROM users WHERE role='admin' ORDER BY id ASC LIMIT 1"
        )
        row = cursor.fetchone()
    finally:
        cursor.close()

    if not row:
        return None

    is_active = row.get('is_active')
    try:
        if is_active is not None and int(is_active) == 0:
            return None
    except (TypeError, ValueError):
        pass

    return row


def _load_user_by_email(conn, email: str) -> Optional[Dict[str, object]]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            """
            SELECT id, email, password_hash, role, class_id, is_active, email_verified_at
            FROM users WHERE email=? LIMIT 1
            """,
            (email,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()


def _load_user_by_id(conn, user_id: int) -> Optional[Dict[str, object]]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            """
            SELECT id, email, role, class_id, is_active, email_verified_at
            FROM users WHERE id=? LIMIT 1
            """,
            (user_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()


def _load_class_slug(conn, class_id: Optional[int]) -> Optional[str]:
    if class_id is None:
        return None

    cursor = conn.cursor()
    try:
        cursor.execute("SELECT slug FROM classes WHERE id=?", (class_id,))
        row = cursor.fetchone()
        if not row:
            return None
        if isinstance(row, dict):
            return (row.get('slug') or '').strip() or None
        return (row[0] or '').strip() if row[0] else None
    finally:
        cursor.close()


def _load_class_by_slug(conn, slug: str) -> Optional[Dict[str, object]]:
    slug_value = (slug or '').strip()
    if not slug_value:
        return None

    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            "SELECT id, slug, title FROM classes WHERE LOWER(slug)=LOWER(?) LIMIT 1",
            (slug_value,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        row['id'] = int(row['id']) if row.get('id') is not None else None
        row['slug'] = (row.get('slug') or '').strip()
        return row
    finally:
        cursor.close()


def _mark_user_login(conn, user_id: int) -> None:
    cursor = conn.cursor()
    try:
        timestamp = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        cursor.execute(
            "UPDATE users SET last_login_at=? WHERE id=?",
            (timestamp, user_id),
        )
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        raise
    finally:
        cursor.close()


def _create_email_verification(conn, user: Dict[str, object]) -> Tuple[str, datetime.datetime]:
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM email_verifications WHERE user_id=?",
            (user['id'],),
        )
        code = generate_numeric_code(8)
        expires_at = calculate_token_expiry(EMAIL_VERIFICATION_CODE_LIFETIME_SECONDS)
        cursor.execute(
            """
            INSERT INTO email_verifications (user_id, email, code, expires_at, failed_attempts)
            VALUES (?, ?, ?, ?, 0)
            """,
            (user['id'], user['email'], code, expires_at),
        )
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        raise
    finally:
        cursor.close()

    try:
        _send_verification_email(user['email'], code, expires_at)
    except Exception as exc:
        raise RuntimeError('verification_email_failed') from exc

    return code, expires_at


def _create_password_reset(conn, user: Dict[str, object]) -> Tuple[str, datetime.datetime]:
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM password_resets WHERE user_id=?",
            (int(user['id']),),
        )
        code = generate_numeric_code(PASSWORD_RESET_CODE_LENGTH)
        expires_at = calculate_token_expiry(PASSWORD_RESET_CODE_LIFETIME_SECONDS)
        cursor.execute(
            """
            INSERT INTO password_resets (user_id, email, code, expires_at, used_at)
            VALUES (?, ?, ?, ?, NULL)
            """,
            (int(user['id']), user['email'], code, expires_at),
        )
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        raise
    finally:
        cursor.close()

    try:
        _send_password_reset_email(user['email'], code, expires_at)
    except Exception as exc:
        raise RuntimeError('password_reset_email_failed') from exc

    _log_user_event(
        'password_reset_requested',
        user_id=int(user['id']),
        email=user.get('email'),
        expires_at=expires_at.isoformat() if hasattr(expires_at, 'isoformat') else expires_at,
    )

    return code, expires_at


def _load_password_reset(conn, user_id: int, code: str) -> Optional[Dict[str, object]]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            """
            SELECT id, user_id, email, code, expires_at, used_at
            FROM password_resets
            WHERE user_id=? AND code=?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, code),
        )
        return cursor.fetchone()
    finally:
        cursor.close()


# The complete SQLite schema is created centrally in db.init_db() during app startup.


# ---- Klassen- und Stundenplanhilfen ----

def _resolve_class_id(raw_identifier, conn=None):
    owns_connection = conn is None
    if owns_connection:
        conn = get_connection()
    cursor = conn.cursor()
    try:
        identifier = (raw_identifier or "").strip()
        if not identifier:
            cursor.execute("SELECT id FROM classes WHERE slug=?", (DEFAULT_CLASS_SLUG,))
        elif identifier.isdigit():
            cursor.execute("SELECT id FROM classes WHERE id=?", (int(identifier),))
        else:
            cursor.execute("SELECT id FROM classes WHERE slug=?", (identifier.lower(),))
        row = cursor.fetchone()
    finally:
        cursor.close()
        if owns_connection and conn is not None:
            conn.close()
    if not row:
        raise ValueError("class_not_found")
    return int(row[0])


def _normalize_schedule_rows(rows):
    normalized = []
    for row in rows:
        normalized.append(
            {
                "start": row.get("start"),
                "end": row.get("end"),
                "fach": row.get("fach"),
                "raum": row.get("raum") or "-",
            }
        )
    return normalized


def _load_schedule_for_class(conn, class_id):
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            "SELECT tag, start, end, fach, raum FROM stundenplan_entries WHERE class_id=? ORDER BY tag, start",
            (class_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()

    schedule_map = {day: [] for day in WEEKDAY_ORDER}
    extra_days = {}
    for row in rows:
        entry = {
            "start": row.get("start"),
            "end": row.get("end"),
            "fach": row.get("fach"),
            "raum": row.get("raum") or "-",
        }
        day = row.get("tag")
        if day in schedule_map:
            schedule_map[day].append(entry)
        else:
            extra_days.setdefault(day, []).append(entry)

    ordered = OrderedDict()
    for day in WEEKDAY_ORDER:
        entries = schedule_map[day]
        entries.sort(key=lambda item: item.get("start") or "")
        ordered[day] = entries
    for day in sorted(extra_days):
        entries = extra_days[day]
        entries.sort(key=lambda item: item.get("start") or "")
        ordered[day] = entries
    return ordered


def _load_schedule_for_day(conn, class_id, weekday):
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            "SELECT start, end, fach, raum FROM stundenplan_entries WHERE class_id=? AND tag=? ORDER BY start",
            (class_id, weekday),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
    return _normalize_schedule_rows(rows)


def _class_has_schedule(conn, class_id):
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT 1 FROM stundenplan_entries WHERE class_id=? LIMIT 1",
            (class_id,),
        )
        return cursor.fetchone() is not None
    finally:
        cursor.close()


# Hilfsfunktion für die Formatierung von Zeitwerten aus SQLite/Python
def _format_time_value(value):
    if value is None:
        return None
    if isinstance(value, datetime.timedelta):
        total_seconds = int(value.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    if isinstance(value, datetime.datetime):
        return value.time().strftime('%H:%M:%S')
    if isinstance(value, datetime.time):
        return value.strftime('%H:%M:%S')
    if isinstance(value, str):
        return value
    return str(value)


def _parse_iso_date(value: Optional[str]) -> Optional[datetime.date]:
    if value is None:
        return None
    cleaned = str(value).strip()
    if not cleaned:
        return None
    if 'T' in cleaned:
        cleaned = cleaned.split('T', 1)[0]
    try:
        return datetime.date.fromisoformat(cleaned)
    except ValueError:
        return None


def _escape_ical_text(value: Optional[str]) -> str:
    text = str(value or "")
    text = text.replace("\\", "\\\\")
    text = text.replace(";", r"\;")
    text = text.replace(",", r"\,")
    text = text.replace("\r\n", r"\n").replace("\r", r"\n").replace("\n", r"\n")
    return text


def _format_ical_date(value: datetime.date) -> str:
    return value.strftime("%Y%m%d")


def _build_ics_content(entries: Iterable[Dict[str, Any]]) -> str:
    generated_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines: List[str] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Homework Manager//Calendar Export//DE",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    for entry in entries:
        due = entry.get("datum")
        end_due = entry.get("enddatum") or due
        if isinstance(due, str):
            try:
                due = datetime.date.fromisoformat(due)
            except ValueError:
                due = datetime.date.today()
        if isinstance(end_due, str):
            try:
                end_due = datetime.date.fromisoformat(end_due)
            except ValueError:
                end_due = due
        if not isinstance(due, datetime.date):
            due = datetime.date.today()
        if not isinstance(end_due, datetime.date):
            end_due = due
        if end_due < due:
            end_due = due

        subject = str(entry.get("fach") or "").strip()
        typ_label = str(entry.get("typ") or "").capitalize() or "Eintrag"
        title_parts = [typ_label]
        if subject:
            title_parts.append(subject)
        summary = " - ".join(title_parts)

        uid_prefix = "todo" if str(entry.get("typ") or "").lower() == "todo" else "eintrag"
        uid = f"{uid_prefix}-{entry.get('id')}@homework-manager.akzuwo.ch"

        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{_escape_ical_text(uid)}",
                f"DTSTAMP:{generated_utc}",
                f"SUMMARY:{_escape_ical_text(summary)}",
                f"DESCRIPTION:{_escape_ical_text(entry.get('beschreibung'))}",
                f"DTSTART;VALUE=DATE:{_format_ical_date(due)}",
                f"DTEND;VALUE=DATE:{_format_ical_date(end_due + datetime.timedelta(days=1))}",
                "END:VEVENT",
            ]
        )

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"

# ---------- ROUTES ----------

@app.route("/")
def root():
    return jsonify(status='ok', service='hwm-api')


@app.route('/healthz')
def healthz():
    return jsonify(status='ok')

@app.route('/calendar.ics')
@require_authenticated
def export_ics():
    """Erzeugt eine iCalendar-Datei mit allen zukünftigen Einträgen."""
    if HWM_DEBUG_MODE:
        ics_text = _build_ics_content(_debug_calendar_entries())
        return Response(
            ics_text,
            mimetype='text/calendar',
            headers={'Content-Disposition': 'attachment; filename="homework-debug.ics"'}
        )

    class_id = _get_session_entry_class_id()
    user_id = session.get('user_id')
    include_todos = request.args.get('include_todos', '1') != '0'
    conn = get_connection()
    cursor = conn.dict_cursor()
    entries = []
    if class_id:
        cursor.execute(
            """
            SELECT id, typ, beschreibung, datum, enddatum, fach
            FROM eintraege
            WHERE class_id=?
              AND COALESCE(is_private, 0)=0
              AND datum >= CURDATE()
            ORDER BY datum ASC
            """,
            (class_id,),
        )
        entries.extend(cursor.fetchall() or [])
    if include_todos and user_id is not None:
        cursor.execute(
            """
            SELECT id, typ, beschreibung, datum, enddatum, fach
            FROM eintraege
            WHERE COALESCE(is_private, 0)=1
              AND owner_user_id=?
              AND typ='todo'
              AND datum >= CURDATE()
            ORDER BY datum ASC
            """,
            (int(user_id),),
        )
        entries.extend(cursor.fetchall() or [])
    cursor.close()
    conn.close()

    ics_text = _build_ics_content(entries)
    return Response(
        ics_text,
        mimetype='text/calendar',
        headers={'Content-Disposition': 'attachment; filename="homework.ics"'}
    )

@app.route('/entries', methods=['GET'])
@app.route('/api/entries', methods=['GET'])
@require_authenticated
def entries_collection():
    """Gibt alle Einträge zurück."""
    if HWM_DEBUG_MODE:
        show_completed = _parse_bool(request.args.get('show_completed_todos'), default=False)
        entries = [
            entry for entry in _debug_calendar_entries()
            if show_completed or entry.get('todo_status') != TODO_STATUS_DONE
        ]
        return jsonify(entries)

    class_id = _get_session_entry_class_id()
    user_id = session.get('user_id')
    if user_id is None:
        _log_request_error(401, 'unauthorized')
        return jsonify(error='unauthorized', message='Missing session'), 401
    try:
        conn = get_connection()
    except Exception as exc:
        _log_request_error(500, 'Could not load entries', exc=exc)
        return jsonify(error='server_error', message='Could not load entries'), 500
    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            preferences = _load_calendar_preferences(conn, int(user_id))
            show_completed_todos = bool(preferences.get('show_completed_todos'))
            rows = []
            if class_id:
                cursor.execute(
                    """
                    SELECT id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id
                    FROM eintraege
                    WHERE class_id=?
                      AND COALESCE(is_private, 0)=0
                    ORDER BY datum ASC, startzeit ASC
                    """,
                    (class_id,),
                )
                for row in (cursor.fetchall() or []):
                    row['is_private'] = False
                    row['is_owned'] = False
                    row['can_edit'] = _can_edit_class_entry(
                        session.get('role'),
                        int(user_id),
                        row.get('owner_user_id'),
                        row.get('class_id') or class_id,
                    )
                    rows.append(row)

            cursor.execute(
                """
                SELECT id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, is_done, todo_status
                FROM eintraege
                WHERE COALESCE(is_private, 0)=1
                  AND owner_user_id=?
                  AND typ='todo'
                  AND (?=1 OR COALESCE(todo_status, CASE WHEN COALESCE(is_done, 0)=1 THEN ? ELSE ? END) <> ?)
                ORDER BY datum ASC, startzeit ASC
                """,
                (int(user_id), 1 if show_completed_todos else 0, TODO_STATUS_DONE, TODO_STATUS_OPEN, TODO_STATUS_DONE),
            )
            for row in (cursor.fetchall() or []):
                row['is_private'] = True
                row['is_owned'] = True
                row['can_edit'] = False
                row['can_update_status'] = True
                row['todo_status'] = _normalize_todo_status(row.get('todo_status'), row.get('is_done'))
                rows.append(row)

            rows.sort(key=lambda item: (str(item.get('datum') or ''), str(item.get('startzeit') or '')))
            for r in rows:
                if isinstance(r.get('datum'), datetime.date):
                    r['datum'] = r['datum'].strftime('%Y-%m-%d')
                else:
                    r['datum'] = str(r.get('datum') or '')
                r['startzeit'] = _format_time_value(r.get('startzeit'))
                r['endzeit'] = _format_time_value(r.get('endzeit'))
                end_date = r.get('enddatum')
                if isinstance(end_date, datetime.date):
                    r['enddatum'] = end_date.strftime('%Y-%m-%d')
                elif not end_date:
                    r['enddatum'] = r['datum']
                else:
                    r['enddatum'] = str(end_date)
        except sqlite3.Error as exc:
            _log_request_error(500, 'Could not load entries', exc=exc)
            return jsonify(error='server_error', message='Could not load entries'), 500
        finally:
            cursor.close()
    return jsonify(rows)


def _normalize_todo_status(value: Optional[object], is_done: Optional[object] = None) -> str:
    status = str(value or '').strip()
    if status in TODO_STATUS_VALUES:
        return status
    if _parse_bool(is_done, default=False):
        return TODO_STATUS_DONE
    return TODO_STATUS_OPEN


def _load_calendar_preferences(conn, user_id: int) -> Dict[str, Any]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            "SELECT muted_subjects, show_completed_todos FROM calendar_preferences WHERE user_id=?",
            (int(user_id),),
        )
        row = cursor.fetchone() or {}
    except sqlite3.Error:
        row = {}
    finally:
        cursor.close()
    muted_raw = row.get('muted_subjects')
    muted_subjects = []
    if muted_raw:
        try:
            parsed = json.loads(muted_raw)
            if isinstance(parsed, list):
                muted_subjects = [str(item) for item in parsed]
        except (TypeError, ValueError):
            muted_subjects = []
    return {
        'muted_subjects': muted_subjects,
        'show_completed_todos': bool(row.get('show_completed_todos')),
    }


def _time_to_minutes(value: Any) -> Optional[int]:
    text = _format_time_value(value)
    if text is None:
        return None
    try:
        hour, minute, *_ = str(text).split(':')
        return int(hour) * 60 + int(minute)
    except (TypeError, ValueError):
        return None


def _time_hhmm(value: Any) -> Optional[str]:
    text = _format_time_value(value)
    if not text:
        return None
    parts = str(text).split(':')
    if len(parts) < 2:
        return str(text)
    return f"{int(parts[0]):02d}:{int(parts[1]):02d}" if parts[0].isdigit() and parts[1].isdigit() else ':'.join(parts[:2])


def _date_from_db(value: Any) -> Optional[datetime.date]:
    if isinstance(value, datetime.datetime):
        return value.date()
    if isinstance(value, datetime.date):
        return value
    return _parse_iso_date(value)


def _is_instructional_subject(subject: Any) -> bool:
    text = str(subject or '').strip().lower()
    if not text:
        return False
    if text in TIMETABLE_NON_LESSON_SUBJECTS:
        return False
    return not any(text.startswith(prefix) for prefix in ('wochenende', 'unterrichtsfrei'))


def _lesson_datetime(day: datetime.date, value: Any) -> Optional[datetime.datetime]:
    minutes = _time_to_minutes(value)
    if minutes is None:
        return None
    return TIMETABLE_TIMEZONE.localize(
        datetime.datetime.combine(day, datetime.time(hour=minutes // 60, minute=minutes % 60))
    )


def _lesson_sort_key(lesson: Dict[str, Any]) -> Tuple[str, str, int]:
    return (lesson.get('start') or '', lesson.get('end') or '', int(lesson.get('id') or 0))


def _serialize_timetable_lesson(lesson: Dict[str, Any], *, include_date: bool = True) -> Dict[str, Any]:
    payload = {
        'id': lesson.get('id'),
        'subject': lesson.get('subject'),
        'fach': lesson.get('subject'),
        'room': lesson.get('room') or '-',
        'raum': lesson.get('room') or '-',
        'group': lesson.get('group'),
        'group_name': lesson.get('group'),
        'lesson_number': lesson.get('lesson_number'),
        'start': lesson.get('start'),
        'end': lesson.get('end'),
        'status': lesson.get('status') or 'normal',
        'badges': list(lesson.get('badges') or []),
        'is_real_lesson': bool(lesson.get('is_real_lesson')),
    }
    for key in (
        'original_subject',
        'new_subject',
        'original_room',
        'new_room',
        'original_start',
        'original_end',
        'new_start',
        'new_end',
        'reason',
        'exception_id',
    ):
        if lesson.get(key) not in (None, ''):
            payload[key] = lesson.get(key)
    if include_date:
        lesson_date = lesson.get('date')
        payload['date'] = lesson_date.isoformat() if isinstance(lesson_date, datetime.date) else lesson_date
    return payload


def _query_optional_rows(conn, query: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(query, params)
        return cursor.fetchall() or []
    except sqlite3.Error:
        app.logger.warning('Optional timetable query failed; treating table/column as unavailable', exc_info=True)
        return []
    finally:
        cursor.close()


def _load_timetable_base_lessons(conn, class_id: int, day: datetime.date) -> List[Dict[str, Any]]:
    weekday = day.strftime('%A')
    rows = _query_optional_rows(
        conn,
        """
        SELECT id, class_id, tag, lesson_number, start, end, fach, raum, group_name
        FROM stundenplan_entries
        WHERE class_id=? AND tag=?
        ORDER BY start, end, id
        """,
        (class_id, weekday),
    )
    if not rows:
        rows = _query_optional_rows(
            conn,
            """
            SELECT id, class_id, tag, start, end, fach, raum
            FROM stundenplan_entries
            WHERE class_id=? AND tag=?
            ORDER BY start, end, id
            """,
            (class_id, weekday),
        )
    lessons = []
    for index, row in enumerate(rows, start=1):
        subject = row.get('fach')
        status = 'normal'
        lessons.append(
            {
                'id': row.get('id'),
                'source': 'normal',
                'date': day,
                'class_id': class_id,
                'lesson_number': row.get('lesson_number') or index,
                'subject': subject,
                'room': row.get('raum') or '-',
                'group': row.get('group_name'),
                'start': _time_hhmm(row.get('start')),
                'end': _time_hhmm(row.get('end')),
                'status': status,
                'badges': ['Gruppe'] if row.get('group_name') else [],
                'is_real_lesson': _is_instructional_subject(subject) and bool(row.get('raum') not in (None, '-', '')),
            }
        )
    return lessons


def _load_timetable_exceptions(conn, class_id: int, start: datetime.date, end: datetime.date) -> List[Dict[str, Any]]:
    rows = _query_optional_rows(
        conn,
        """
        SELECT id, type, class_id, group_name, date, start_date, end_date, lesson_number,
               start_time, end_time, original_subject, new_subject, original_room, new_room,
               original_start_time, original_end_time, new_start_time, new_end_time,
               reason, visible_to_students
        FROM timetable_exceptions
        WHERE class_id=?
          AND COALESCE(start_date, date) <= ?
          AND COALESCE(end_date, date, start_date) >= ?
        ORDER BY id
        """,
        (class_id, end, start),
    )
    return rows


def _load_school_holiday_for_day(conn, day: datetime.date) -> Optional[Dict[str, Any]]:
    rows = _query_optional_rows(
        conn,
        """
        SELECT id, name, type, start_date, end_date, description
        FROM school_holidays
        WHERE start_date <= ? AND end_date >= ?
        ORDER BY start_date, id
        LIMIT 1
        """,
        (day, day),
    )
    return rows[0] if rows else None


def _load_special_days_for_day(conn, class_id: int, day: datetime.date) -> List[Dict[str, Any]]:
    return _query_optional_rows(
        conn,
        """
        SELECT id, name, scope, class_id, start_date, end_date, mode, description
        FROM special_days
        WHERE start_date <= ? AND end_date >= ?
          AND (scope='global' OR (scope='class' AND class_id=?))
        ORDER BY CASE WHEN scope='global' THEN 0 ELSE 1 END, id
        """,
        (day, day, class_id),
    )


def _load_special_day_lessons(conn, special_day_id: int, class_id: int, day: datetime.date) -> List[Dict[str, Any]]:
    rows = _query_optional_rows(
        conn,
        """
        SELECT id, special_day_id, class_id, subject, room, group_name, start_time, end_time, sort_order
        FROM special_day_lessons
        WHERE special_day_id=? AND class_id=?
        ORDER BY sort_order, start_time, id
        """,
        (special_day_id, class_id),
    )
    lessons = []
    for index, row in enumerate(rows, start=1):
        lessons.append(
            {
                'id': row.get('id'),
                'source': 'special_day',
                'date': day,
                'class_id': class_id,
                'lesson_number': index,
                'subject': row.get('subject'),
                'room': row.get('room') or '-',
                'group': row.get('group_name'),
                'start': _time_hhmm(row.get('start_time')),
                'end': _time_hhmm(row.get('end_time')),
                'status': 'special_day',
                'badges': ['Sondertag'] + (['Gruppe'] if row.get('group_name') else []),
                'is_real_lesson': _is_instructional_subject(row.get('subject')),
            }
        )
    return lessons


def _exception_applies_to_day(exception: Dict[str, Any], day: datetime.date) -> bool:
    start = _date_from_db(exception.get('start_date')) or _date_from_db(exception.get('date'))
    end = _date_from_db(exception.get('end_date')) or _date_from_db(exception.get('date')) or start
    return bool(start and end and start <= day <= end)


def _exception_matches_lesson(exception: Dict[str, Any], lesson: Dict[str, Any]) -> bool:
    exception_group = (exception.get('group_name') or '').strip()
    lesson_group = (lesson.get('group') or '').strip()
    if exception_group and exception_group != lesson_group:
        return False
    lesson_number = exception.get('lesson_number')
    if lesson_number not in (None, ''):
        try:
            if int(lesson_number) == int(lesson.get('lesson_number') or 0):
                return True
        except (TypeError, ValueError):
            pass
    start = _time_hhmm(exception.get('start_time') or exception.get('original_start_time'))
    end = _time_hhmm(exception.get('end_time') or exception.get('original_end_time'))
    if start and end:
        return start == lesson.get('start') and end == lesson.get('end')
    original_subject = (exception.get('original_subject') or '').strip()
    if original_subject and original_subject != (lesson.get('subject') or '').strip():
        return False
    return True


def _apply_lesson_exception(lesson: Dict[str, Any], exception: Dict[str, Any]) -> Dict[str, Any]:
    updated = dict(lesson)
    updated['exception_id'] = exception.get('id')
    updated['reason'] = exception.get('reason')
    ex_type = exception.get('type')
    if ex_type == 'cancellation':
        updated['status'] = 'cancellation'
        updated['badges'] = list(OrderedDict.fromkeys((updated.get('badges') or []) + ['Stundenausfall']))
        updated['is_real_lesson'] = False
    elif ex_type == 'room_change':
        original_room = exception.get('original_room') or updated.get('room')
        new_room = exception.get('new_room') or updated.get('room')
        updated.update(
            {
                'status': 'room_change',
                'original_room': original_room,
                'new_room': new_room,
                'room': new_room,
                'badges': list(OrderedDict.fromkeys((updated.get('badges') or []) + ['Raumwechsel'])),
            }
        )
    elif ex_type == 'replacement':
        original_subject = exception.get('original_subject') or updated.get('subject')
        new_subject = exception.get('new_subject') or updated.get('subject')
        updated.update(
            {
                'status': 'replacement',
                'original_subject': original_subject,
                'new_subject': new_subject,
                'subject': new_subject,
                'room': exception.get('new_room') or exception.get('original_room') or exception.get('new_room') or updated.get('room'),
                'badges': list(OrderedDict.fromkeys((updated.get('badges') or []) + ['Ersatzlektion'])),
                'is_real_lesson': _is_instructional_subject(new_subject),
            }
        )
    return updated


def _exception_to_extra_lesson(exception: Dict[str, Any], day: datetime.date, class_id: int) -> Dict[str, Any]:
    is_time_shift = exception.get('type') == 'time_shift'
    subject = exception.get('new_subject') or exception.get('original_subject') or 'Lektion'
    start = _time_hhmm(exception.get('new_start_time') if is_time_shift else exception.get('start_time'))
    end = _time_hhmm(exception.get('new_end_time') if is_time_shift else exception.get('end_time'))
    room = exception.get('new_room') or exception.get('original_room') or '-'
    return {
        'id': f"exception-{exception.get('id')}",
        'source': 'exception',
        'date': day,
        'class_id': class_id,
        'lesson_number': exception.get('lesson_number'),
        'subject': subject,
        'room': room,
        'group': exception.get('group_name'),
        'start': start,
        'end': end,
        'status': 'time_shift' if is_time_shift else 'extra_lesson',
        'badges': ['Zeitverschiebung'] if is_time_shift else ['Zusatzlektion'],
        'is_real_lesson': _is_instructional_subject(subject),
        'exception_id': exception.get('id'),
        'original_subject': exception.get('original_subject'),
        'original_room': exception.get('original_room'),
        'original_start': _time_hhmm(exception.get('original_start_time') or exception.get('start_time')),
        'original_end': _time_hhmm(exception.get('original_end_time') or exception.get('end_time')),
        'new_start': start,
        'new_end': end,
        'reason': exception.get('reason'),
    }


def _calculate_timetable_day(conn, class_id: int, day: datetime.date) -> Dict[str, Any]:
    weekday = day.strftime('%A').lower()
    holiday = _load_school_holiday_for_day(conn, day)
    if holiday:
        holiday_type = holiday.get('type') or 'holiday'
        return {
            'date': day.isoformat(),
            'weekday': weekday,
            'is_school_day': False,
            'day_status': holiday_type,
            'day_status_label': holiday.get('name'),
            'notice': f"Heute ist kein Unterricht: {holiday.get('name')}",
            'lessons': [],
            'applied_special_cases': list(_serialize_rows([holiday])),
        }

    special_days = _load_special_days_for_day(conn, class_id, day)
    no_lesson_day = next((item for item in special_days if item.get('mode') == 'no_lessons'), None)
    if no_lesson_day:
        return {
            'date': day.isoformat(),
            'weekday': weekday,
            'is_school_day': False,
            'day_status': 'special_day',
            'day_status_label': no_lesson_day.get('name'),
            'notice': f"Heute ist kein Unterricht: {no_lesson_day.get('name')}",
            'lessons': [],
            'applied_special_cases': list(_serialize_rows(special_days)),
        }

    replace_day = next((item for item in special_days if item.get('mode') == 'replace_plan'), None)
    if replace_day:
        lessons = _load_special_day_lessons(conn, replace_day.get('id'), class_id, day)
    else:
        lessons = _load_timetable_base_lessons(conn, class_id, day)

    exceptions = [row for row in _load_timetable_exceptions(conn, class_id, day, day) if _exception_applies_to_day(row, day)]
    shifted_exception_ids = set()
    final_lessons = []
    for lesson in lessons:
        current = dict(lesson)
        skip_original = False
        for exception in exceptions:
            if not _exception_matches_lesson(exception, current):
                continue
            if exception.get('type') == 'time_shift':
                shifted_exception_ids.add(exception.get('id'))
                skip_original = True
                break
            if exception.get('type') in {'cancellation', 'room_change', 'replacement'}:
                current = _apply_lesson_exception(current, exception)
        if not skip_original:
            final_lessons.append(current)

    for exception in exceptions:
        if exception.get('type') == 'extra_lesson' or exception.get('id') in shifted_exception_ids:
            final_lessons.append(_exception_to_extra_lesson(exception, day, class_id))

    final_lessons.sort(key=_lesson_sort_key)
    notice_day = next((item for item in special_days if item.get('mode') == 'show_notice_keep_plan'), None)
    day_status = 'special_day' if (replace_day or notice_day) else 'normal'
    day_label = (replace_day or notice_day or {}).get('name')
    if day.weekday() >= 5 and not any(lesson.get('is_real_lesson') for lesson in final_lessons):
        day_status = 'weekend'
        day_label = 'Wochenende'

    return {
        'date': day.isoformat(),
        'weekday': weekday,
        'is_school_day': bool(day.weekday() < 5 and day_status != 'weekend'),
        'day_status': day_status,
        'day_status_label': day_label,
        'notice': f"Sondertag: {day_label}" if notice_day else None,
        'lessons': [_serialize_timetable_lesson(lesson) for lesson in final_lessons],
        'applied_special_cases': list(_serialize_rows(special_days + exceptions)),
    }


def _find_next_real_lesson(conn, class_id: int, now: datetime.datetime) -> Optional[Dict[str, Any]]:
    if now.tzinfo is None:
        now = TIMETABLE_TIMEZONE.localize(now)
    else:
        now = now.astimezone(TIMETABLE_TIMEZONE)
    start_date = now.date()
    for offset in range(TIMETABLE_REAL_LESSON_SEARCH_DAYS):
        day = start_date + datetime.timedelta(days=offset)
        plan = _calculate_timetable_day(conn, class_id, day)
        for lesson in plan.get('lessons') or []:
            if not lesson.get('is_real_lesson'):
                continue
            start_dt = _lesson_datetime(day, lesson.get('start'))
            if start_dt and start_dt > now:
                next_lesson = dict(lesson)
                next_lesson['date'] = day.isoformat()
                return next_lesson
    return None


def _next_school_day(conn, class_id: int, after_day: datetime.date) -> Optional[datetime.date]:
    for offset in range(1, TIMETABLE_REAL_LESSON_SEARCH_DAYS):
        day = after_day + datetime.timedelta(days=offset)
        plan = _calculate_timetable_day(conn, class_id, day)
        if any(lesson.get('is_real_lesson') for lesson in plan.get('lessons') or []):
            return day
    return None


def _calculate_timetable_live(conn, class_id: int, now: Optional[datetime.datetime] = None) -> Dict[str, Any]:
    now = now or datetime.datetime.now(TIMETABLE_TIMEZONE)
    if now.tzinfo is None:
        now = TIMETABLE_TIMEZONE.localize(now)
    else:
        now = now.astimezone(TIMETABLE_TIMEZONE)
    day = now.date()
    day_plan = _calculate_timetable_day(conn, class_id, day)
    current_lesson = None
    for lesson in day_plan.get('lessons') or []:
        if not lesson.get('is_real_lesson'):
            continue
        start_dt = _lesson_datetime(day, lesson.get('start'))
        end_dt = _lesson_datetime(day, lesson.get('end'))
        if start_dt and end_dt and start_dt <= now < end_dt:
            current_lesson = dict(lesson)
            remaining = max(int((end_dt - now).total_seconds()), 0)
            total = max(int((end_dt - start_dt).total_seconds()), 0)
            current_lesson['remaining_seconds'] = remaining
            current_lesson['verbleibende_sekunden'] = remaining
            current_lesson['total_seconds'] = total
            current_lesson['gesamt_sekunden'] = total
            break

    next_lesson = _find_next_real_lesson(conn, class_id, now)
    next_start_dt = None
    if next_lesson:
        next_date = _parse_iso_date(next_lesson.get('date')) or day
        next_start_dt = _lesson_datetime(next_date, next_lesson.get('start'))

    return {
        'class_id': class_id,
        'date': day.isoformat(),
        'is_school_day': day_plan.get('is_school_day'),
        'day_status': day_plan.get('day_status'),
        'day_status_label': day_plan.get('day_status_label'),
        'notice': day_plan.get('notice'),
        'current_lesson': current_lesson,
        'next_lesson': next_lesson,
        'time_until_next_lesson_seconds': max(int((next_start_dt - now).total_seconds()), 0) if next_start_dt else None,
        'day_plan': day_plan,
    }


def _resolve_timetable_class_id_from_request(conn) -> Tuple[Optional[int], Optional[Tuple[Any, int]]]:
    _, auth_error = _authenticate_request()
    if auth_error:
        status, payload, exc = auth_error
        _log_request_error(status, payload.get('message', 'unauthorized'), exc=exc)
        return None, (jsonify(payload), status)
    role = session.get('role')
    session_class_id = _get_session_class_id()
    requested = request.args.get('class_id') or request.args.get('class')
    if role in {'admin', 'teacher'} and requested not in (None, ''):
        class_id = _ensure_int(requested, allow_none=False)
        if not class_id:
            try:
                class_id = _resolve_class_id(requested, conn)
            except ValueError:
                return None, (jsonify(status='error', message='class_not_found'), 404)
        return class_id, None
    if session_class_id is None:
        _log_request_error(403, 'class_required')
        return None, (jsonify(status='error', message='class_required'), 403)
    return session_class_id, None


def _legacy_live_payload(live: Dict[str, Any]) -> Dict[str, Any]:
    current = live.get('current_lesson') or {}
    next_lesson = live.get('next_lesson') or {}
    remaining = current.get('remaining_seconds') or 0
    minutes, seconds = divmod(int(remaining), 60)
    return {
        'fach': current.get('subject') or 'Frei',
        'verbleibend': f"{minutes:02d}:{seconds:02d}" if current else '-',
        'raum': current.get('room') or '-',
        'start': current.get('start'),
        'ende': current.get('end'),
        'verbleibende_sekunden': int(remaining),
        'gesamt_sekunden': int(current.get('total_seconds') or 0),
        'naechste_start': next_lesson.get('start') or '-',
        'naechste_start_iso': (
            f"{next_lesson.get('date')}T{next_lesson.get('start')}:00" if next_lesson.get('date') and next_lesson.get('start') else None
        ),
        'naechster_raum': next_lesson.get('room') or '-',
        'naechstes_fach': next_lesson.get('subject') or '-',
        'hinweis': live.get('notice'),
        'api_version': 2,
    }


def _legacy_day_payload(day_payload: Dict[str, Any]) -> OrderedDict:
    result = OrderedDict()
    day_date = _parse_iso_date(day_payload.get('date'))
    next_date = _parse_iso_date(day_payload.get('next_school_day'))
    if day_date:
        result[day_date.strftime('%A')] = [
            {'start': item.get('start'), 'end': item.get('end'), 'fach': item.get('subject'), 'raum': item.get('room')}
            for item in day_payload.get('day_plan') or []
        ]
    if next_date:
        result[next_date.strftime('%A')] = [
            {'start': item.get('start'), 'end': item.get('end'), 'fach': item.get('subject'), 'raum': item.get('room')}
            for item in day_payload.get('next_day_plan') or []
        ]
    return result


def _request_json_payload() -> Dict[str, Any]:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _date_range_from_payload(data: Dict[str, Any], *, require_date: bool = True) -> Tuple[Optional[str], Optional[str], Optional[Any]]:
    start = _parse_iso_date(data.get('start_date') or data.get('date'))
    end = _parse_iso_date(data.get('end_date') or data.get('date') or data.get('start_date'))
    if require_date and not start:
        return None, None, (jsonify(status='error', message='invalid_start_date'), 400)
    if start and end and end < start:
        return None, None, (jsonify(status='error', message='end_date_before_start_date'), 400)
    return start.isoformat() if start else None, (end or start).isoformat() if (end or start) else None, None


def _coerce_timetable_admin_class_id(data: Dict[str, Any]) -> Tuple[Optional[int], Optional[Any]]:
    role = session.get('role')
    session_class_id = _get_session_class_id()
    raw_class_id = data.get('class_id')
    class_id = _ensure_int(raw_class_id, allow_none=False)
    if role == 'class_admin':
        if session_class_id is None:
            return None, (jsonify(status='error', message='class_required'), 403)
        if class_id and class_id != session_class_id:
            return None, (jsonify(status='error', message='forbidden'), 403)
        return session_class_id, None
    if not class_id:
        return None, (jsonify(status='error', message='invalid_class_id'), 400)
    return class_id, None


def _normalize_short_time(value: Any) -> Optional[str]:
    cleaned = _time_hhmm(value)
    return cleaned if cleaned else None


def _timetable_exception_payload(data: Dict[str, Any], class_id: int) -> Tuple[Optional[Dict[str, Any]], Optional[Any]]:
    ex_type = str(data.get('type') or '').strip()
    if ex_type not in TIMETABLE_EXCEPTION_TYPES:
        return None, (jsonify(status='error', message='invalid_type'), 400)
    start_date, end_date, error = _date_range_from_payload(data)
    if error:
        return None, error
    payload = {
        'type': ex_type,
        'class_id': class_id,
        'group_name': (str(data.get('group_name')).strip() if data.get('group_name') not in (None, '') else None),
        'date': start_date if start_date == end_date else None,
        'start_date': start_date,
        'end_date': end_date,
        'lesson_number': _ensure_int(data.get('lesson_number'), allow_none=True),
        'start_time': _normalize_short_time(data.get('start_time')),
        'end_time': _normalize_short_time(data.get('end_time')),
        'original_subject': (str(data.get('original_subject')).strip() if data.get('original_subject') not in (None, '') else None),
        'new_subject': (str(data.get('new_subject')).strip() if data.get('new_subject') not in (None, '') else None),
        'original_room': (str(data.get('original_room')).strip() if data.get('original_room') not in (None, '') else None),
        'new_room': (str(data.get('new_room')).strip() if data.get('new_room') not in (None, '') else None),
        'original_start_time': _normalize_short_time(data.get('original_start_time')),
        'original_end_time': _normalize_short_time(data.get('original_end_time')),
        'new_start_time': _normalize_short_time(data.get('new_start_time')),
        'new_end_time': _normalize_short_time(data.get('new_end_time')),
        'reason': (str(data.get('reason')).strip() if data.get('reason') not in (None, '') else None),
        'visible_to_students': 1 if _parse_bool(data.get('visible_to_students'), default=True) else 0,
    }
    return payload, None


@app.route('/api/admin/timetable/exceptions', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin', 'class_admin')
def timetable_exceptions_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    with closing(conn):
        if request.method == 'GET':
            role = session.get('role')
            class_id = _ensure_int(request.args.get('class_id'), allow_none=True)
            if role == 'class_admin':
                class_id = _get_session_class_id()
            params: List[Any] = []
            where = []
            if class_id:
                where.append('class_id=?')
                params.append(class_id)
            query = (
                "SELECT id, type, class_id, group_name, date, start_date, end_date, lesson_number, "
                "start_time, end_time, original_subject, new_subject, original_room, new_room, "
                "original_start_time, original_end_time, new_start_time, new_end_time, reason, visible_to_students "
                "FROM timetable_exceptions"
            )
            if where:
                query += ' WHERE ' + ' AND '.join(where)
            query += ' ORDER BY COALESCE(start_date, date) DESC, id DESC'
            return jsonify(status='ok', data=list(_serialize_rows(_query_optional_rows(conn, query, tuple(params)))))

        data = _request_json_payload()
        class_id, error = _coerce_timetable_admin_class_id(data)
        if error:
            return error
        payload, error = _timetable_exception_payload(data, class_id)
        if error:
            return error
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO timetable_exceptions
                (type, class_id, group_name, date, start_date, end_date, lesson_number, start_time, end_time,
                 original_subject, new_subject, original_room, new_room, original_start_time, original_end_time,
                 new_start_time, new_end_time, reason, created_by, visible_to_students)
                VALUES
                (%(type)s, %(class_id)s, %(group_name)s, %(date)s, %(start_date)s, %(end_date)s, %(lesson_number)s,
                 %(start_time)s, %(end_time)s, %(original_subject)s, %(new_subject)s, %(original_room)s, %(new_room)s,
                 %(original_start_time)s, %(original_end_time)s, %(new_start_time)s, %(new_end_time)s,
                 %(reason)s, %(created_by)s, %(visible_to_students)s)
                """,
                {**payload, 'created_by': session.get('user_id')},
            )
            exception_id = cursor.lastrowid
            _log_admin_action(conn, 'create', 'timetable_exception', exception_id, payload)
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()
        return jsonify(status='ok', id=exception_id)


@app.route('/api/admin/timetable/exceptions/<int:exception_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@require_role('admin', 'class_admin')
def timetable_exceptions_resource(exception_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    with closing(conn):
        existing = _query_optional_rows(conn, "SELECT id, class_id FROM timetable_exceptions WHERE id=?", (exception_id,))
        if not existing:
            return jsonify(status='error', message='exception_not_found'), 404
        if session.get('role') == 'class_admin' and existing[0].get('class_id') != _get_session_class_id():
            return jsonify(status='error', message='forbidden'), 403
        if request.method == 'DELETE':
            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM timetable_exceptions WHERE id=?", (exception_id,))
                _log_admin_action(conn, 'delete', 'timetable_exception', exception_id)
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return jsonify(status='ok')

        data = _request_json_payload()
        class_id, error = _coerce_timetable_admin_class_id({**data, 'class_id': data.get('class_id') or existing[0].get('class_id')})
        if error:
            return error
        payload, error = _timetable_exception_payload({**data, 'class_id': class_id}, class_id)
        if error:
            return error
        assignments = ', '.join([f"{key}=%({key})s" for key in payload.keys()])
        cursor = conn.cursor()
        try:
            cursor.execute(f"UPDATE timetable_exceptions SET {assignments}, updated_at=CURRENT_TIMESTAMP WHERE id=%(id)s", {**payload, 'id': exception_id})
            _log_admin_action(conn, 'update', 'timetable_exception', exception_id, payload)
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()
        return jsonify(status='ok')


@app.route('/api/admin/timetable/holidays', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin')
def timetable_holidays_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    with closing(conn):
        if request.method == 'GET':
            rows = _query_optional_rows(conn, "SELECT id, name, type, start_date, end_date, description FROM school_holidays ORDER BY start_date DESC, id DESC")
            return jsonify(status='ok', data=list(_serialize_rows(rows)))
        data = _request_json_payload()
        name = str(data.get('name') or '').strip()
        holiday_type = str(data.get('type') or '').strip()
        if not name or holiday_type not in {'holiday', 'public_holiday'}:
            return jsonify(status='error', message='invalid_holiday'), 400
        start_date, end_date, error = _date_range_from_payload(data)
        if error:
            return error
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO school_holidays (name, type, start_date, end_date, description, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (name, holiday_type, start_date, end_date, data.get('description'), session.get('user_id')),
            )
            item_id = cursor.lastrowid
            _log_admin_action(conn, 'create', 'school_holiday', item_id, {'name': name, 'type': holiday_type})
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()
        return jsonify(status='ok', id=item_id)


@app.route('/api/admin/timetable/holidays/<int:item_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@require_role('admin')
def timetable_holidays_resource(item_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    with closing(conn):
        if request.method == 'DELETE':
            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM school_holidays WHERE id=?", (item_id,))
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return jsonify(status='ok')
        data = _request_json_payload()
        start_date, end_date, error = _date_range_from_payload(data)
        if error:
            return error
        name = str(data.get('name') or '').strip()
        holiday_type = str(data.get('type') or '').strip()
        if not name or holiday_type not in {'holiday', 'public_holiday'}:
            return jsonify(status='error', message='invalid_holiday'), 400
        cursor = conn.cursor()
        try:
            cursor.execute(
                "UPDATE school_holidays SET name=?, type=?, start_date=?, end_date=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                (name, holiday_type, start_date, end_date, data.get('description'), item_id),
            )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()
        return jsonify(status='ok')


@app.route('/api/admin/timetable/special-days', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin')
def timetable_special_days_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    with closing(conn):
        if request.method == 'GET':
            rows = _query_optional_rows(conn, "SELECT id, name, scope, class_id, start_date, end_date, mode, description FROM special_days ORDER BY start_date DESC, id DESC")
            return jsonify(status='ok', data=list(_serialize_rows(rows)))
        data = _request_json_payload()
        name = str(data.get('name') or '').strip()
        scope = str(data.get('scope') or 'global').strip()
        mode = str(data.get('mode') or '').strip()
        class_id = _ensure_int(data.get('class_id'), allow_none=True)
        if not name or scope not in {'global', 'class'} or mode not in SPECIAL_DAY_MODES or (scope == 'class' and not class_id):
            return jsonify(status='error', message='invalid_special_day'), 400
        start_date, end_date, error = _date_range_from_payload(data)
        if error:
            return error
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO special_days (name, scope, class_id, start_date, end_date, mode, description, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (name, scope, class_id if scope == 'class' else None, start_date, end_date, mode, data.get('description'), session.get('user_id')),
            )
            special_day_id = cursor.lastrowid
            for index, lesson in enumerate(data.get('lessons') or []):
                cursor.execute(
                    """
                    INSERT INTO special_day_lessons
                    (special_day_id, class_id, subject, room, group_name, start_time, end_time, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        special_day_id,
                        _ensure_int(lesson.get('class_id'), allow_none=True) or class_id,
                        str(lesson.get('subject') or lesson.get('fach') or '').strip(),
                        lesson.get('room') or lesson.get('raum'),
                        lesson.get('group_name'),
                        _normalize_short_time(lesson.get('start_time') or lesson.get('start')),
                        _normalize_short_time(lesson.get('end_time') or lesson.get('end')),
                        index,
                    ),
                )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()
        return jsonify(status='ok', id=special_day_id)


@app.route('/api/admin/timetable/special-days/<int:item_id>', methods=['DELETE', 'OPTIONS'])
@require_role('admin')
def timetable_special_days_resource(item_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    with closing(conn):
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM special_day_lessons WHERE special_day_id=?", (item_id,))
            cursor.execute("DELETE FROM special_days WHERE id=?", (item_id,))
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()
    return jsonify(status='ok')


@app.route('/api/admin/timetable/preview', methods=['GET'])
@require_role('admin')
def timetable_admin_preview():
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503
    class_id = _ensure_int(request.args.get('class_id'), allow_none=False)
    if not class_id:
        return jsonify(status='error', message='invalid_class_id'), 400
    requested_date = _parse_iso_date(request.args.get('date')) or datetime.datetime.now(TIMETABLE_TIMEZONE).date()
    with closing(conn):
        if not _class_has_schedule(conn, class_id):
            return jsonify({'error': 'schedule_unavailable'}), 404
        now = TIMETABLE_TIMEZONE.localize(datetime.datetime.combine(requested_date, datetime.datetime.now(TIMETABLE_TIMEZONE).time().replace(microsecond=0)))
        live = _calculate_timetable_live(conn, class_id, now)
        day = _calculate_timetable_day(conn, class_id, requested_date)
    return jsonify(status='ok', class_id=class_id, date=requested_date.isoformat(), live=live, day=day, user_view={'live': live, 'day_plan': day.get('lessons')})

    raw_subjects = row.get('muted_subjects') if row else ''
    muted_subjects: List[str] = []
    if raw_subjects:
        try:
            parsed = json.loads(raw_subjects)
            if isinstance(parsed, list):
                muted_subjects = [str(item).strip() for item in parsed if str(item).strip()]
        except (TypeError, ValueError):
            muted_subjects = []
    return {
        'muted_subjects': list(OrderedDict.fromkeys(muted_subjects)),
        'show_completed_todos': bool(row.get('show_completed_todos')) if row else False,
    }


def _can_edit_class_entry(role: Optional[str], user_id: int, owner_user_id: Optional[object], class_id: Optional[str]) -> bool:
    if role == 'admin':
        return True
    if role == 'class_admin':
        allowed_class = _get_session_entry_class_id() or ''
        return bool(allowed_class and class_id == allowed_class)
    if role == 'teacher':
        try:
            return owner_user_id is not None and int(owner_user_id) == int(user_id)
        except (TypeError, ValueError):
            return False
    return False


@app.route('/api/calendar/preferences', methods=['GET', 'PUT', 'OPTIONS'])
@require_authenticated
def calendar_preferences():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        return jsonify(status='ok', data=_debug_calendar_preferences())

    user_id = session.get('user_id')
    if user_id is None:
        return jsonify(error='unauthorized', message='Missing session'), 401
    user_id = int(user_id)

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        if request.method == 'GET':
            return jsonify(status='ok', data=_load_calendar_preferences(conn, user_id))

        data = request.json or {}
        muted_raw = data.get('muted_subjects', [])
        if muted_raw is None:
            muted_raw = []
        if not isinstance(muted_raw, list):
            return jsonify(status='error', message='invalid_muted_subjects'), 400
        muted_subjects = [
            str(item).strip()
            for item in muted_raw
            if str(item).strip()
        ]
        muted_subjects = list(OrderedDict.fromkeys(muted_subjects))
        show_completed_todos = _parse_bool(data.get('show_completed_todos'), default=False)
        cursor = conn.cursor()
        try:
            now = datetime.datetime.utcnow()
            cursor.execute(
                """
                INSERT INTO calendar_preferences (user_id, muted_subjects, show_completed_todos, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                  muted_subjects=excluded.muted_subjects,
                  show_completed_todos=excluded.show_completed_todos,
                  updated_at=excluded.updated_at
                """,
                (
                    user_id,
                    json.dumps(muted_subjects),
                    1 if show_completed_todos else 0,
                    now,
                    now,
                ),
            )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        return jsonify(status='ok', data=_load_calendar_preferences(conn, user_id))


def _resolve_weekly_preview_locale() -> str:
    allowed = {'de', 'en', 'it', 'fr'}
    raw = (request.args.get('lang') or '').strip().lower()
    if raw in allowed:
        return raw
    header = (request.headers.get('Accept-Language') or '').lower()
    for candidate in re.split(r'[,; ]+', header):
        code = candidate.split('-')[0].strip()
        if code in allowed:
            return code
    return 'en'


def _serialize_weekly_date(value: object) -> str:
    if isinstance(value, datetime.date):
        return value.isoformat()
    return str(value or '')


def _serialize_weekly_time(value: object) -> str:
    if value is None:
        return ''
    if isinstance(value, datetime.time):
        return value.strftime('%H:%M:%S')
    text = str(value).strip()
    return text[:8] if text else ''


def _serialize_vault_updated_at(value: object) -> Optional[str]:
    if value is None:
        return None
    return _serialize_value(value)


def _validate_encrypted_grade_vault_payload(vault: object) -> bool:
    if not isinstance(vault, dict):
        return False
    if vault.get('version') != 1:
        return False
    if vault.get('algorithm') != 'AES-GCM':
        return False
    if vault.get('kdf') != 'PBKDF2':
        return False
    iterations = vault.get('iterations')
    if not isinstance(iterations, int) or iterations < 100000:
        return False
    for field_name in ('salt', 'iv', 'ciphertext'):
        value = vault.get(field_name)
        if not isinstance(value, str) or not value.strip():
            return False
    return True


@app.route('/api/grades/vault', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@require_authenticated
def encrypted_grade_vault():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    user_id = int(session.get('user_id') or 0)
    if user_id <= 0:
        return jsonify(status='error', message='unauthorized'), 401

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        if request.method == 'GET':
            cursor = conn.dict_cursor()
            try:
                cursor.execute(
                    "SELECT vault_json, revision, updated_at FROM encrypted_grade_vaults WHERE user_id=?",
                    (user_id,),
                )
                row = cursor.fetchone()
            finally:
                cursor.close()
            if not row:
                return jsonify(status='ok', data={'vault_json': None, 'revision': 0, 'updated_at': None})
            return jsonify(
                status='ok',
                data={
                    'vault_json': row.get('vault_json'),
                    'revision': int(row.get('revision') or 0),
                    'updated_at': _serialize_vault_updated_at(row.get('updated_at')),
                },
            )

        if request.method == 'DELETE':
            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM encrypted_grade_vaults WHERE user_id=?", (user_id,))
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return jsonify(status='ok')

        data = request.get_json(silent=True) or {}
        vault = data.get('vault_json')
        base_revision = data.get('baseRevision')
        if not isinstance(base_revision, int) or base_revision < 0:
            return jsonify(status='error', message='invalid_base_revision'), 400
        if not _validate_encrypted_grade_vault_payload(vault):
            return jsonify(status='error', message='invalid_vault'), 400

        vault_json = json.dumps(vault, ensure_ascii=False, separators=(',', ':'))
        now = datetime.datetime.utcnow()
        cursor = conn.dict_cursor()
        try:
            cursor.execute(
                "SELECT revision FROM encrypted_grade_vaults WHERE user_id=?",
                (user_id,),
            )
            row = cursor.fetchone()
            current_revision = int(row.get('revision') or 0) if row else 0
            if base_revision != current_revision:
                return jsonify(
                    status='error',
                    message='revision_conflict',
                    currentRevision=current_revision,
                ), 409

            next_revision = current_revision + 1
            if row:
                cursor.execute(
                    """
                    UPDATE encrypted_grade_vaults
                    SET vault_json=?, revision=?, updated_at=?
                    WHERE user_id=?
                    """,
                    (vault_json, next_revision, now, user_id),
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO encrypted_grade_vaults (user_id, vault_json, revision, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (user_id, vault_json, next_revision, now, now),
                )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        return jsonify(
            status='ok',
            data={
                'revision': next_revision,
                'updated_at': _serialize_vault_updated_at(now),
            },
        )


def _collect_weekly_preview_entries(conn, class_id: str, user_id: int, start_date: datetime.date, end_date: datetime.date, include_todos: bool) -> List[Dict[str, str]]:
    cursor = conn.dict_cursor()
    rows: List[Dict[str, str]] = []
    try:
        cursor.execute(
            """
            SELECT typ, datum, enddatum, startzeit, endzeit, fach, beschreibung
            FROM eintraege
            WHERE class_id=?
              AND COALESCE(is_private, 0)=0
              AND datum >= ?
              AND datum <= ?
            ORDER BY datum ASC, startzeit ASC
            """,
            (class_id, start_date.isoformat(), end_date.isoformat()),
        )
        for row in (cursor.fetchall() or []):
            rows.append(
                {
                    'typ': str(row.get('typ') or ''),
                    'datum': _serialize_weekly_date(row.get('datum')),
                    'enddatum': _serialize_weekly_date(row.get('enddatum') or row.get('datum')),
                    'startzeit': _serialize_weekly_time(row.get('startzeit')),
                    'endzeit': _serialize_weekly_time(row.get('endzeit')),
                    'fach': str(row.get('fach') or ''),
                    'beschreibung': str(row.get('beschreibung') or ''),
                }
            )

        if include_todos:
            cursor.execute(
                """
                SELECT typ, datum, enddatum, startzeit, endzeit, fach, beschreibung
                FROM eintraege
                WHERE COALESCE(is_private, 0)=1
                  AND owner_user_id=?
                  AND typ='todo'
                  AND datum >= ?
                  AND datum <= ?
                ORDER BY datum ASC, startzeit ASC
                """,
                (int(user_id), start_date.isoformat(), end_date.isoformat()),
            )
            for row in (cursor.fetchall() or []):
                rows.append(
                    {
                        'typ': 'todo',
                        'datum': _serialize_weekly_date(row.get('datum')),
                        'enddatum': _serialize_weekly_date(row.get('enddatum') or row.get('datum')),
                        'startzeit': _serialize_weekly_time(row.get('startzeit')),
                        'endzeit': _serialize_weekly_time(row.get('endzeit')),
                        'fach': str(row.get('fach') or ''),
                        'beschreibung': str(row.get('beschreibung') or ''),
                    }
                )
    finally:
        cursor.close()

    rows.sort(key=lambda item: (item.get('datum') or '', item.get('startzeit') or ''))
    return rows


def _build_weekly_preview_payload(entries: List[Dict[str, str]]) -> List[Dict[str, str]]:
    selected = entries[:WEEKLY_PREVIEW_MAX_ITEMS]
    payload: List[Dict[str, str]] = []
    total_chars = 0
    for item in selected:
        prepared = {
            'typ': str(item.get('typ') or ''),
            'datum': str(item.get('datum') or ''),
            'enddatum': str(item.get('enddatum') or item.get('datum') or ''),
            'startzeit': str(item.get('startzeit') or ''),
            'endzeit': str(item.get('endzeit') or ''),
            'fach': str(item.get('fach') or ''),
            'beschreibung': str(item.get('beschreibung') or ''),
        }
        candidate_len = len(json.dumps(prepared, ensure_ascii=False))
        if payload and (total_chars + candidate_len) > WEEKLY_PREVIEW_MAX_CHARS:
            break
        total_chars += candidate_len
        payload.append(prepared)
    return payload


def _compute_weekly_preview_source_hash(payload: List[Dict[str, str]]) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode('utf-8')
    return hashlib.sha256(encoded).hexdigest()


def _load_weekly_preview_cache(conn, user_id: int, class_id: str, locale: str, window_start: datetime.date, window_end: datetime.date, include_todos: bool) -> Optional[Dict[str, object]]:
    cursor = conn.dict_cursor()
    try:
        cursor.execute(
            """
            SELECT id, summary_markdown, source_hash, created_at, expires_at
            FROM weekly_preview_cache
            WHERE user_id=?
              AND class_id=?
              AND locale=?
              AND window_start=?
              AND window_end=?
              AND include_todos=?
              AND expires_at > ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (
                int(user_id),
                class_id,
                locale,
                window_start.isoformat(),
                window_end.isoformat(),
                1 if include_todos else 0,
                datetime.datetime.utcnow(),
            ),
        )
        return cursor.fetchone()
    finally:
        cursor.close()


def _store_weekly_preview_cache(
    conn,
    user_id: int,
    class_id: str,
    locale: str,
    window_start: datetime.date,
    window_end: datetime.date,
    include_todos: bool,
    summary_markdown: str,
    source_hash: str,
) -> Tuple[datetime.datetime, datetime.datetime]:
    created_at = datetime.datetime.utcnow()
    expires_at = created_at + datetime.timedelta(minutes=WEEKLY_PREVIEW_CACHE_TTL_MINUTES)
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM weekly_preview_cache
            WHERE user_id=?
              AND class_id=?
              AND locale=?
              AND window_start=?
              AND window_end=?
              AND include_todos=?
            """,
            (
                int(user_id),
                class_id,
                locale,
                window_start.isoformat(),
                window_end.isoformat(),
                1 if include_todos else 0,
            ),
        )
        cursor.execute(
            """
            INSERT INTO weekly_preview_cache
                (user_id, class_id, locale, window_start, window_end, include_todos, summary_markdown, source_hash, created_at, expires_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                int(user_id),
                class_id,
                locale,
                window_start.isoformat(),
                window_end.isoformat(),
                1 if include_todos else 0,
                summary_markdown,
                source_hash,
                created_at,
                expires_at,
            ),
        )
        conn.commit()
    finally:
        cursor.close()
    return created_at, expires_at


def _sanitize_weekly_summary(summary: str, locale: str = 'en') -> str:
    text = (summary or '').strip()
    if not text:
        return ''
    intro_line = ''
    detail_lines: List[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        is_bullet = line.startswith('-') or line.startswith('•')
        clean = line.lstrip('-•').strip()
        clean = re.sub(
            r"\b(\d{4}-\d{2}-\d{2})\b",
            lambda match: _weekly_relative_day_label(match.group(1), locale),
            clean,
        )
        if not clean:
            continue
        if not intro_line and not is_bullet:
            intro_line = clean
            continue
        detail_lines.append(f"- {clean}")
        if len(detail_lines) >= WEEKLY_PREVIEW_OUTPUT_MAX_BULLETS:
            break

    if not intro_line and detail_lines:
        first_detail = detail_lines.pop(0).lstrip('-').strip()
        intro_line = first_detail

    parts: List[str] = []
    if intro_line:
        parts.append(intro_line)
    parts.extend(detail_lines)
    if not parts:
        return ''
    output = '\n'.join(parts)
    return output[:WEEKLY_PREVIEW_OUTPUT_MAX_CHARS].strip()


def _weekly_relative_day_label(date_iso: str, locale: str) -> str:
    try:
        target_date = datetime.date.fromisoformat(str(date_iso))
    except ValueError:
        return str(date_iso)

    today = datetime.date.today()
    delta = (target_date - today).days
    weekday_map = {
        'de': ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
        'en': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'it': ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'],
        'fr': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
    }
    weekdays = weekday_map.get(locale, weekday_map['en'])
    weekday_name = weekdays[target_date.weekday()]

    if locale == 'de':
        if delta == 0:
            return 'Heute'
        if delta == 1:
            return 'Morgen'
        if delta == 2:
            return 'Übermorgen'
        return f"Am {weekday_name}"
    if locale == 'it':
        if delta == 0:
            return 'Oggi'
        if delta == 1:
            return 'Domani'
        if delta == 2:
            return 'Dopodomani'
        return f"{weekday_name.capitalize()}"
    if locale == 'fr':
        if delta == 0:
            return "Aujourd'hui"
        if delta == 1:
            return 'Demain'
        if delta == 2:
            return 'Après-demain'
        return f"{weekday_name.capitalize()}"

    if delta == 0:
        return 'Today'
    if delta == 1:
        return 'Tomorrow'
    if delta == 2:
        return 'The day after tomorrow'
    return f"On {weekday_name}"


def _weekly_intro_line(payload: List[Dict[str, str]], locale: str) -> str:
    counts = {'pruefung': 0, 'hausaufgabe': 0, 'event': 0, 'ferien': 0, 'todo': 0}
    for item in payload:
        typ = str(item.get('typ') or '')
        if typ in counts:
            counts[typ] += 1

    total = sum(counts.values())
    if locale == 'de':
        if total == 0:
            return 'In den nächsten 7 Tagen hast du keine Einträge.'
        return (
            f"In den nächsten 7 Tagen hast du {counts['pruefung']} Prüfungen, "
            f"{counts['hausaufgabe']} Hausaufgaben, {counts['todo']} ToDos und {counts['event']} Events."
        )
    if locale == 'it':
        if total == 0:
            return 'Nei prossimi 7 giorni non hai voci.'
        return (
            f"Nei prossimi 7 giorni hai {counts['pruefung']} verifiche, "
            f"{counts['hausaufgabe']} compiti, {counts['todo']} ToDo e {counts['event']} eventi."
        )
    if locale == 'fr':
        if total == 0:
            return "Tu n'as aucun élément sur les 7 prochains jours."
        return (
            f"Sur les 7 prochains jours, tu as {counts['pruefung']} examens, "
            f"{counts['hausaufgabe']} devoirs, {counts['todo']} ToDos et {counts['event']} événements."
        )
    if total == 0:
        return 'You have no entries in the next 7 days.'
    return (
        f"In the next 7 days you have {counts['pruefung']} exams, "
        f"{counts['hausaufgabe']} homework items, {counts['todo']} todos and {counts['event']} events."
    )


def _generate_weekly_preview_fallback(payload: List[Dict[str, str]], locale: str) -> str:
    if not payload:
        return _weekly_intro_line(payload, locale)

    lines = [_weekly_intro_line(payload, locale)]
    for item in payload[:WEEKLY_PREVIEW_OUTPUT_MAX_BULLETS]:
        typ = str(item.get('typ') or '')
        when_label = _weekly_relative_day_label(str(item.get('datum') or ''), locale)
        subject = str(item.get('fach') or '').strip()
        summary = str(item.get('beschreibung') or '').splitlines()[0].strip() or ''
        time_label = ''
        if item.get('startzeit'):
            time_label = str(item.get('startzeit'))[:5]

        if locale == 'de':
            if typ == 'pruefung':
                detail = f"{when_label} hast du einen {subject} Test." if subject else f"{when_label} hast du eine Prüfung."
            elif typ == 'hausaufgabe':
                detail = f"{when_label} ist eine Hausaufgabe in {subject} fällig." if subject else f"{when_label} ist eine Hausaufgabe fällig."
            elif typ == 'todo':
                detail = f"{when_label} steht dein ToDo an: {summary}." if summary else f"{when_label} hast du ein persönliches ToDo."
            elif typ == 'ferien':
                detail = f"{when_label} beginnen Ferien."
            else:
                detail = f"{when_label} hast du ein Event: {summary}." if summary else f"{when_label} hast du ein Event."
            if time_label:
                detail = detail.replace('.', f" um {time_label}.", 1)
        else:
            if typ == 'pruefung':
                detail = f"{when_label} you have an exam{f' in {subject}' if subject else ''}."
            elif typ == 'hausaufgabe':
                detail = f"{when_label} a homework task is due{f' in {subject}' if subject else ''}."
            elif typ == 'todo':
                detail = f"{when_label} your todo is: {summary}." if summary else f"{when_label} you have a personal todo."
            elif typ == 'ferien':
                detail = f"{when_label} holidays begin."
            else:
                detail = f"{when_label} you have an event: {summary}." if summary else f"{when_label} you have an event."
            if time_label:
                detail = detail.replace('.', f" at {time_label}.", 1)

        lines.append(f"- {detail}")

    return _sanitize_weekly_summary('\n'.join(lines), locale=locale)


def _generate_weekly_preview_with_groq(payload: List[Dict[str, str]], locale: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError('groq_api_key_missing')

    language_hint = {
        'de': 'German',
        'en': 'English',
        'it': 'Italian',
        'fr': 'French',
    }.get(locale, 'English')

    prompt_payload = json.dumps(payload, ensure_ascii=False)
    system_prompt = (
        "You are an assistant that summarizes upcoming school workload. "
        "Use only the provided events. Do not invent details. "
        f"Respond strictly in {language_hint}. "
        "Output format is strict: "
        "line 1 = one concise overview sentence with counts for the next 7 days; "
        "following lines = compact bullet points with '-' prefixes. "
        "Use relative day wording (today, tomorrow, day after tomorrow, weekday names), never raw ISO dates. "
        "Maximum 8 bullet points and 900 characters total."
    )
    user_prompt = (
        "Summarize the next 7 days with focus on deadlines, overlaps, priorities, holidays and todo highlights.\n"
        f"Entries JSON:\n{prompt_payload}"
    )
    body = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "max_tokens": 350,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    encoded_body = json.dumps(body).encode('utf-8')
    request_obj = urllib.request.Request(
        url='https://api.groq.com/openai/v1/chat/completions',
        data=encoded_body,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {GROQ_API_KEY}',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(request_obj, timeout=WEEKLY_PREVIEW_TIMEOUT_SECONDS) as response:
            response_body = response.read().decode('utf-8')
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace') if hasattr(exc, 'read') else str(exc)
        raise RuntimeError(f'groq_http_error: {detail}') from exc
    except Exception as exc:
        raise RuntimeError(f'groq_request_failed: {exc}') from exc

    try:
        payload_json = json.loads(response_body)
        content = (
            payload_json.get('choices', [{}])[0]
            .get('message', {})
            .get('content', '')
        )
    except (ValueError, KeyError, IndexError, AttributeError) as exc:
        raise RuntimeError('groq_invalid_response') from exc

    sanitized = _sanitize_weekly_summary(content, locale=locale)
    if not sanitized:
        raise RuntimeError('groq_empty_response')
    return sanitized


def _generate_weekly_preview_with_openai(payload: List[Dict[str, str]], locale: str) -> str:
    """Compatibility shim; weekly preview generation now uses Groq."""
    return _generate_weekly_preview_with_groq(payload, locale)


@app.route('/api/weekly-preview', methods=['GET'])
@require_authenticated
def weekly_preview():
    class_id = _get_session_entry_class_id()
    user_id = session.get('user_id')
    role = str(session.get('role') or '').strip().lower()
    if user_id is None:
        return jsonify(status='error', message='unauthorized'), 401
    if role == 'guest':
        return jsonify(status='error', message='forbidden'), 403
    if not class_id:
        return jsonify(status='error', message='class_required'), 403

    force_refresh = request.args.get('force', '0') == '1'
    include_todos = request.args.get('include_todos', '1') != '0'
    locale = _resolve_weekly_preview_locale()

    now = datetime.datetime.now(pytz.timezone('Europe/Berlin'))
    window_start = now.date()
    window_end = window_start + datetime.timedelta(days=6)

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        entries = _collect_weekly_preview_entries(
            conn,
            class_id=class_id,
            user_id=int(user_id),
            start_date=window_start,
            end_date=window_end,
            include_todos=include_todos,
        )
        payload = _build_weekly_preview_payload(entries)
        source_hash = _compute_weekly_preview_source_hash(payload)

        if not force_refresh:
            cached = _load_weekly_preview_cache(
                conn,
                user_id=int(user_id),
                class_id=class_id,
                locale=locale,
                window_start=window_start,
                window_end=window_end,
                include_todos=include_todos,
            )
            if cached and str(cached.get('source_hash') or '') == source_hash:
                created_at = cached.get('created_at')
                expires_at = cached.get('expires_at')
                return jsonify(
                    status='ok',
                    summary=str(cached.get('summary_markdown') or ''),
                    cached=True,
                    generated_at=created_at.isoformat() if isinstance(created_at, datetime.datetime) else str(created_at or ''),
                    expires_at=expires_at.isoformat() if isinstance(expires_at, datetime.datetime) else str(expires_at or ''),
                    window_start=window_start.isoformat(),
                    window_end=window_end.isoformat(),
                    entry_count=len(payload),
                )

        generated_by = 'groq'
        try:
            if payload:
                summary_text = _generate_weekly_preview_with_groq(payload, locale)
            else:
                summary_text = _generate_weekly_preview_fallback(payload, locale)
                generated_by = 'fallback'
        except Exception as exc:
            app.logger.warning('weekly_preview_generation_failed user_id=%s class_id=%s error=%s', user_id, class_id, exc)
            summary_text = _generate_weekly_preview_fallback(payload, locale)
            generated_by = 'fallback'

        created_at, expires_at = _store_weekly_preview_cache(
            conn,
            user_id=int(user_id),
            class_id=class_id,
            locale=locale,
            window_start=window_start,
            window_end=window_end,
            include_todos=include_todos,
            summary_markdown=summary_text,
            source_hash=source_hash,
        )
        return jsonify(
            status='ok',
            summary=summary_text,
            cached=False,
            generated_by=generated_by,
            generated_at=created_at.isoformat(),
            expires_at=expires_at.isoformat(),
            window_start=window_start.isoformat(),
            window_end=window_end.isoformat(),
            entry_count=len(payload),
        )


@app.route('/api/todos', methods=['GET', 'POST', 'OPTIONS'])
@require_authenticated
def todos_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    data = request.get_json(silent=True) or {}
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify(error='unauthorized', message='Missing session'), 401
    user_id = int(user_id)

    if request.method == 'GET':
        try:
            conn = get_connection()
        except Exception:
            return jsonify(status='error', message='database_unavailable'), 503

        with closing(conn):
            cursor = conn.dict_cursor()
            try:
                cursor.execute(
                    """
                    SELECT id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, is_done, todo_status
                    FROM eintraege
                    WHERE COALESCE(is_private, 0)=1
                      AND owner_user_id=?
                      AND typ='todo'
                    ORDER BY datum ASC, startzeit ASC, id ASC
                    """,
                    (user_id,),
                )
                rows = cursor.fetchall() or []
                subtasks_by_todo = _load_todo_subtasks(conn, [row.get('id') for row in rows], user_id)
                todos = []
                for row in rows:
                    todo_id = int(row.get('id') or 0)
                    datum = row.get('datum')
                    enddatum = row.get('enddatum')
                    todos.append(
                        {
                            'id': todo_id,
                            'beschreibung': row.get('beschreibung') or '',
                            'datum': _serialize_value(datum),
                            'enddatum': _serialize_value(enddatum),
                            'startzeit': _format_time_value(row.get('startzeit')),
                            'endzeit': _format_time_value(row.get('endzeit')),
                            'typ': 'todo',
                            'fach': row.get('fach') or '',
                            'is_done': bool(row.get('is_done')),
                            'todo_status': _normalize_todo_status(row.get('todo_status'), row.get('is_done')),
                            'is_private': True,
                            'is_owned': True,
                            'subtasks': subtasks_by_todo.get(todo_id, []),
                        }
                    )
                return jsonify(status='ok', data=todos)
            except sqlite3.Error:
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()

    beschreibung = (data.get("beschreibung") or '').strip()
    datum_input = data.get("datum")
    startzeit = data.get("startzeit")
    endzeit = data.get("endzeit")
    enddatum_input = data.get("enddatum")
    try:
        subtasks = _normalize_todo_subtasks(data.get('subtasks'))
    except ValueError as exc:
        return jsonify(status='error', message=str(exc)), 400
    todo_status = _normalize_todo_status(data.get('todo_status'), data.get('is_done'))
    if 'todo_status' not in data:
        is_done_default = bool(subtasks) and all(item.get('is_done') for item in subtasks)
        todo_status = TODO_STATUS_DONE if _parse_bool(data.get('is_done'), default=is_done_default) else TODO_STATUS_OPEN
    is_done = todo_status == TODO_STATUS_DONE

    if startzeit == '':
        startzeit = None
    if endzeit == '':
        endzeit = None

    if startzeit:
        startzeit = startzeit.strip()
        if len(startzeit) == 5:
            startzeit = f"{startzeit}:00"
        startzeit = startzeit[:8]
    if endzeit:
        endzeit = endzeit.strip()
        if len(endzeit) == 5:
            endzeit = f"{endzeit}:00"
        endzeit = endzeit[:8]

    if not datum_input:
        return jsonify(status="error", message="datum ist erforderlich"), 400

    start_date = _parse_iso_date(datum_input)
    if start_date is None:
        return jsonify(status="error", message="ungültiges datum"), 400

    end_date = _parse_iso_date(enddatum_input) if enddatum_input not in (None, '') else None
    if enddatum_input not in (None, '') and end_date is None:
        return jsonify(status="error", message="ungültiges enddatum"), 400
    if end_date is not None and end_date < start_date:
        return jsonify(status="error", message="enddatum vor datum"), 400

    datum = start_date.isoformat()
    enddatum = end_date.isoformat() if end_date is not None else datum

    entry_class_id = _get_session_entry_class_id() or DEFAULT_ENTRY_CLASS_ID

    conn = get_connection()
    cur = conn.cursor()
    try:
        entry_id = _next_entry_id(conn)
        cur.execute(
            """
            INSERT INTO eintraege (id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private, is_done, todo_status)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (entry_id, entry_class_id, beschreibung, datum, enddatum, startzeit, endzeit, 'todo', '', int(user_id), 1, 1 if is_done else 0, todo_status),
        )
        _replace_todo_subtasks(conn, entry_id, user_id, subtasks)
        conn.commit()
        _log_user_event(
            'todo_create',
            user_id=user_id,
            entry_id=entry_id,
            datum=datum,
            enddatum=enddatum,
        )
        return jsonify(status="ok", id=entry_id)
    except Exception as exc:
        conn.rollback()
        return jsonify(status="error", message=str(exc)), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/todos/<int:entry_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@require_authenticated
def todo_resource(entry_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        if request.method == 'DELETE':
            return jsonify(status='ok')
        data = request.json or {}
        todo_status = _normalize_todo_status(data.get('todo_status'), data.get('is_done'))
        return jsonify(status='ok', todo_status=todo_status)

    user_id = session.get('user_id')
    if user_id is None:
        return jsonify(error='unauthorized', message='Missing session'), 401
    user_id = int(user_id)

    conn = get_connection()
    lookup_cursor = conn.dict_cursor()
    try:
        lookup_cursor.execute(
            """
            SELECT id, owner_user_id, is_private, typ, is_done, todo_status
            FROM eintraege
            WHERE id=?
              AND COALESCE(is_private, 0)=1
              AND typ='todo'
              AND owner_user_id=?
            LIMIT 1
            """,
            (entry_id, user_id),
        )
        existing = lookup_cursor.fetchone()
        if not existing:
            return jsonify(status='error', message='not_found'), 404

        if request.method == 'DELETE':
            write_cursor = conn.cursor()
            write_cursor.execute(
                "DELETE FROM todo_subtasks WHERE todo_id=? AND owner_user_id=?",
                (entry_id, user_id),
            )
            write_cursor.execute(
                "DELETE FROM eintraege WHERE id=? AND owner_user_id=? AND COALESCE(is_private, 0)=1 AND typ='todo'",
                (entry_id, user_id),
            )
            write_cursor.close()
            conn.commit()
            _log_user_event('todo_delete', user_id=user_id, entry_id=entry_id)
            return jsonify(status='ok')

        data = request.json or {}
        if set(data.keys()).issubset({'todo_status', 'is_done'}):
            todo_status = _normalize_todo_status(data.get('todo_status'), existing.get('is_done'))
            if 'is_done' in data and 'todo_status' not in data:
                todo_status = TODO_STATUS_DONE if _parse_bool(data.get('is_done'), default=False) else TODO_STATUS_OPEN
            is_done = todo_status == TODO_STATUS_DONE
            write_cursor = conn.cursor()
            write_cursor.execute(
                """
                UPDATE eintraege
                SET is_done=?, todo_status=?
                WHERE id=?
                  AND owner_user_id=?
                  AND COALESCE(is_private, 0)=1
                  AND typ='todo'
                """,
                (1 if is_done else 0, todo_status, entry_id, user_id),
            )
            write_cursor.close()
            conn.commit()
            _log_user_event('todo_status_update', user_id=user_id, entry_id=entry_id, todo_status=todo_status)
            return jsonify(status='ok', todo_status=todo_status)

        beschreibung = (data.get("beschreibung") or '').strip()
        datum_input = data.get("datum")
        startzeit = data.get("startzeit")
        endzeit = data.get("endzeit")
        enddatum_input = data.get("enddatum")
        replace_subtasks = 'subtasks' in data
        subtasks: List[Dict[str, Any]] = []
        if replace_subtasks:
            try:
                subtasks = _normalize_todo_subtasks(data.get('subtasks'))
            except ValueError as exc:
                return jsonify(status='error', message=str(exc)), 400
        todo_status = _normalize_todo_status(data.get('todo_status'), existing.get('is_done'))
        if 'is_done' in data and 'todo_status' not in data:
            todo_status = TODO_STATUS_DONE if _parse_bool(data.get('is_done'), default=False) else TODO_STATUS_OPEN
        is_done = todo_status == TODO_STATUS_DONE

        if startzeit == '':
            startzeit = None
        if endzeit == '':
            endzeit = None

        if startzeit:
            startzeit = startzeit.strip()
            if len(startzeit) == 5:
                startzeit = f"{startzeit}:00"
            startzeit = startzeit[:8]
        if endzeit:
            endzeit = endzeit.strip()
            if len(endzeit) == 5:
                endzeit = f"{endzeit}:00"
            endzeit = endzeit[:8]

        if not datum_input:
            return jsonify(status="error", message="datum ist erforderlich"), 400
        start_date = _parse_iso_date(datum_input)
        if start_date is None:
            return jsonify(status="error", message="ungültiges datum"), 400

        end_date = _parse_iso_date(enddatum_input) if enddatum_input not in (None, '') else None
        if enddatum_input not in (None, '') and end_date is None:
            return jsonify(status="error", message="ungültiges enddatum"), 400
        if end_date is not None and end_date < start_date:
            return jsonify(status="error", message="enddatum vor datum"), 400

        datum = start_date.isoformat()
        enddatum = end_date.isoformat() if end_date is not None else datum

        write_cursor = conn.cursor()
        write_cursor.execute(
            """
            UPDATE eintraege
            SET beschreibung=?, datum=?, enddatum=?, startzeit=?, endzeit=?, fach=?, is_done=?, todo_status=?
            WHERE id=?
              AND owner_user_id=?
              AND COALESCE(is_private, 0)=1
              AND typ='todo'
            """,
            (beschreibung, datum, enddatum, startzeit, endzeit, '', 1 if is_done else 0, todo_status, entry_id, user_id),
        )
        write_cursor.close()
        if replace_subtasks:
            _replace_todo_subtasks(conn, entry_id, user_id, subtasks)
        conn.commit()
        _log_user_event('todo_update', user_id=user_id, entry_id=entry_id, datum=datum, enddatum=enddatum)
        return jsonify(status='ok')
    except Exception as exc:
        conn.rollback()
        return jsonify(status='error', message=str(exc)), 500
    finally:
        lookup_cursor.close()
        conn.close()


@app.route('/api/contact', methods=['POST'])
def submit_contact():
    form = request.form
    honeypot = form.get('hm_contact_website')
    if honeypot:
        return jsonify({'status': 'ok'}), 200

    user_id_raw = session.get('user_id')
    if not user_id_raw:
        return jsonify({'message': 'forbidden'}), 403

    try:
        user_id = int(user_id_raw)
    except (TypeError, ValueError):
        return jsonify({'message': 'forbidden'}), 403

    try:
        conn = get_connection()
    except Exception:
        app.logger.exception('Failed to obtain database connection for contact request')
        return jsonify({'message': 'unavailable'}), 503

    user = None
    with closing(conn):
        try:
            user = _load_user_by_id(conn, user_id)
        except sqlite3.Error:
            app.logger.exception('Failed to load user %s for contact request', user_id)
            return jsonify({'message': 'unavailable'}), 503

    if not user:
        return jsonify({'message': 'forbidden'}), 403

    try:
        is_active = user.get('is_active')
        if is_active is not None and int(is_active) == 0:
            return jsonify({'message': 'forbidden'}), 403
    except (TypeError, ValueError):
        pass

    user_email = (user.get('email') or '').strip()
    if not user_email:
        return jsonify({'message': 'forbidden'}), 403

    subject = (form.get('subject') or '').strip()
    message_text = (form.get('message') or '').strip()
    consent_given = form.get('consent') in ('true', 'on', '1')
    started_raw = form.get('hm-contact-start')

    errors = {}

    if not subject:
        errors['subject'] = 'required'
    if len(message_text) < CONTACT_MIN_MESSAGE_LENGTH:
        errors['message'] = 'too_short'
    if not consent_given:
        errors['consent'] = 'required'

    try:
        started_ms = int(started_raw) if started_raw else 0
    except (TypeError, ValueError):
        started_ms = 0

    if started_ms:
        elapsed = (time.time() * 1000) - started_ms
        if elapsed < CONTACT_MIN_DURATION_MS:
            errors['general'] = 'too_fast'

    attachment_tuple = None
    uploaded_file = request.files.get('attachment')
    if uploaded_file and uploaded_file.filename:
        try:
            uploaded_file.stream.seek(0, os.SEEK_END)
            size = uploaded_file.stream.tell()
            uploaded_file.stream.seek(0)
        except Exception:
            size = None
        if size and size > CONTACT_MAX_FILE_SIZE:
            return jsonify({'message': 'attachment_too_large'}), 413
        file_data = uploaded_file.read()
        if file_data and len(file_data) > CONTACT_MAX_FILE_SIZE:
            return jsonify({'message': 'attachment_too_large'}), 413
        if file_data:
            attachment_tuple = (file_data, uploaded_file.filename, uploaded_file.mimetype)

    if errors:
        return jsonify({'message': 'invalid', 'errors': errors}), 400

    contact_settings = _get_runtime_contact_settings()
    target_recipient = CONTACT_TARGET_ADDRESS or contact_settings["recipient"]
    if not (contact_settings["host"] and target_recipient):
        return jsonify({'message': 'unavailable'}), 503

    ip_address = _get_request_ip()

    if not _check_contact_rate_limit(ip_address):
        return jsonify({'message': 'rate_limited'}), 429

    if _is_contact_user_limited(user_id):
        return jsonify({'message': 'rate_limited_user'}), 429

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    body = (
        f"Benutzer-ID: {user_id}\n"
        f"E-Mail: {user_email}\n"
        f"Rolle: {user.get('role') or '-'}\n"
        f"Klassen-ID: {user.get('class_id') or '-'}\n"
        f"Betreff: {subject or '-'}\n"
        f"Einwilligung: {'ja' if consent_given else 'nein'}\n"
        f"IP-Adresse: {ip_address}\n"
        f"Zeitstempel: {timestamp}\n\n"
        f"Nachricht:\n{message_text.strip()}\n"
    )

    try:
        _send_contact_email(user_email, subject, body, attachment_tuple)
    except Exception as exc:
        app.logger.exception('Fehler beim Versenden der Kontaktanfrage: %s', exc)
        return jsonify({'message': 'send_failed'}), 502

    _mark_contact_user_activity(user_id)

    return jsonify({'status': 'ok'}), 200

# --- AUTHENTICATION ---
@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    class_identifier = data.get('class')

    errors = {}
    if not email or '@' not in email or not email.endswith(REGISTRATION_ALLOWED_DOMAIN):
        errors['email'] = 'invalid_email'
    if not password or len(password) < 8:
        errors['password'] = 'weak_password'

    if errors:
        return jsonify(status='error', errors=errors), 400

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        try:
            existing = _load_user_by_email(conn, email)
        except sqlite3.Error:
            app.logger.exception('Failed to check existing user for registration')
            return jsonify(status='error', message='database_unavailable'), 503

        if existing:
            return jsonify(status='error', message='email_exists'), 409

        class_id = None
        if class_identifier is not None:
            try:
                class_id = _resolve_class_id(class_identifier, conn=conn)
            except ValueError:
                return jsonify(status='error', message='class_not_found'), 404
        else:
            try:
                class_id = _resolve_class_id(DEFAULT_CLASS_SLUG, conn=conn)
            except Exception:
                class_id = None

        password_hash_value = hash_password(password)

        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (email, password_hash, role, class_id, is_active, email_verified_at) VALUES (?, ?, ?, ?, ?, ?)",
                (email, password_hash_value, 'student', class_id, 1, None),
            )
            user_id = cursor.lastrowid
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            app.logger.exception('Failed to create user during registration')
            return jsonify(status='error', message='registration_failed'), 500
        finally:
            cursor.close()

        user = {'id': user_id, 'email': email, 'role': 'student'}
        try:
            _create_email_verification(conn, user)
        except sqlite3.Error:
            app.logger.exception('Failed to create verification code for user ?', user)
            return jsonify(status='error', message='verification_failed'), 500
        except RuntimeError:
            return jsonify(status='error', message='mail_failed'), 502

    return jsonify(status='ok')


@app.route('/api/auth/login', methods=['POST'])
@app.route('/api/login', methods=['POST'])
def auth_login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify(status='error', message='invalid_credentials'), 401

    ip_address = _get_request_ip()
    if not _check_rate_limit(
        LOGIN_RATE_LIMIT,
        ip_address,
        LOGIN_RATE_LIMIT_WINDOW,
        LOGIN_RATE_LIMIT_MAX,
    ):
        return jsonify(status='error', message='rate_limited'), 429

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        try:
            user = _load_user_by_email(conn, email)
        except sqlite3.Error:
            app.logger.exception('Failed to load user for login')
            return jsonify(status='error', message='database_unavailable'), 503

        if not user:
            return jsonify(status='error', message='invalid_credentials'), 401

        if not verify_password(user.get('password_hash'), password):
            return jsonify(status='error', message='invalid_credentials'), 401

        try:
            if user.get('is_active') is not None and int(user['is_active']) == 0:
                return jsonify(status='error', message='inactive'), 403
        except (TypeError, ValueError):
            pass

        if not user.get('email_verified_at'):
            return jsonify(status='error', message='email_not_verified'), 403

        session['user_id'] = int(user['id'])
        current_user = _sync_session_user(user, conn=conn)
        role = current_user['role']

        try:
            _mark_user_login(conn, int(user['id']))
        except (sqlite3.Error, KeyError, ValueError):
            app.logger.exception('Failed to update last login for user ?', user)

        _log_user_event(
            'login',
            user_id=int(user['id']),
            email=user.get('email'),
            role=role,
            ip_address=ip_address,
        )

    LOGIN_RATE_LIMIT.pop(ip_address, None)
    return jsonify(status='ok', role=session.get('role'))


@app.route('/api/auth/logout', methods=['POST'])
@app.route('/api/logout', methods=['POST'])
def auth_logout():
    session.clear()
    return jsonify(status='ok')


@app.route('/api/auth/verify', methods=['POST'])
def auth_verify():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()

    if not email:
        return jsonify(status='error', message='email_required'), 400
    if not code:
        return jsonify(status='error', message='code_required'), 400

    ip_address = _get_request_ip()
    if not _check_rate_limit(
        VERIFY_RATE_LIMIT,
        ip_address,
        VERIFY_RATE_LIMIT_WINDOW,
        VERIFY_RATE_LIMIT_MAX,
    ):
        return jsonify(status='error', message='rate_limited'), 429

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    with closing(conn):
        try:
            user = _load_user_by_email(conn, email)
        except sqlite3.Error:
            return jsonify(status='error', message='database_unavailable'), 503

        if not user:
            return jsonify(status='error', message='verification_not_found'), 404

        if user.get('email_verified_at'):
            return jsonify(status='error', message='already_verified'), 409

        verification_cursor = conn.dict_cursor()
        try:
            verification_cursor.execute(
                """
                SELECT id, user_id, code, expires_at, failed_attempts
                FROM email_verifications
                WHERE user_id=?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (int(user['id']),),
            )
            verification = verification_cursor.fetchone()
        except sqlite3.Error:
            verification_cursor.close()
            return jsonify(status='error', message='database_unavailable'), 503

        if not verification:
            verification_cursor.close()
            return jsonify(status='error', message='verification_not_found'), 404

        expires_at = verification.get('expires_at')
        failed_attempts = int(verification.get('failed_attempts') or 0)
        verification_id = int(verification['id'])
        verification_cursor.close()

        if expires_at and expires_at < now:
            cleanup_cursor = conn.cursor()
            try:
                cleanup_cursor.execute(
                    "DELETE FROM email_verifications WHERE id=?",
                    (verification_id,),
                )
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                cleanup_cursor.close()
                return jsonify(status='error', message='verification_failed'), 500
            finally:
                cleanup_cursor.close()
            return jsonify(status='error', message='code_expired'), 410

        if code != (verification.get('code') or '').strip():
            new_attempts = failed_attempts + 1
            update_cursor = conn.cursor()
            try:
                if new_attempts >= 5:
                    update_cursor.execute(
                        "DELETE FROM email_verifications WHERE id=?",
                        (verification_id,),
                    )
                else:
                    update_cursor.execute(
                        "UPDATE email_verifications SET failed_attempts=? WHERE id=?",
                        (new_attempts, verification_id),
                    )
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                update_cursor.close()
                return jsonify(status='error', message='verification_failed'), 500
            finally:
                update_cursor.close()

            if new_attempts >= 5:
                return jsonify(status='error', message='code_expired'), 410
            return jsonify(status='error', message='invalid_code'), 400

        update_cursor = conn.cursor()
        try:
            update_cursor.execute(
                "UPDATE users SET email_verified_at=? WHERE id=?",
                (now, int(user['id'])),
            )
            update_cursor.execute(
                "DELETE FROM email_verifications WHERE id=?",
                (verification_id,),
            )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            update_cursor.close()
            return jsonify(status='error', message='verification_failed'), 500
        finally:
            update_cursor.close()

    VERIFY_RATE_LIMIT.pop(ip_address, None)
    return jsonify(status='ok')


@app.route('/api/auth/resend', methods=['POST'])
def auth_resend():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify(status='error', message='email_required'), 400

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        try:
            user = _load_user_by_email(conn, email)
        except sqlite3.Error:
            app.logger.exception('Failed to load user for resend %s', email)
            return jsonify(status='error', message='database_unavailable'), 503

        if not user:
            return jsonify(status='error', message='user_not_found'), 404

        if user.get('email_verified_at'):
            return jsonify(status='error', message='already_verified'), 409

        try:
            _create_email_verification(conn, user)
        except sqlite3.Error:
            app.logger.exception('Failed to create verification code for user ?', user)
            return jsonify(status='error', message='verification_failed'), 500
        except RuntimeError:
            return jsonify(status='error', message='mail_failed'), 502

    return jsonify(status='ok')


@app.route('/api/auth/password-reset', methods=['POST'])
def auth_password_reset():
    data = request.json or {}
    action = (data.get('action') or '').strip().lower()

    if not action:
        return jsonify(status='error', message='action_required'), 400

    if action not in {'request', 'create', 'confirm', 'reset'}:
        return jsonify(status='error', message='invalid_action'), 400

    if action in {'request', 'create'}:
        email = (data.get('email') or '').strip().lower()
        if not email:
            return jsonify(status='error', message='email_required'), 400

        ip_address = _get_request_ip()
        if not _check_rate_limit(
            PASSWORD_RESET_REQUEST_LIMIT,
            ip_address,
            PASSWORD_RESET_REQUEST_WINDOW,
            PASSWORD_RESET_REQUEST_MAX,
        ):
            return jsonify(status='error', message='rate_limited'), 429

        try:
            conn = get_connection()
        except Exception:
            return jsonify(status='error', message='database_unavailable'), 503

        with closing(conn):
            try:
                user = _load_user_by_email(conn, email)
            except sqlite3.Error:
                app.logger.exception('Failed to load user for password reset request')
                return jsonify(status='error', message='database_unavailable'), 503

            if not user:
                return jsonify(status='ok')

            try:
                user_id = int(user['id'])
            except (KeyError, TypeError, ValueError):
                return jsonify(status='ok')

            if not _check_rate_limit(
                PASSWORD_RESET_REQUEST_LIMIT,
                f'user:{user_id}',
                PASSWORD_RESET_REQUEST_WINDOW,
                PASSWORD_RESET_REQUEST_MAX,
            ):
                return jsonify(status='error', message='rate_limited'), 429

            try:
                _create_password_reset(conn, user)
            except sqlite3.Error:
                app.logger.exception('Failed to persist password reset for user %s', user)
                return jsonify(status='error', message='reset_failed'), 500
            except RuntimeError:
                return jsonify(status='error', message='mail_failed'), 502

        return jsonify(status='ok')

    if action in {'confirm', 'reset'}:
        email = (data.get('email') or '').strip().lower()
        code = (data.get('code') or '').strip()
        password = (data.get('password') or '').strip()

        if not email:
            return jsonify(status='error', message='email_required'), 400
        if not code:
            return jsonify(status='error', message='code_required'), 400
        if not password:
            return jsonify(status='error', message='password_required'), 400
        if len(password) < 8:
            return jsonify(status='error', message='weak_password'), 400

        ip_address = _get_request_ip()
        if not _check_rate_limit(
            PASSWORD_RESET_VERIFY_LIMIT,
            ip_address,
            PASSWORD_RESET_VERIFY_WINDOW,
            PASSWORD_RESET_VERIFY_MAX,
        ):
            return jsonify(status='error', message='rate_limited'), 429

        try:
            conn = get_connection()
        except Exception:
            return jsonify(status='error', message='database_unavailable'), 503

        reset_user_id: Optional[int] = None
        current_time = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        with closing(conn):
            try:
                user = _load_user_by_email(conn, email)
            except sqlite3.Error:
                app.logger.exception('Failed to load user for password reset confirmation')
                return jsonify(status='error', message='database_unavailable'), 503

            if not user:
                return jsonify(status='error', message='reset_not_found'), 404

            try:
                reset_user_id = int(user['id'])
            except (KeyError, TypeError, ValueError):
                return jsonify(status='error', message='reset_failed'), 500

            if not _check_rate_limit(
                PASSWORD_RESET_VERIFY_LIMIT,
                f'user:{reset_user_id}',
                PASSWORD_RESET_VERIFY_WINDOW,
                PASSWORD_RESET_VERIFY_MAX,
            ):
                return jsonify(status='error', message='rate_limited'), 429

            try:
                reset_entry = _load_password_reset(conn, reset_user_id, code)
            except sqlite3.Error:
                app.logger.exception('Failed to load password reset entry for user %s', user)
                return jsonify(status='error', message='reset_failed'), 500

            if not reset_entry:
                return jsonify(status='error', message='invalid_code'), 400

            try:
                reset_id = int(reset_entry['id'])
            except (KeyError, TypeError, ValueError):
                return jsonify(status='error', message='reset_failed'), 500

            expires_at = reset_entry.get('expires_at')
            used_at = reset_entry.get('used_at')

            if isinstance(expires_at, datetime.datetime) and expires_at.tzinfo is not None:
                expires_at = expires_at.astimezone(datetime.timezone.utc).replace(tzinfo=None)
            if isinstance(used_at, datetime.datetime) and used_at.tzinfo is not None:
                used_at = used_at.astimezone(datetime.timezone.utc).replace(tzinfo=None)

            if used_at:
                return jsonify(status='error', message='code_used'), 409

            if expires_at and expires_at < current_time:
                cleanup_cursor = conn.cursor()
                try:
                    cleanup_cursor.execute(
                        "DELETE FROM password_resets WHERE id=?",
                        (reset_id,),
                    )
                    conn.commit()
                except sqlite3.Error:
                    conn.rollback()
                    cleanup_cursor.close()
                    return jsonify(status='error', message='reset_failed'), 500
                finally:
                    cleanup_cursor.close()
                return jsonify(status='error', message='code_expired'), 410

            try:
                password_hash_value = hash_password(password)
            except ValueError:
                return jsonify(status='error', message='weak_password'), 400

            update_cursor = conn.cursor()
            try:
                update_cursor.execute(
                    "UPDATE users SET password_hash=?, updated_at=? WHERE id=?",
                    (password_hash_value, current_time, reset_user_id),
                )
                update_cursor.execute(
                    "UPDATE password_resets SET used_at=? WHERE id=?",
                    (current_time, reset_id),
                )
                update_cursor.execute(
                    "DELETE FROM password_resets WHERE user_id=? AND id<>?",
                    (reset_user_id, reset_id),
                )
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                update_cursor.close()
                return jsonify(status='error', message='reset_failed'), 500
            finally:
                update_cursor.close()

            _log_user_event(
                'password_reset_completed',
                user_id=reset_user_id,
                email=user.get('email'),
            )

        PASSWORD_RESET_VERIFY_LIMIT.pop(ip_address, None)
        if reset_user_id is not None:
            PASSWORD_RESET_VERIFY_LIMIT.pop(f'user:{reset_user_id}', None)
            PASSWORD_RESET_REQUEST_LIMIT.pop(f'user:{reset_user_id}', None)

        return jsonify(status='ok')

    return jsonify(status='error', message='invalid_action'), 400


@app.route('/api/admin/resend-verification', methods=['POST'])
@require_role('admin')
def resend_admin_verification():
    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        try:
            admin_user = _load_admin_user(conn)
        except sqlite3.Error:
            app.logger.exception('Failed to load admin user for verification')
            return jsonify(status='error', message='database_unavailable'), 503

        if not admin_user:
            return jsonify(status='error', message='admin_not_found'), 404

        if admin_user.get('email_verified_at'):
            return jsonify(status='error', message='already_verified'), 409

        try:
            _create_email_verification(conn, admin_user)
        except sqlite3.Error:
            app.logger.exception('Failed to create verification code for admin ?', admin_user)
            return jsonify(status='error', message='verification_failed'), 500
        except RuntimeError:
            return jsonify(status='error', message='mail_failed'), 502

    return jsonify(status='ok')


@app.route('/api/admin/users', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin')
def admin_users_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        if request.method == 'GET':
            page, page_size = _parse_pagination()
            offset = (page - 1) * page_size
            cursor = conn.dict_cursor()
            try:
                cursor.execute("SELECT COUNT(*) AS total FROM users")
                total_row = cursor.fetchone() or {'total': 0}
                total = int(total_row.get('total') or 0)
                cursor.execute(
                    """
                    SELECT u.id, u.email, u.role, u.class_id, c.slug AS class_slug,
                           u.is_active, u.created_at, u.updated_at
                    FROM users u
                    LEFT JOIN classes c ON c.id = u.class_id
                    ORDER BY u.id DESC
                    LIMIT ? OFFSET ?
                    """,
                    (page_size, offset),
                )
                data = cursor.fetchall() or []
            except sqlite3.Error:
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return _pagination_response(data, total, page, page_size)

        data = request.json or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        role = (data.get('role') or 'student').strip().lower() or 'student'
        class_id = _ensure_int(data.get('class_id'))
        is_active = _parse_bool(data.get('is_active'), True)

        if not email or '@' not in email:
            return jsonify(status='error', message='invalid_email'), 400
        if role not in {'student', 'teacher', 'class_admin', 'admin'}:
            return jsonify(status='error', message='invalid_role'), 400
        if not password:
            return jsonify(status='error', message='password_required'), 400

        password_hash = hash_password(password)
        now = datetime.datetime.utcnow()

        cursor = conn.cursor()
        try:
            if class_id:
                cursor.execute("SELECT id FROM classes WHERE id=?", (class_id,))
                if cursor.fetchone() is None:
                    return jsonify(status='error', message='class_not_found'), 404
                cursor.close()
                cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO users (email, password_hash, role, class_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (email, password_hash, role, class_id, int(is_active), now, now),
            )
            user_id = cursor.lastrowid
            _log_admin_action(
                conn,
                'create',
                'user',
                user_id,
                {'email': email, 'role': role, 'class_id': class_id, 'is_active': bool(is_active)},
            )
            conn.commit()
        except sqlite3.Error as exc:
            conn.rollback()
            if isinstance(exc, sqlite3.IntegrityError):
                return jsonify(status='error', message='duplicate_email'), 409
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

    return jsonify(status='ok', id=user_id)


@app.route('/api/admin/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@require_role('admin')
def admin_users_resource(user_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            if request.method == 'GET':
                cursor.execute(
                    """
                    SELECT u.id, u.email, u.role, u.class_id, c.slug AS class_slug,
                           u.is_active, u.created_at, u.updated_at
                    FROM users u
                    LEFT JOIN classes c ON c.id = u.class_id
                    WHERE u.id=?
                    LIMIT 1
                    """,
                    (user_id,),
                )
                row = cursor.fetchone()
                if not row:
                    return jsonify(status='error', message='user_not_found'), 404
                return jsonify(status='ok', data=list(_serialize_rows([row]))[0])

            if request.method == 'DELETE':
                cursor.close()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
                if cursor.rowcount == 0:
                    return jsonify(status='error', message='user_not_found'), 404
                _log_admin_action(conn, 'delete', 'user', user_id, {})
                conn.commit()
                return jsonify(status='ok')

            data = request.json or {}
            updates = []
            values = []

            if 'email' in data:
                email = (data.get('email') or '').strip().lower()
                if not email or '@' not in email:
                    return jsonify(status='error', message='invalid_email'), 400
                updates.append('email=?')
                values.append(email)

            role_value = None
            if 'role' in data:
                role_value = (data.get('role') or '').strip().lower()
                if role_value not in {'student', 'teacher', 'class_admin', 'admin'}:
                    return jsonify(status='error', message='invalid_role'), 400
                updates.append('role=?')
                values.append(role_value)

            class_value = None
            if 'class_id' in data:
                class_value = _ensure_int(data.get('class_id'))
                if class_value is not None and class_value <= 0:
                    return jsonify(status='error', message='invalid_class_id'), 400
                if class_value:
                    cursor.execute("SELECT id FROM classes WHERE id=?", (class_value,))
                    if cursor.fetchone() is None:
                        return jsonify(status='error', message='class_not_found'), 404
                    cursor.close()
                    cursor = conn.dict_cursor()
                updates.append('class_id=?')
                values.append(class_value)

            active_value = None
            if 'is_active' in data:
                active_value = _parse_bool(data.get('is_active'), True)
                updates.append('is_active=?')
                values.append(int(active_value))

            if 'password' in data:
                password = data.get('password')
                if not password:
                    return jsonify(status='error', message='password_required'), 400
                updates.append('password_hash=?')
                values.append(hash_password(password))

            if not updates:
                return jsonify(status='error', message='no_changes'), 400

            cursor.close()
            cursor = conn.cursor()
            query = f"UPDATE users SET {', '.join(updates)} WHERE id=?"
            values.append(user_id)
            cursor.execute(query, tuple(values))
            if cursor.rowcount == 0:
                return jsonify(status='error', message='user_not_found'), 404
            _log_admin_action(
                conn,
                'update',
                'user',
                user_id,
                {
                    key: value
                    for key, value in [
                        ('email', data.get('email') if 'email' in data else None),
                        ('role', role_value),
                        ('class_id', class_value),
                        ('is_active', active_value),
                    ]
                    if value is not None
                },
            )
            conn.commit()
            return jsonify(status='ok')
        except sqlite3.Error as exc:
            conn.rollback()
            if isinstance(exc, sqlite3.IntegrityError):
                return jsonify(status='error', message='duplicate_email'), 409
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()


@app.route('/api/secure-data')
@require_admin
def secure_data():
    return jsonify(status='ok', data='Hier sind geheime Daten!')


@app.route('/api/admin/classes', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin')
def admin_classes_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        if request.method == 'GET':
            page, page_size = _parse_pagination()
            offset = (page - 1) * page_size
            cursor = conn.dict_cursor()
            try:
                cursor.execute("SELECT COUNT(*) AS total FROM classes")
                total = int((cursor.fetchone() or {'total': 0}).get('total') or 0)
                cursor.execute(
                    """
                    SELECT id, slug, title, description, is_active, created_at, updated_at
                    FROM classes
                    ORDER BY title ASC
                    LIMIT ? OFFSET ?
                    """,
                    (page_size, offset),
                )
                rows = cursor.fetchall() or []
            except sqlite3.Error:
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return _pagination_response(rows, total, page, page_size)

        data = request.json or {}
        slug = (data.get('slug') or '').strip()
        title = (data.get('title') or '').strip()
        description = (data.get('description') or '').strip() or None
        is_active = _parse_bool(data.get('is_active'), True)

        if not slug or not re.match(r'^[A-Za-z0-9\-]+$', slug):
            return jsonify(status='error', message='invalid_slug'), 400
        if not title:
            return jsonify(status='error', message='title_required'), 400

        now = datetime.datetime.utcnow()
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO classes (slug, title, description, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (slug, title, description, int(is_active), now, now),
            )
            class_id = cursor.lastrowid
            _log_admin_action(
                conn,
                'create',
                'class',
                class_id,
                {'slug': slug, 'title': title, 'is_active': bool(is_active)},
            )
            conn.commit()
        except sqlite3.Error as exc:
            conn.rollback()
            if isinstance(exc, sqlite3.IntegrityError):
                return jsonify(status='error', message='duplicate_class'), 409
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

    return jsonify(status='ok', id=class_id)


@app.route('/api/admin/classes/<int:class_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@require_role('admin')
def admin_classes_resource(class_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            if request.method == 'GET':
                cursor.execute(
                    """
                    SELECT id, slug, title, description, is_active, created_at, updated_at
                    FROM classes
                    WHERE id=?
                    LIMIT 1
                    """,
                    (class_id,),
                )
                row = cursor.fetchone()
                if not row:
                    return jsonify(status='error', message='class_not_found'), 404
                return jsonify(status='ok', data=list(_serialize_rows([row]))[0])

            if request.method == 'DELETE':
                cursor.close()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM classes WHERE id=?", (class_id,))
                if cursor.rowcount == 0:
                    return jsonify(status='error', message='class_not_found'), 404
                _log_admin_action(conn, 'delete', 'class', class_id, {})
                conn.commit()
                return jsonify(status='ok')

            data = request.json or {}
            updates = []
            values = []

            if 'slug' in data:
                slug = (data.get('slug') or '').strip()
                if not slug or not re.match(r'^[A-Za-z0-9\-]+$', slug):
                    return jsonify(status='error', message='invalid_slug'), 400
                updates.append('slug=?')
                values.append(slug)

            title_value = None
            if 'title' in data:
                title_value = (data.get('title') or '').strip()
                if not title_value:
                    return jsonify(status='error', message='title_required'), 400
                updates.append('title=?')
                values.append(title_value)

            if 'description' in data:
                description_value = (data.get('description') or '').strip() or None
                updates.append('description=?')
                values.append(description_value)

            active_value = None
            if 'is_active' in data:
                active_value = _parse_bool(data.get('is_active'), True)
                updates.append('is_active=?')
                values.append(int(active_value))

            if not updates:
                return jsonify(status='error', message='no_changes'), 400

            cursor.close()
            cursor = conn.cursor()
            query = f"UPDATE classes SET {', '.join(updates)} WHERE id=?"
            values.append(class_id)
            cursor.execute(query, tuple(values))
            if cursor.rowcount == 0:
                return jsonify(status='error', message='class_not_found'), 404
            _log_admin_action(
                conn,
                'update',
                'class',
                class_id,
                {
                    key: value
                    for key, value in [
                        ('slug', data.get('slug') if 'slug' in data else None),
                        ('title', title_value),
                        ('description', data.get('description') if 'description' in data else None),
                        ('is_active', active_value),
                    ]
                    if value is not None
                },
            )
            conn.commit()
            return jsonify(status='ok')
        except sqlite3.Error as exc:
            conn.rollback()
            if isinstance(exc, sqlite3.IntegrityError):
                return jsonify(status='error', message='duplicate_class'), 409
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()


@app.route('/api/admin/schedules', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin')
def admin_schedules_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        if request.method == 'GET':
            page, page_size = _parse_pagination()
            offset = (page - 1) * page_size
            cursor = conn.dict_cursor()
            try:
                filter_sql = "COALESCE(cs.import_hash, '') <> '' OR LOWER(COALESCE(cs.source, '')) LIKE ?"
                filter_params = ('%.json%',)
                cursor.execute(
                    f"SELECT COUNT(*) AS total FROM class_schedules cs WHERE {filter_sql}",
                    filter_params,
                )
                total = int((cursor.fetchone() or {'total': 0}).get('total') or 0)
                cursor.execute(
                    f"""
                    SELECT cs.id, cs.class_id, cs.source, cs.import_hash, cs.imported_at,
                           cs.created_at, cs.updated_at, c.slug AS class_slug, c.title AS class_title
                    FROM class_schedules cs
                    LEFT JOIN classes c ON c.id = cs.class_id
                    WHERE {filter_sql}
                    ORDER BY cs.id DESC
                    LIMIT ? OFFSET ?
                    """,
                    filter_params + (page_size, offset),
                )
                rows = cursor.fetchall() or []
            except sqlite3.Error:
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return _pagination_response(rows, total, page, page_size)

        data = request.json or {}
        class_id = _ensure_int(data.get('class_id'), allow_none=False)
        if not class_id or class_id <= 0:
            return jsonify(status='error', message='invalid_class_id'), 400

        source = (data.get('source') or '').strip() or None
        import_hash = (data.get('import_hash') or '').strip() or None
        imported_at_raw = data.get('imported_at')
        imported_at = None
        if imported_at_raw:
            try:
                imported_at = datetime.datetime.fromisoformat(imported_at_raw)
            except (TypeError, ValueError):
                return jsonify(status='error', message='invalid_imported_at'), 400

        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM classes WHERE id=?", (class_id,))
            if cursor.fetchone() is None:
                return jsonify(status='error', message='class_not_found'), 404
            cursor.close()
            cursor = conn.cursor()
            now = datetime.datetime.utcnow()
            cursor.execute(
                """
                INSERT INTO class_schedules (class_id, source, import_hash, imported_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (class_id, source, import_hash, imported_at, now, now),
            )
            schedule_id = cursor.lastrowid
            _log_admin_action(
                conn,
                'create',
                'schedule',
                schedule_id,
                {'class_id': class_id, 'source': source, 'import_hash': import_hash},
            )
            conn.commit()
        except sqlite3.Error as exc:
            conn.rollback()
            if isinstance(exc, sqlite3.IntegrityError):
                return jsonify(status='error', message='schedule_exists'), 409
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

    return jsonify(status='ok', id=schedule_id)


@app.route('/api/admin/schedules/<int:schedule_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@require_role('admin')
def admin_schedules_resource(schedule_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            if request.method == 'GET':
                cursor.execute(
                    """
                    SELECT cs.id, cs.class_id, cs.source, cs.import_hash, cs.imported_at,
                           cs.created_at, cs.updated_at, c.slug AS class_slug, c.title AS class_title
                    FROM class_schedules cs
                    LEFT JOIN classes c ON c.id = cs.class_id
                    WHERE cs.id=?
                    LIMIT 1
                    """,
                    (schedule_id,),
                )
                row = cursor.fetchone()
                if not row:
                    return jsonify(status='error', message='schedule_not_found'), 404
                return jsonify(status='ok', data=list(_serialize_rows([row]))[0])

            if request.method == 'DELETE':
                cursor.close()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM class_schedules WHERE id=?", (schedule_id,))
                if cursor.rowcount == 0:
                    return jsonify(status='error', message='schedule_not_found'), 404
                _log_admin_action(conn, 'delete', 'schedule', schedule_id, {})
                conn.commit()
                return jsonify(status='ok')

            data = request.json or {}
            updates = []
            values = []

            class_value = None
            if 'class_id' in data:
                class_value = _ensure_int(data.get('class_id'), allow_none=False)
                if not class_value or class_value <= 0:
                    return jsonify(status='error', message='invalid_class_id'), 400
                cursor.execute("SELECT id FROM classes WHERE id=?", (class_value,))
                if cursor.fetchone() is None:
                    return jsonify(status='error', message='class_not_found'), 404
                updates.append('class_id=?')
                values.append(class_value)

            source_value = None
            if 'source' in data:
                source_value = (data.get('source') or '').strip() or None
                updates.append('source=?')
                values.append(source_value)

            import_hash_value = None
            if 'import_hash' in data:
                import_hash_value = (data.get('import_hash') or '').strip() or None
                updates.append('import_hash=?')
                values.append(import_hash_value)

            imported_at_value = None
            if 'imported_at' in data:
                imported_raw = data.get('imported_at')
                if imported_raw:
                    try:
                        imported_at_value = datetime.datetime.fromisoformat(imported_raw)
                    except (TypeError, ValueError):
                        return jsonify(status='error', message='invalid_imported_at'), 400
                updates.append('imported_at=?')
                values.append(imported_at_value)

            if not updates:
                return jsonify(status='error', message='no_changes'), 400

            cursor.close()
            cursor = conn.cursor()
            query = f"UPDATE class_schedules SET {', '.join(updates)} WHERE id=?"
            values.append(schedule_id)
            cursor.execute(query, tuple(values))
            if cursor.rowcount == 0:
                return jsonify(status='error', message='schedule_not_found'), 404
            _log_admin_action(
                conn,
                'update',
                'schedule',
                schedule_id,
                {
                    key: value
                    for key, value in [
                        ('class_id', class_value),
                        ('source', source_value),
                        ('import_hash', import_hash_value),
                        ('imported_at', imported_at_value),
                    ]
                    if value is not None
                },
            )
            conn.commit()
            return jsonify(status='ok')
        except sqlite3.Error as exc:
            conn.rollback()
            if isinstance(exc, sqlite3.IntegrityError):
                return jsonify(status='error', message='schedule_exists'), 409
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

    return jsonify(status='ok', id=schedule_id)


@app.route('/api/admin/classes/<int:class_id>/schedule', methods=['DELETE', 'OPTIONS'])
@require_role('admin')
def admin_class_schedule_delete(class_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if class_id <= 0:
        return jsonify(status='error', message='invalid_class_id'), 400

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            cursor.execute("SELECT id FROM classes WHERE id=?", (class_id,))
            exists = cursor.fetchone()
        except sqlite3.Error:
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        if not exists:
            return jsonify(status='error', message='class_not_found'), 404

        cursor = conn.cursor()
        entries_deleted = 0
        schedules_deleted = 0
        try:
            cursor.execute("DELETE FROM stundenplan_entries WHERE class_id=?", (class_id,))
            entries_deleted = cursor.rowcount or 0
            cursor.execute("DELETE FROM class_schedules WHERE class_id=?", (class_id,))
            schedules_deleted = cursor.rowcount or 0
            _log_admin_action(
                conn,
                'delete',
                'schedule',
                None,
                {
                    'class_id': class_id,
                    'entries_deleted': entries_deleted,
                    'schedule_records_deleted': schedules_deleted,
                },
            )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        _log_user_event(
            'schedule_delete',
            class_id=class_id,
            entries_deleted=entries_deleted,
            schedule_records_deleted=schedules_deleted,
        )

        return jsonify(
            status='ok',
            removed_entries=entries_deleted,
            removed_schedules=schedules_deleted,
        )


@app.route('/api/admin/schedule-entries', methods=['GET', 'POST', 'OPTIONS'])
@require_role('admin')
def admin_schedule_entries_collection():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    class_id_value = request.args.get('class_id') if request.method == 'GET' else None

    with closing(conn):
        if request.method == 'GET':
            class_id = _ensure_int(class_id_value, allow_none=False)
            if not class_id or class_id <= 0:
                return jsonify(status='error', message='invalid_class_id'), 400

            cursor = conn.dict_cursor()
            try:
                cursor.execute("SELECT id FROM classes WHERE id=?", (class_id,))
                if cursor.fetchone() is None:
                    return jsonify(status='error', message='class_not_found'), 404
                cursor.execute(
                    "SELECT id, class_id, tag, start, end, fach, raum FROM stundenplan_entries WHERE class_id=?",
                    (class_id,),
                )
                rows = cursor.fetchall() or []
            except sqlite3.Error:
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()

            for row in rows:
                try:
                    row['tag'] = _canonicalize_weekday(row.get('tag'))
                except ValueError:
                    row['tag'] = (row.get('tag') or '').strip()

            rows.sort(key=_schedule_entry_sort_key)
            return jsonify(status='ok', data=list(_serialize_rows(rows)))

        data = request.json or {}
        class_id = _ensure_int(data.get('class_id'), allow_none=False)
        if not class_id or class_id <= 0:
            return jsonify(status='error', message='invalid_class_id'), 400

        try:
            tag_value = _canonicalize_weekday(data.get('tag'))
        except ValueError:
            return jsonify(status='error', message='invalid_tag'), 400

        start_raw = data.get('start')
        start_value = str(start_raw).strip() if start_raw is not None else ''
        if not start_value:
            return jsonify(status='error', message='invalid_start'), 400

        end_raw = data.get('end')
        end_value = str(end_raw).strip() if end_raw is not None else ''
        if not end_value:
            return jsonify(status='error', message='invalid_end'), 400

        fach_raw = data.get('fach')
        fach_value = str(fach_raw).strip() if fach_raw is not None else ''
        if not fach_value:
            return jsonify(status='error', message='invalid_subject'), 400

        raum_raw = data.get('raum')
        raum_value = None
        if raum_raw is not None:
            raum_value = str(raum_raw).strip() or None

        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM classes WHERE id=?", (class_id,))
            if cursor.fetchone() is None:
                return jsonify(status='error', message='class_not_found'), 404

            cursor.execute(
                """
                INSERT INTO stundenplan_entries (class_id, tag, start, end, fach, raum)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (class_id, tag_value, start_value, end_value, fach_value, raum_value),
            )
            entry_id = cursor.lastrowid
            _log_admin_action(
                conn,
                'create',
                'schedule_entry',
                entry_id,
                {
                    'class_id': class_id,
                    'tag': tag_value,
                    'start': start_value,
                    'end': end_value,
                    'fach': fach_value,
                    'raum': raum_value,
                },
            )
            _touch_class_schedule(conn, class_id)
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

    return jsonify(status='ok', id=entry_id)


@app.route('/api/admin/schedule-entries/<int:entry_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@require_role('admin')
def admin_schedule_entries_resource(entry_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            cursor.execute(
                "SELECT id, class_id, tag, start, end, fach, raum FROM stundenplan_entries WHERE id=?",
                (entry_id,),
            )
            entry = cursor.fetchone()
        except sqlite3.Error:
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        if not entry:
            return jsonify(status='error', message='schedule_entry_not_found'), 404

        try:
            entry['tag'] = _canonicalize_weekday(entry.get('tag'))
        except ValueError:
            entry['tag'] = (entry.get('tag') or '').strip()

        if request.method == 'GET':
            return jsonify(status='ok', data=list(_serialize_rows([entry]))[0])

        if request.method == 'DELETE':
            class_id = _ensure_int(request.args.get('class_id'), allow_none=False)
            if not class_id or class_id != entry.get('class_id'):
                return jsonify(status='error', message='class_mismatch'), 403

            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM stundenplan_entries WHERE id=?", (entry_id,))
                if cursor.rowcount == 0:
                    return jsonify(status='error', message='schedule_entry_not_found'), 404
                _log_admin_action(conn, 'delete', 'schedule_entry', entry_id, {'class_id': class_id})
                _touch_class_schedule(conn, class_id)
                conn.commit()
            except sqlite3.Error:
                conn.rollback()
                return jsonify(status='error', message='database_unavailable'), 503
            finally:
                cursor.close()
            return jsonify(status='ok')

        data = request.json or {}
        class_id = _ensure_int(data.get('class_id'), allow_none=False)
        if not class_id or class_id != entry.get('class_id'):
            return jsonify(status='error', message='class_mismatch'), 403

        updates = []
        values = []
        details = {}

        if 'tag' in data:
            try:
                tag_value = _canonicalize_weekday(data.get('tag'))
            except ValueError:
                return jsonify(status='error', message='invalid_tag'), 400
            updates.append('tag=?')
            values.append(tag_value)
            details['tag'] = tag_value

        if 'start' in data:
            start_raw = data.get('start')
            start_value = str(start_raw).strip() if start_raw is not None else ''
            if not start_value:
                return jsonify(status='error', message='invalid_start'), 400
            updates.append('start=?')
            values.append(start_value)
            details['start'] = start_value

        if 'end' in data:
            end_raw = data.get('end')
            end_value = str(end_raw).strip() if end_raw is not None else ''
            if not end_value:
                return jsonify(status='error', message='invalid_end'), 400
            updates.append('end=?')
            values.append(end_value)
            details['end'] = end_value

        if 'fach' in data:
            fach_raw = data.get('fach')
            fach_value = str(fach_raw).strip() if fach_raw is not None else ''
            if not fach_value:
                return jsonify(status='error', message='invalid_subject'), 400
            updates.append('fach=?')
            values.append(fach_value)
            details['fach'] = fach_value

        if 'raum' in data:
            raum_raw = data.get('raum')
            raum_value = str(raum_raw).strip() if raum_raw is not None else ''
            normalized_raum = raum_value or None
            updates.append('raum=?')
            values.append(normalized_raum)
            details['raum'] = normalized_raum

        if not updates:
            return jsonify(status='error', message='no_changes'), 400

        cursor = conn.cursor()
        try:
            query = f"UPDATE stundenplan_entries SET {', '.join(updates)} WHERE id=?"
            values.append(entry_id)
            cursor.execute(query, tuple(values))
            if cursor.rowcount == 0:
                return jsonify(status='error', message='schedule_entry_not_found'), 404
            _log_admin_action(conn, 'update', 'schedule_entry', entry_id, {'class_id': class_id, **details})
            _touch_class_schedule(conn, class_id)
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        return jsonify(status='ok')


@app.route('/api/classes', methods=['GET'])
@require_role('admin', 'class_admin', 'teacher')
def list_classes():
    if HWM_DEBUG_MODE:
        return jsonify(DEBUG_CLASSES)

    role = session.get('role')
    is_admin = role == 'admin'
    class_id = _get_session_class_id()
    if role == 'class_admin' and class_id is None:
        return jsonify({'status': 'error', 'message': 'class_required'}), 403

    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            if is_admin:
                cursor.execute(
                    "SELECT id, slug, title, description, is_active FROM classes ORDER BY title ASC"
                )
            elif role == 'teacher':
                cursor.execute(
                    "SELECT id, slug, title, description, is_active FROM classes ORDER BY title ASC"
                )
            else:
                cursor.execute(
                    "SELECT id, slug, title, description, is_active FROM classes WHERE id=?",
                    (class_id,),
                )
            rows = cursor.fetchall() or []
            if role in {'admin', 'teacher'} and not any((row.get('slug') or '') == GLOBAL_ENTRY_CLASS_ID for row in rows):
                rows.insert(
                    0,
                    {
                        'id': None,
                        'slug': GLOBAL_ENTRY_CLASS_ID,
                        'title': 'Alle Klassen',
                        'description': 'Schulweite Einträge',
                        'is_active': 1,
                    },
                )
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
        finally:
            cursor.close()

    return jsonify(rows)


@app.route('/api/session/class', methods=['GET', 'PUT', 'OPTIONS'])
def manage_session_class():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        if request.method == 'GET':
            return jsonify({
                'status': 'ok',
                'class_id': session.get('entry_class_id') or 'l23a-test',
                'class_slug': session.get('class_slug') or 'l23a-test',
                'class_numeric_id': 23,
            })
        data = request.json or {}
        raw_class = (data.get('class_id') or data.get('class_slug') or 'l23a-test').strip()
        if not raw_class:
            raw_class = 'l23a-test'
        session['class_slug'] = raw_class
        session['entry_class_id'] = raw_class
        return jsonify({
            'status': 'ok',
            'class_id': raw_class,
            'class_slug': raw_class,
            'class_numeric_id': None if raw_class == GLOBAL_ENTRY_CLASS_ID else 23,
            'class_title': 'Alle Klassen' if raw_class == GLOBAL_ENTRY_CLASS_ID else raw_class,
        })

    role = session.get('role') or 'guest'

    if request.method == 'GET':
        if role not in {'admin', 'teacher', 'class_admin', 'student'}:
            return jsonify({'status': 'error', 'message': 'forbidden'}), 403
        numeric_id = _get_session_class_id()
        entry_class_id = _get_session_entry_class_id()
        class_slug = session.get('class_slug')
        response = {
            'status': 'ok',
            'class_id': entry_class_id,
            'class_slug': class_slug,
            'class_numeric_id': numeric_id,
        }
        if class_slug and not entry_class_id:
            try:
                response['class_id'] = _normalize_entry_class_id(class_slug)
            except ValueError:
                response['class_id'] = None
        return jsonify(response)

    if role not in {'admin', 'teacher'}:
        return jsonify({'status': 'error', 'message': 'forbidden'}), 403

    data = request.json or {}
    raw_class = (data.get('class_id') or data.get('class_slug') or '').strip()

    if not raw_class:
        session.pop('class_id', None)
        session.pop('class_slug', None)
        session.pop('entry_class_id', None)
        return jsonify({'status': 'ok', 'class_id': None, 'class_slug': None})

    try:
        normalized = _normalize_entry_class_id(raw_class)
    except ValueError:
        return jsonify({'status': 'error', 'message': 'invalid_class_id'}), 400

    if normalized == GLOBAL_ENTRY_CLASS_ID:
        session.pop('class_id', None)
        session['class_slug'] = GLOBAL_ENTRY_CLASS_ID
        session['entry_class_id'] = GLOBAL_ENTRY_CLASS_ID
        return jsonify({
            'status': 'ok',
            'class_id': GLOBAL_ENTRY_CLASS_ID,
            'class_slug': GLOBAL_ENTRY_CLASS_ID,
            'class_numeric_id': None,
            'class_title': 'Alle Klassen',
        })

    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503

    with closing(conn):
        try:
            class_row = _load_class_by_slug(conn, raw_class) or _load_class_by_slug(conn, normalized)
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503

        if not class_row:
            return jsonify({'status': 'error', 'message': 'class_not_found'}), 404

        session['class_id'] = class_row['id']
        session['class_slug'] = class_row['slug']
        session['entry_class_id'] = normalized

        response = {
            'status': 'ok',
            'class_id': normalized,
            'class_slug': class_row.get('slug'),
            'class_numeric_id': class_row.get('id'),
        }
        if class_row.get('title'):
            response['class_title'] = class_row['title']
        return jsonify(response)


@app.route('/api/users/<int:user_id>/class', methods=['PUT', 'OPTIONS'])
@require_role('admin')
def assign_user_to_class(user_id: int):
    if request.method == 'OPTIONS':
        return _cors_preflight()

    data = request.json or {}
    target_class_id = data.get('class_id')
    try:
        target_class_id = int(target_class_id)
    except (TypeError, ValueError):
        return jsonify({'status': 'error', 'message': 'invalid_class_id'}), 400

    if target_class_id <= 0:
        return jsonify({'status': 'error', 'message': 'invalid_class_id'}), 400

    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503

    with closing(conn):
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM classes WHERE id=?", (target_class_id,))
            if cursor.fetchone() is None:
                return jsonify({'status': 'error', 'message': 'class_not_found'}), 404

            cursor.execute("SELECT id FROM users WHERE id=?", (user_id,))
            if cursor.fetchone() is None:
                return jsonify({'status': 'error', 'message': 'user_not_found'}), 404

            cursor.execute(
                "UPDATE users SET class_id=? WHERE id=?",
                (target_class_id, user_id),
            )
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
        finally:
            cursor.close()

    return jsonify({'status': 'ok'})


# --- Current user profile endpoints ---
@app.route('/api/me', methods=['GET', 'DELETE', 'OPTIONS'])
@require_role()
def current_user_profile():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        if request.method == 'DELETE':
            return jsonify(status='ok')
        return jsonify(status='ok', data={
            'id': 1,
            'email': 'debug@localhost',
            'role': 'admin',
            'class_id': 23,
            'class_slug': 'l23a-test',
            'class_title': 'Test class L23a',
            'created_at': datetime.datetime.utcnow().isoformat(),
            'account_age_days': 0,
            'class_change_remaining_days': None,
            'class_change_available_at': None,
        })

    user_id = g.get('user', {}).get('id')
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        _log_request_error(401, 'not_authenticated')
        return jsonify(status='error', message='not_authenticated'), 401

    try:
        conn = get_connection()
    except Exception as exc:
        _log_request_error(500, 'Could not load profile', exc=exc)
        return jsonify(error='server_error', message='Could not load profile'), 500

    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            if request.method == 'GET':
                cursor.execute(
                    """
                    SELECT u.id, u.email, u.role, u.class_id, u.is_active, u.email_verified_at, u.created_at, u.updated_at,
                           c.slug AS class_slug, c.title AS class_title
                    FROM users u
                    LEFT JOIN classes c ON c.id = u.class_id
                    WHERE u.id=?
                    LIMIT 1
                    """,
                    (user_id,),
                )
                row = cursor.fetchone()
                if not row:
                    session.clear()
                    return jsonify(status='error', message='not_authenticated'), 401
                try:
                    if row.get('is_active') is not None and int(row['is_active']) == 0:
                        session.clear()
                        return jsonify(status='error', message='not_authenticated'), 401
                except (TypeError, ValueError):
                    pass
                _sync_session_user(row, conn=conn)
                # compute account age in days
                created_at = row.get('created_at')
                account_age_days = None
                now = datetime.datetime.utcnow()
                if created_at:
                    try:
                        delta = now - created_at
                        account_age_days = max(0, int(delta.total_seconds() // 86400))
                    except Exception:
                        account_age_days = None

                class_change_remaining_days = None
                class_change_available_at = None

                return jsonify(status='ok', data={
                    'id': row.get('id'),
                    'email': row.get('email'),
                    'role': row.get('role'),
                    'class_id': row.get('class_id'),
                    'class_slug': row.get('class_slug'),
                    'class_title': row.get('class_title'),
                    'created_at': row.get('created_at').isoformat() if row.get('created_at') else None,
                    'account_age_days': account_age_days,
                    'class_change_remaining_days': class_change_remaining_days,
                    'class_change_available_at': class_change_available_at,
                })

            if request.method == 'DELETE':
                # Soft-delete: mark account as inactive and record deletion time
                cursor.close()
                cursor = conn.cursor()
                deleted_at = datetime.datetime.utcnow()
                try:
                    cursor.execute(
                        "UPDATE users SET is_active=0, deleted_at=?, updated_at=? WHERE id=?",
                        (deleted_at, deleted_at, user_id),
                    )
                except sqlite3.Error as exc:
                    _log_request_error(500, 'Could not load profile', exc=exc)
                    return jsonify(error='server_error', message='Could not load profile'), 500

                if cursor.rowcount == 0:
                    return jsonify(status='error', message='user_not_found'), 404
                _log_user_event('account_soft_delete', user_id=user_id)
                conn.commit()
                # clear session
                session_keys = list(session.keys())
                for k in session_keys:
                    session.pop(k, None)
                return jsonify(status='ok')

        except sqlite3.Error as exc:
            _log_request_error(500, 'Could not load profile', exc=exc)
            return jsonify(error='server_error', message='Could not load profile'), 500
        except Exception as exc:
            _log_request_error(500, 'Could not load profile', exc=exc)
            return jsonify(error='server_error', message='Could not load profile'), 500
        finally:
            cursor.close()

    # fallback
    return jsonify(status='error', message='unknown'), 500


@app.route('/api/me/password', methods=['POST', 'OPTIONS'])
@require_role()
def change_current_user_password():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    user_id = session.get('user_id')
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify(status='error', message='not_authenticated'), 401

    data = request.get_json(silent=True) or {}
    current_password = (data.get('current_password') or '').strip()
    new_password = (data.get('new_password') or '').strip()

    if not current_password:
        return jsonify(status='error', message='current_password_required'), 400
    if not new_password:
        return jsonify(status='error', message='password_required'), 400
    if len(new_password) < 8:
        return jsonify(status='error', message='weak_password'), 400

    try:
        conn = get_connection()
    except Exception:
        return jsonify(status='error', message='database_unavailable'), 503

    email_address: Optional[str] = None
    with closing(conn):
        cursor = conn.dict_cursor()
        try:
            cursor.execute(
                "SELECT password_hash, email FROM users WHERE id=? LIMIT 1",
                (user_id,),
            )
            user_row = cursor.fetchone()
        except sqlite3.Error:
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            cursor.close()

        if not user_row:
            return jsonify(status='error', message='user_not_found'), 404

        email_address = user_row.get('email')
        stored_hash = user_row.get('password_hash') or ''
        if not verify_password(stored_hash, current_password):
            return jsonify(status='error', message='invalid_current_password'), 400
        if verify_password(stored_hash, new_password):
            return jsonify(status='error', message='password_unchanged'), 400

        try:
            new_password_hash = hash_password(new_password)
        except ValueError:
            return jsonify(status='error', message='weak_password'), 400

        update_cursor = conn.cursor()
        now = datetime.datetime.utcnow()
        try:
            update_cursor.execute(
                "UPDATE users SET password_hash=?, updated_at=? WHERE id=?",
                (new_password_hash, now, user_id),
            )
            if update_cursor.rowcount == 0:
                return jsonify(status='error', message='user_not_found'), 404
            _log_user_event('password_changed', user_id=user_id)
            conn.commit()
        except sqlite3.Error:
            conn.rollback()
            return jsonify(status='error', message='database_unavailable'), 503
        finally:
            update_cursor.close()

    email_sent = True
    try:
        _send_password_change_email(email_address)
    except Exception as exc:  # pragma: no cover - depends on SMTP availability
        email_sent = False
        app.logger.warning('Failed to send password change email for user %s: %s', user_id, exc)

    return jsonify(status='ok', email_sent=email_sent)


# --- UPDATE ENTRY ---
@app.route('/update_entry', methods=['OPTIONS', 'PUT'])
@require_entry_manager
def update_entry():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        return jsonify(status='ok', updated=1, debug=True)

    data = request.json or {}

    try:
        entry_id = int(data.get('id'))
    except (TypeError, ValueError):
        return jsonify(status='error', message='invalid_id'), 400

    desc = (data.get('description') or '').strip()
    date_input = data.get('date')
    start = data.get('startzeit') or None
    end = data.get('endzeit') or None
    typ = data.get('type')
    fach = (data.get('fach') or '').strip()
    enddatum_input = data.get('enddatum')

    if start:
        start = start.strip()
        if len(start) == 5:
            start = f"{start}:00"
        start = start[:8]
    if end:
        end = end.strip()
        if len(end) == 5:
            end = f"{end}:00"
        end = end[:8]

    if isinstance(date_input, str) and 'T' in date_input and not start:
        _, time_part = date_input.split('T', 1)
        start = time_part or None

    parsed_date = _parse_iso_date(date_input)
    if parsed_date is None:
        return jsonify(status='error', message='ungültiges datum'), 400
    if typ == 'todo':
        return jsonify(status='error', message='todo_type_not_allowed_here'), 400
    role = session.get('role')
    user_id = session.get('user_id')
    if typ == 'ferien' and role != 'admin':
        return jsonify(status='error', message='forbidden'), 403

    parsed_end_date = _parse_iso_date(enddatum_input) if enddatum_input not in (None, '') else None
    if enddatum_input not in (None, '') and parsed_end_date is None:
        return jsonify(status='error', message='ungültiges enddatum'), 400

    if typ == 'ferien' and parsed_end_date is None:
        return jsonify(status='error', message='enddatum ist erforderlich'), 400

    if parsed_end_date is not None and parsed_end_date < parsed_date:
        return jsonify(status='error', message='enddatum vor datum'), 400

    date = parsed_date.isoformat()
    enddatum = parsed_end_date.isoformat() if parsed_end_date is not None else date

    if not fach:
        fach = ''


    conn = get_connection()
    cur = conn.cursor()
    try:
        class_ids = []
        if role == 'class_admin':
            allowed_class = _get_session_entry_class_id() or ''
            if not allowed_class:
                return jsonify(status='error', message='class_required'), 403
            class_ids = [allowed_class]
        else:
            try:
                class_ids = _normalize_entry_class_id_list(data.get('class_ids'))
            except ValueError:
                return jsonify(status='error', message='invalid_class_id'), 400

            if not class_ids:
                raw_class_id = data.get('class_id')
                if raw_class_id not in (None, ''):
                    try:
                        class_ids = [_normalize_entry_class_id(raw_class_id)]
                    except ValueError:
                        return jsonify(status='error', message='invalid_class_id'), 400
                else:
                    # coupled entries: if no class_id(s) is provided, update all class rows that share this entry id
                    cur.execute(
                        "SELECT class_id FROM eintraege WHERE id=? AND COALESCE(is_private, 0)=0",
                        (entry_id,),
                    )
                    class_ids = [row[0] for row in (cur.fetchall() or []) if row and row[0]]

        class_ids = list(OrderedDict.fromkeys(class_ids))
        if not class_ids:
            return jsonify(status='error', message='Eintrag nicht gefunden'), 404
        if GLOBAL_ENTRY_CLASS_ID in class_ids and typ not in {'event', 'ferien'}:
            return jsonify(status='error', message='default_class_restricted'), 400

        for class_id in class_ids:
            cur.execute(
                "SELECT owner_user_id FROM eintraege WHERE id=? AND class_id=? AND COALESCE(is_private, 0)=0",
                (entry_id, class_id),
            )
            row = cur.fetchone()
            if not row:
                conn.rollback()
                return jsonify(status='error', message='Eintrag nicht gefunden'), 404
            owner_user_id = row[0] if not isinstance(row, dict) else row.get('owner_user_id')
            if not _can_edit_class_entry(role, int(user_id or 0), owner_user_id, class_id):
                conn.rollback()
                return jsonify(status='error', message='forbidden'), 403

        for class_id in class_ids:
            cur.execute(
                """
                UPDATE eintraege
                SET beschreibung=?, datum=?, enddatum=?, startzeit=?, endzeit=?, typ=?, fach=?
                WHERE id=? AND class_id=? AND COALESCE(is_private, 0)=0
                """,
                (desc, date, enddatum, start, end, typ, fach, entry_id, class_id),
            )

        conn.commit()
        _log_user_event(
            'entry_update',
            entry_id=entry_id,
            class_ids=class_ids,
            typ=typ,
            datum=date,
            enddatum=enddatum,
            fach=fach,
            beschreibung=desc,
        )

        return jsonify(status='ok', updated=len(class_ids))
    except Exception as e:
        conn.rollback()
        return jsonify(status='error', message=str(e)), 500
    finally:
        cur.close()
        conn.close()

# --- DELETE ENTRY ---
@app.route('/delete_entry/<int:id>', methods=['DELETE', 'OPTIONS'])
@require_entry_manager
def delete_entry(id):
    # Auth via Session-Cookie (handled by decorator)
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        return jsonify(status='ok', debug=True)

    role = session.get('role')
    user_id = int(session.get('user_id') or 0)
    if role == 'class_admin':
        raw_class_id = request.args.get('class_id')
        if raw_class_id is None:
            raw_class_id = _get_session_entry_class_id()
            if raw_class_id is None:
                return jsonify(status='error', message='class_required'), 403
        try:
            class_id = _normalize_entry_class_id(raw_class_id)
        except ValueError:
            return jsonify(status='error', message='invalid_class_id'), 400
        allowed_class = _get_session_entry_class_id() or ''
        if not allowed_class:
            return jsonify(status='error', message='class_required'), 403
        if class_id != allowed_class:
            return jsonify(status='error', message='forbidden'), 403
    conn = get_connection()
    cur = conn.cursor()
    try:
        if role == 'teacher':
            cur.execute(
                "SELECT owner_user_id FROM eintraege WHERE id=? AND COALESCE(is_private, 0)=0 LIMIT 1",
                (id,),
            )
            row = cur.fetchone()
            owner_user_id = row[0] if row else None
            if owner_user_id is None or int(owner_user_id) != user_id:
                return jsonify(status='error', message='forbidden'), 403
        if role == 'class_admin':
            cur.execute(
                "DELETE FROM eintraege WHERE id=? AND class_id=? AND COALESCE(is_private, 0)=0",
                (id, class_id),
            )
        else:
            # coupled entries: delete all class rows that share this id
            if role == 'teacher':
                cur.execute(
                    "DELETE FROM eintraege WHERE id=? AND owner_user_id=? AND COALESCE(is_private, 0)=0",
                    (id, user_id),
                )
            else:
                cur.execute(
                    "DELETE FROM eintraege WHERE id=? AND COALESCE(is_private, 0)=0",
                    (id,),
                )
        deleted = cur.rowcount or 0
        conn.commit()
        if deleted:
            if role == 'class_admin':
                _log_user_event('entry_delete', entry_id=id, class_id=class_id, deleted=deleted)
            else:
                _log_user_event('entry_delete', entry_id=id, deleted=deleted, coupled=True)
        return jsonify(status='ok')
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500
    finally:
        cur.close()
        conn.close()

# CORS‐Preflight‐Helper
def _cors_preflight():
    origin = _resolve_cors_origin()
    if origin is None:
        return make_response("", 403)

    resp = make_response()
    resp.headers.update({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') or 'Content-Type, X-Role, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin',
    })
    return resp, 200

# --- STUNDENPLAN / AKTUELLES_FACH ---
@app.route('/api/timetable/live', methods=['GET'])
def timetable_live():
    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    with closing(conn):
        class_id, error_response = _resolve_timetable_class_id_from_request(conn)
        if error_response:
            return error_response
        try:
            if not _class_has_schedule(conn, class_id):
                return jsonify({'error': 'schedule_unavailable'}), 404
            now_param = request.args.get('now')
            now_value = None
            if now_param:
                try:
                    now_value = datetime.datetime.fromisoformat(now_param)
                except ValueError:
                    return jsonify(status='error', message='invalid_now'), 400
            payload = _calculate_timetable_live(conn, class_id, now_value)
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    return jsonify(payload)


@app.route('/api/timetable/day', methods=['GET'])
def timetable_day():
    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    with closing(conn):
        class_id, error_response = _resolve_timetable_class_id_from_request(conn)
        if error_response:
            return error_response
        requested_date = _parse_iso_date(request.args.get('date')) or datetime.datetime.now(TIMETABLE_TIMEZONE).date()
        try:
            if not _class_has_schedule(conn, class_id):
                return jsonify({'error': 'schedule_unavailable'}), 404
            day = _calculate_timetable_day(conn, class_id, requested_date)
            next_day = _next_school_day(conn, class_id, requested_date)
            next_plan = _calculate_timetable_day(conn, class_id, next_day) if next_day else None
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    return jsonify(
        {
            'class_id': class_id,
            'date': requested_date.isoformat(),
            'day_status': day.get('day_status'),
            'day_status_label': day.get('day_status_label'),
            'notice': day.get('notice'),
            'day_plan': day.get('lessons') or [],
            'day': day,
            'next_school_day': next_day.isoformat() if next_day else None,
            'next_day_plan': (next_plan or {}).get('lessons') or [],
            'next_day': next_plan,
        }
    )


@app.route('/api/timetable/week', methods=['GET'])
def timetable_week():
    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    with closing(conn):
        class_id, error_response = _resolve_timetable_class_id_from_request(conn)
        if error_response:
            return error_response
        requested_date = _parse_iso_date(request.args.get('date')) or datetime.datetime.now(TIMETABLE_TIMEZONE).date()
        week_start = requested_date - datetime.timedelta(days=requested_date.weekday())
        try:
            if not _class_has_schedule(conn, class_id):
                return jsonify({'error': 'schedule_unavailable'}), 404
            days = [_calculate_timetable_day(conn, class_id, week_start + datetime.timedelta(days=offset)) for offset in range(5)]
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    return jsonify(
        {
            'class_id': class_id,
            'week_start': week_start.isoformat(),
            'week_end': (week_start + datetime.timedelta(days=4)).isoformat(),
            'days': days,
        }
    )


@app.route('/stundenplan')
@require_class_context
def stundenplan():
    class_id = g.get('active_class_id') or _get_session_class_id()
    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    with closing(conn):
        try:
            schedule = _load_schedule_for_class(conn, class_id)
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
        return jsonify(schedule)

@app.route('/aktuelles_fach')
@require_class_context
def aktuelles_fach():
    class_id = g.get('active_class_id') or _get_session_class_id()
    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    with closing(conn):
        try:
            if not _class_has_schedule(conn, class_id):
                return jsonify({'error': 'schedule_unavailable'}), 404
            live = _calculate_timetable_live(conn, class_id)
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    return jsonify(_legacy_live_payload(live))


@app.route('/tagesuebersicht')
@require_class_context
def tagesuebersicht():
    today = datetime.datetime.now(TIMETABLE_TIMEZONE).date()
    class_id = g.get('active_class_id') or _get_session_class_id()
    try:
        conn = get_connection()
    except Exception:
        return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
    with closing(conn):
        try:
            if not _class_has_schedule(conn, class_id):
                return jsonify({'error': 'schedule_unavailable'}), 404
            day = _calculate_timetable_day(conn, class_id, today)
            next_day = _next_school_day(conn, class_id, today)
            next_plan = _calculate_timetable_day(conn, class_id, next_day) if next_day else None
        except sqlite3.Error:
            return jsonify({'status': 'error', 'message': 'database_unavailable'}), 503
        return jsonify(
            _legacy_day_payload(
                {
                    'date': today.isoformat(),
                    'day_plan': day.get('lessons') or [],
                    'next_school_day': next_day.isoformat() if next_day else None,
                    'next_day_plan': (next_plan or {}).get('lessons') or [],
                }
            )
        )

# --- EINTRAG HINZUFÜGEN ---
@app.route('/add_entry', methods=['POST', 'OPTIONS'])
@require_entry_manager
def add_entry():
    if request.method == 'OPTIONS':
        return _cors_preflight()

    if HWM_DEBUG_MODE:
        return jsonify(status='ok', created=1, id=9999, debug=True)

    data = request.json or {}
    try:
        class_ids = _normalize_entry_class_id_list(data.get('class_ids'))
    except ValueError:
        return jsonify(status='error', message='invalid_class_id'), 400

    if not class_ids:
        try:
            class_ids = [_normalize_entry_class_id(data.get('class_id'))]
        except ValueError:
            return jsonify(status='error', message='invalid_class_id'), 400
    beschreibung = (data.get("beschreibung") or '').strip()
    datum_input = data.get("datum")
    startzeit = data.get("startzeit")
    endzeit = data.get("endzeit")
    typ = data.get("typ")
    fach = (data.get("fach") or '').strip()
    enddatum_input = data.get("enddatum")

    if startzeit == '':
        startzeit = None
    if endzeit == '':
        endzeit = None

    if startzeit:
        startzeit = startzeit.strip()
        if len(startzeit) == 5:
            startzeit = f"{startzeit}:00"
        startzeit = startzeit[:8]
    if endzeit:
        endzeit = endzeit.strip()
        if len(endzeit) == 5:
            endzeit = f"{endzeit}:00"
        endzeit = endzeit[:8]

    if isinstance(datum_input, str) and 'T' in datum_input and not startzeit:
        _, time_part = datum_input.split('T', 1)
        startzeit = time_part or None

    if not typ or not datum_input:
        return jsonify(status="error", message="typ und datum sind erforderlich"), 400
    if typ == 'todo':
        return jsonify(status='error', message='todo_type_not_allowed_here'), 400
    role = session.get('role')
    user_id = int(session.get('user_id') or 0)
    if typ == 'ferien' and role != 'admin':
        return jsonify(status='error', message='forbidden'), 403

    start_date = _parse_iso_date(datum_input)
    if start_date is None:
        return jsonify(status="error", message="ungültiges datum"), 400

    end_date = _parse_iso_date(enddatum_input) if enddatum_input not in (None, '') else None
    if enddatum_input not in (None, '') and end_date is None:
        return jsonify(status="error", message="ungültiges enddatum"), 400

    if typ == 'ferien' and end_date is None:
        return jsonify(status="error", message="enddatum ist erforderlich"), 400

    if end_date is not None and end_date < start_date:
        return jsonify(status="error", message="enddatum vor datum"), 400

    datum = start_date.isoformat()
    enddatum = end_date.isoformat() if end_date is not None else datum

    if not fach:
        fach = ''

    if role == 'class_admin':
        allowed_class = _get_session_entry_class_id() or ''
        if not allowed_class:
            return jsonify(status='error', message='class_required'), 403
        if any(class_id != allowed_class for class_id in class_ids):
            return jsonify(status='error', message='forbidden'), 403
        class_ids = [allowed_class]

    if GLOBAL_ENTRY_CLASS_ID in class_ids and typ not in {'event', 'ferien'}:
        return jsonify(status='error', message='default_class_restricted'), 400

    conn = get_connection(); cur = conn.cursor()
    try:
        first_class = class_ids[0]
        entry_id = _next_entry_id(conn)
        cur.execute(
            """
            INSERT INTO eintraege (id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """,
            (entry_id, first_class, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, user_id or None, 0),
        )

        for extra_class in class_ids[1:]:
            cur.execute(
                """
                INSERT INTO eintraege (id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
                """,
                (entry_id, extra_class, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, user_id or None, 0),
            )

        conn.commit()
        _log_user_event(
            'entry_create',
            entry_id=entry_id,
            class_ids=class_ids,
            typ=typ,
            datum=datum,
            enddatum=enddatum,
            fach=fach,
            beschreibung=beschreibung,
        )
        return jsonify(status="ok", created=len(class_ids), id=entry_id)
    except Exception as e:
        conn.rollback()
        return jsonify(status="error", message=str(e)), 500
    finally:
        cur.close(); conn.close()
        
@app.after_request
def add_cors_headers(response):
    origin = _resolve_cors_origin()
    if origin is not None:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'

        existing_vary = response.headers.get('Vary', '')
        vary_values = [value.strip() for value in existing_vary.split(',') if value.strip()]
        if 'Origin' not in vary_values:
            vary_values.append('Origin')
        if vary_values:
            response.headers['Vary'] = ', '.join(vary_values)
    else:
        response.headers.pop('Access-Control-Allow-Origin', None)
        response.headers.pop('Access-Control-Allow-Credentials', None)

    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = request.headers.get('Access-Control-Request-Headers') or 'Content-Type, X-Role, Authorization'
    return response

# ---------- SERVER START ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.getenv("FLASK_DEBUG") == "1")
