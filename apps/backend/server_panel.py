from __future__ import annotations

import html
import json
import os
import platform
import sqlite3
import time
from collections import Counter, deque
from pathlib import Path
from typing import Any

from flask import abort, jsonify, redirect, render_template_string, request, send_file, url_for
from werkzeug.utils import secure_filename

from db import DB_PATH, fetch_all

STARTED_AT = time.time()
REQUEST_EVENTS = deque(maxlen=1000)
IMPORT_LOGS = deque(maxlen=200)
LOCAL_HOSTS = {"127.0.0.1", "::1", "localhost"}
SERVER_PANEL_TOKEN = ""
NL = "\n"


def init_server_panel(app, *, base_dir: Path, logs_dir: Path, imports_dir: Path, exports_dir: Path, get_log_path):
    for directory in (logs_dir, imports_dir, exports_dir):
        directory.mkdir(parents=True, exist_ok=True)

    safe_roots = {
        "data": (base_dir / "data").resolve(),
        "logs": logs_dir.resolve(),
        "imports": imports_dir.resolve(),
        "exports": exports_dir.resolve(),
    }

    @app.before_request
    def _server_panel_start_timer():
        request.environ["hwm_request_started_at"] = time.perf_counter()

    @app.after_request
    def _server_panel_record_request(response):
        started = request.environ.get("hwm_request_started_at")
        duration_ms = 0.0
        if started is not None:
            duration_ms = (time.perf_counter() - float(started)) * 1000
        REQUEST_EVENTS.append(
            {
                "ts": time.time(),
                "method": request.method,
                "path": request.path,
                "endpoint": request.endpoint or request.path,
                "status": response.status_code,
                "duration_ms": round(duration_ms, 2),
            }
        )
        return response

    @app.before_request
    def _server_panel_local_only():
        if not request.path.startswith("/server"):
            return None
        if not _is_local_request():
            abort(403)
        if SERVER_PANEL_TOKEN and request.args.get("token") != SERVER_PANEL_TOKEN:
            abort(403)
        return None

    @app.route("/server")
    def server_index():
        return redirect(url_for("server_dashboard"))

    @app.route("/server/dashboard")
    def server_dashboard():
        important_tables = [
            "users",
            "classes",
            "eintraege",
            "stundenplan_entries",
            "todo_subtasks",
            "class_schedules",
        ]
        counts = _table_counts(important_tables)
        db_size = DB_PATH.stat().st_size if DB_PATH.exists() else 0
        errors = _tail_errors(get_log_path(), limit=8)
        monitoring = _monitoring_snapshot()
        safe_config = {
            "debug": bool(app.debug),
            "cors_origins_configured": len(app.config.get("CORS_ORIGINS", []) or []),
            "session_cookie_secure": app.config.get("SESSION_COOKIE_SECURE"),
            "session_cookie_samesite": app.config.get("SESSION_COOKIE_SAMESITE"),
        }
        return _page(
            "Dashboard",
            f"""
            <section class="grid">
              <div><b>Status</b><span>running</span></div>
              <div><b>Uptime</b><span>{_format_duration(time.time() - STARTED_AT)}</span></div>
              <div><b>Python</b><span>{html.escape(platform.python_version())}</span></div>
              <div><b>SQLite</b><span>{html.escape(str(DB_PATH))}</span></div>
              <div><b>DB size</b><span>{_format_bytes(db_size)}</span></div>
              <div><b>Error rate</b><span>{monitoring['error_rate']:.1f}%</span></div>
            </section>
            <h2>Wichtige Tabellen</h2>
            {_table_html(counts)}
            <h2>Monitoring</h2>
            {_monitoring_html(monitoring)}
            <h2>Letzte Fehler</h2>
            <pre>{html.escape(NL.join(errors) or "Keine Fehler im aktuellen Logauszug.")}</pre>
            <h2>Aktive Konfiguration</h2>
            <pre>{html.escape(json.dumps(safe_config, indent=2, ensure_ascii=False))}</pre>
            """,
        )

    @app.route("/server/logs")
    def server_logs():
        level = (request.args.get("level") or "").upper()
        path = Path(get_log_path() or "")
        lines = []
        if path.exists() and _is_allowed_path(path, logs_dir.resolve()):
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()[-1000:]
        if level in {"ERROR", "WARNING", "INFO"}:
            lines = [line for line in lines if f" {level} " in line or f" {level} [" in line]
        return _page(
            "Logs",
            f"""
            <form method="get" class="toolbar">
              <select name="level">
                <option value="">Alle</option>
                <option value="ERROR">Error</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
              </select>
              <button>Filtern</button>
              <a href="/server/logs/download">Download</a>
            </form>
            <pre>{html.escape(NL.join(lines) or "Noch keine Logzeilen vorhanden.")}</pre>
            """,
        )

    @app.route("/server/logs/download")
    def server_logs_download():
        path = Path(get_log_path() or "")
        if not path.exists() or not _is_allowed_path(path, logs_dir.resolve()):
            abort(404)
        return send_file(path, as_attachment=True)

    @app.route("/server/files")
    def server_files():
        area = request.args.get("area") or "data"
        root = safe_roots.get(area)
        if root is None:
            abort(404)
        files = []
        for item in sorted(root.iterdir(), key=lambda p: (p.is_file(), p.name.lower())) if root.exists() else []:
            if item.is_file():
                files.append(
                    f"<tr><td>{html.escape(item.name)}</td><td>{_format_bytes(item.stat().st_size)}</td>"
                    f"<td><a href='/server/files/download?area={html.escape(area)}&name={html.escape(item.name)}'>Download</a></td></tr>"
                )
        nav = " ".join(f"<a href='/server/files?area={key}'>{key}</a>" for key in safe_roots)
        return _page("Files", f"<p class='toolbar'>{nav}</p><table><tr><th>Datei</th><th>Grösse</th><th></th></tr>{''.join(files)}</table>")

    @app.route("/server/files/download")
    def server_file_download():
        area = request.args.get("area") or ""
        name = request.args.get("name") or ""
        root = safe_roots.get(area)
        if root is None:
            abort(404)
        target = (root / name).resolve()
        if not _is_allowed_path(target, root) or not target.is_file():
            abort(404)
        return send_file(target, as_attachment=True)

    @app.route("/server/import", methods=["GET", "POST"])
    def server_import():
        imports_dir.mkdir(parents=True, exist_ok=True)
        message = ""
        if request.method == "POST" and "db_file" in request.files:
            upload = request.files["db_file"]
            if upload and upload.filename:
                filename = secure_filename(upload.filename)
                upload.save(imports_dir / filename)
                message = f"Upload gespeichert: {filename}"
        files = [p.name for p in sorted(imports_dir.glob("*")) if p.is_file()]
        rows = "".join(f"<option value='{html.escape(name)}'>{html.escape(name)}</option>" for name in files)
        return _page(
            "Import",
            f"""
            <p>{html.escape(message)}</p>
            <form method="post" enctype="multipart/form-data" class="toolbar">
              <input type="file" name="db_file" accept=".sqlite,.sqlite3,.db">
              <button>Hochladen</button>
            </form>
            <form method="get" action="/server/import/preview" class="toolbar">
              <select name="file">{rows}</select>
              <button>Vorschau</button>
            </form>
            <h2>Import-Logs</h2>
            <pre>{html.escape(NL.join(IMPORT_LOGS) or "Noch keine Import-Logs.")}</pre>
            """,
        )

    @app.route("/server/import/preview")
    def server_import_preview():
        source = _resolve_import_file(imports_dir, request.args.get("file") or "")
        preview = _preview_sqlite_import(source)
        conflict_rows = "".join(
            f"<tr><td>{html.escape(row['table'])}</td><td>{row['source_count']}</td><td>{row['target_count']}</td><td>{row['conflicts']}</td></tr>"
            for row in preview
        )
        return _page(
            "Import Vorschau",
            f"""
            <p>Datei: {html.escape(source.name)}</p>
            <table><tr><th>Tabelle</th><th>Quelle</th><th>Ziel</th><th>Konflikte</th></tr>{conflict_rows}</table>
            <form method="post" action="/server/import/run" class="toolbar">
              <input type="hidden" name="file" value="{html.escape(source.name)}">
              <select name="strategy">
                <option value="skip">Konflikte überspringen</option>
                <option value="overwrite">Konflikte überschreiben</option>
                <option value="abort">Bei Konflikt abbrechen</option>
              </select>
              <button>Import starten</button>
            </form>
            """,
        )

    @app.route("/server/import/run", methods=["POST"])
    def server_import_run():
        source = _resolve_import_file(imports_dir, request.form.get("file") or "")
        strategy = request.form.get("strategy") or "skip"
        if strategy not in {"skip", "overwrite", "abort"}:
            abort(400)
        summary = _run_sqlite_import(source, strategy)
        IMPORT_LOGS.appendleft(f"{time.strftime('%Y-%m-%d %H:%M:%S')} import {source.name}: {summary}")
        return _page("Import Zusammenfassung", f"<pre>{html.escape(json.dumps(summary, indent=2, ensure_ascii=False))}</pre>")

    @app.route("/server/monitoring.json")
    def server_monitoring_json():
        return jsonify(_monitoring_snapshot())


def _is_local_request() -> bool:
    remote = request.remote_addr or ""
    return (
        remote in LOCAL_HOSTS
        or remote.startswith("127.")
        or remote == "::ffff:127.0.0.1"
    )


def _page(title: str, body: str) -> str:
    nav = """
      <nav><a href="/server/dashboard">Dashboard</a><a href="/server/logs">Logs</a><a href="/server/files">Files</a><a href="/server/import">Import</a></nav>
    """
    return render_template_string(
        """
        <!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{{ title }}</title>
        <style>
        body{font-family:system-ui,Segoe UI,sans-serif;margin:0;background:#f6f7f9;color:#17202a}main{max-width:1180px;margin:auto;padding:24px}
        nav{display:flex;gap:12px;background:#17202a;padding:12px 24px}nav a{color:white;text-decoration:none}a{color:#175ea8}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.grid div{background:white;border:1px solid #d8dee6;border-radius:6px;padding:12px}
        .grid b,.grid span{display:block}table{width:100%;border-collapse:collapse;background:white}th,td{border-bottom:1px solid #e4e8ee;text-align:left;padding:8px}
        pre{background:#101820;color:#f3f6fb;border-radius:6px;padding:12px;overflow:auto;max-height:580px}.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        button,select,input{font:inherit;padding:7px 9px}
        </style></head><body>""" + nav + """<main><h1>{{ title }}</h1>{{ body|safe }}</main></body></html>
        """,
        title=title,
        body=body,
    )


def _monitoring_snapshot() -> dict[str, Any]:
    now = time.time()
    recent = [event for event in REQUEST_EVENTS if now - event["ts"] <= 60]
    statuses = Counter(str(event["status"]) for event in REQUEST_EVENTS)
    routes = Counter(event["path"] for event in REQUEST_EVENTS)
    avg = sum(event["duration_ms"] for event in REQUEST_EVENTS) / len(REQUEST_EVENTS) if REQUEST_EVENTS else 0
    errors = sum(1 for event in REQUEST_EVENTS if int(event["status"]) >= 500)
    return {
        "requests_per_minute": len(recent),
        "requests_by_route": dict(routes.most_common(20)),
        "statuscodes": dict(statuses),
        "average_duration_ms": round(avg, 2),
        "error_rate": (errors / len(REQUEST_EVENTS) * 100) if REQUEST_EVENTS else 0.0,
        "recent": list(REQUEST_EVENTS)[-50:],
    }


def _monitoring_html(snapshot: dict[str, Any]) -> str:
    return f"""
    <section class="grid">
      <div><b>Requests/min</b><span>{snapshot['requests_per_minute']}</span></div>
      <div><b>Durchschnitt</b><span>{snapshot['average_duration_ms']} ms</span></div>
      <div><b>Statuscodes</b><span>{html.escape(json.dumps(snapshot['statuscodes']))}</span></div>
    </section>
    <pre>{html.escape(json.dumps(snapshot['requests_by_route'], indent=2, ensure_ascii=False))}</pre>
    """


def _table_counts(tables: list[str]) -> dict[str, int | str]:
    counts: dict[str, int | str] = {}
    for table in tables:
        try:
            row = fetch_all(f"SELECT COUNT(*) AS total FROM {table}")[0]
            counts[table] = int(row["total"])
        except Exception:
            counts[table] = "n/a"
    return counts


def _table_html(counts: dict[str, int | str]) -> str:
    rows = "".join(f"<tr><td>{html.escape(key)}</td><td>{value}</td></tr>" for key, value in counts.items())
    return f"<table><tr><th>Tabelle</th><th>Datensätze</th></tr>{rows}</table>"


def _tail_errors(path: str | os.PathLike | None, limit: int) -> list[str]:
    if not path:
        return []
    file_path = Path(path)
    if not file_path.exists():
        return []
    lines = file_path.read_text(encoding="utf-8", errors="replace").splitlines()
    return [line for line in lines if " ERROR " in line or " WARNING " in line][-limit:]


def _format_duration(seconds: float) -> str:
    seconds = int(seconds)
    days, seconds = divmod(seconds, 86400)
    hours, seconds = divmod(seconds, 3600)
    minutes, seconds = divmod(seconds, 60)
    return f"{days}d {hours}h {minutes}m {seconds}s"


def _format_bytes(size: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024 or unit == "GB":
            return f"{size:.1f} {unit}" if unit != "B" else f"{size} B"
        size /= 1024
    return f"{size} B"


def _is_allowed_path(target: Path, root: Path) -> bool:
    try:
        target.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def _resolve_import_file(imports_dir: Path, filename: str) -> Path:
    filename = secure_filename(filename)
    target = (imports_dir / filename).resolve()
    if not filename or not _is_allowed_path(target, imports_dir.resolve()) or not target.is_file():
        abort(404)
    if target.resolve() == DB_PATH.resolve():
        abort(400)
    return target


def _preview_sqlite_import(source: Path) -> list[dict[str, Any]]:
    source_conn = sqlite3.connect(source)
    target_conn = sqlite3.connect(DB_PATH)
    try:
        source_conn.row_factory = sqlite3.Row
        target_conn.row_factory = sqlite3.Row
        tables = [
            row["name"]
            for row in source_conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        ]
        target_tables = {
            row["name"]
            for row in target_conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        }
        preview = []
        for table in tables:
            if table not in target_tables:
                continue
            source_count = source_conn.execute(f'SELECT COUNT(*) AS total FROM "{table}"').fetchone()["total"]
            target_count = target_conn.execute(f'SELECT COUNT(*) AS total FROM "{table}"').fetchone()["total"]
            conflicts = _count_id_conflicts(source_conn, target_conn, table)
            preview.append({"table": table, "source_count": source_count, "target_count": target_count, "conflicts": conflicts})
        return preview
    except sqlite3.Error:
        IMPORT_LOGS.appendleft(f"{time.strftime('%Y-%m-%d %H:%M:%S')} preview failed for {source.name}")
        abort(400, "Importdatei ist keine lesbare SQLite-Datenbank.")
    finally:
        source_conn.close()
        target_conn.close()


def _count_id_conflicts(source_conn, target_conn, table: str) -> int:
    source_columns = {row["name"] for row in source_conn.execute(f'PRAGMA table_info("{table}")')}
    target_columns = {row["name"] for row in target_conn.execute(f'PRAGMA table_info("{table}")')}
    if "id" not in source_columns or "id" not in target_columns:
        return 0
    source_ids = {row["id"] for row in source_conn.execute(f'SELECT id FROM "{table}" WHERE id IS NOT NULL')}
    if not source_ids:
        return 0
    placeholders = ",".join("?" for _ in source_ids)
    return target_conn.execute(f'SELECT COUNT(*) AS total FROM "{table}" WHERE id IN ({placeholders})', tuple(source_ids)).fetchone()["total"]


def _run_sqlite_import(source: Path, strategy: str) -> dict[str, Any]:
    preview = _preview_sqlite_import(source)
    if strategy == "abort" and any(row["conflicts"] for row in preview):
        return {"status": "aborted", "reason": "conflicts_detected", "tables": preview}
    source_conn = sqlite3.connect(source)
    target_conn = sqlite3.connect(DB_PATH)
    summary = {"status": "ok", "strategy": strategy, "tables": {}}
    try:
        source_conn.row_factory = sqlite3.Row
        target_conn.row_factory = sqlite3.Row
        target_conn.execute("PRAGMA foreign_keys = ON")
        for item in preview:
            table = item["table"]
            columns = [row["name"] for row in source_conn.execute(f'PRAGMA table_info("{table}")')]
            common = [col for col in columns if col in {r["name"] for r in target_conn.execute(f'PRAGMA table_info("{table}")')}]
            if not common:
                continue
            placeholders = ",".join("?" for _ in common)
            quoted = ",".join(f'"{col}"' for col in common)
            verb = "INSERT OR IGNORE" if strategy == "skip" else "INSERT OR REPLACE"
            inserted = 0
            for row in source_conn.execute(f'SELECT {quoted} FROM "{table}"'):
                target_conn.execute(f'{verb} INTO "{table}" ({quoted}) VALUES ({placeholders})', tuple(row[col] for col in common))
                inserted += 1
            summary["tables"][table] = {"seen": inserted, "conflicts": item["conflicts"]}
        target_conn.commit()
        return summary
    except sqlite3.Error as exc:
        target_conn.rollback()
        IMPORT_LOGS.appendleft(f"{time.strftime('%Y-%m-%d %H:%M:%S')} import failed for {source.name}: {exc.__class__.__name__}")
        return {"status": "error", "message": "Import konnte nicht abgeschlossen werden."}
    finally:
        source_conn.close()
        target_conn.close()
