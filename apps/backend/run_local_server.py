from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the local HWM backend.")
    parser.add_argument("--server-home", help="Writable HWM server data directory.")
    parser.add_argument("--api-host", default="0.0.0.0")
    parser.add_argument("--api-port", type=int, default=5000)
    parser.add_argument("--panel-host", default="127.0.0.1")
    parser.add_argument("--panel-port", type=int, default=5050)
    parser.add_argument("--init-only", action="store_true")
    parser.add_argument("--debug", action="store_true")
    return parser.parse_args()


def configure_environment(args: argparse.Namespace) -> Path:
    backend_dir = Path(__file__).resolve().parent
    server_home = Path(args.server_home).resolve() if args.server_home else backend_dir
    os.environ["HWM_SERVER_HOME"] = str(server_home)
    os.environ["HWM_LOG_FILE"] = str(server_home / "logs" / "hwm-backend.log")
    os.environ.setdefault("FLASK_DEBUG", "1" if args.debug else "0")
    os.environ.setdefault("HWM_DEBUG_MODE", "0")
    return server_home


def ensure_server_storage(server_home: Path) -> dict:
    for name in ("backend", "data", "logs", "imports", "exports", "backups", "config", "runtime"):
        (server_home / name).mkdir(parents=True, exist_ok=True)

    from db import DB_PATH, init_db, quick_check

    init_db()
    result = quick_check()
    result["server_home"] = str(server_home)
    result["created"] = DB_PATH.exists()
    return result


def run_waitress(app, host: str, port: int) -> None:
    from waitress import serve

    serve(app, host=host, port=port)


def main() -> int:
    args = parse_args()
    if args.panel_host not in {"127.0.0.1", "localhost", "::1"}:
        print("Refusing to bind local panel to a non-local host.", file=sys.stderr)
        return 2

    server_home = configure_environment(args)
    init_result = ensure_server_storage(server_home)
    if args.init_only:
        print(json.dumps(init_result, indent=2, ensure_ascii=False))
        return 0 if init_result.get("ok") else 1

    from app import app

    if args.debug:
        app.run(host=args.api_host, port=args.api_port, debug=True)
        return 0

    if args.panel_port != args.api_port or args.panel_host != args.api_host:
        import threading

        panel_thread = threading.Thread(
            target=run_waitress,
            args=(app, args.panel_host, args.panel_port),
            name="hwm-panel-server",
            daemon=True,
        )
        panel_thread.start()

    run_waitress(app, args.api_host, args.api_port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
