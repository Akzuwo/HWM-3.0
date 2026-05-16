"""Central configuration helpers for the Homework Manager backend."""

from __future__ import annotations

import os
import logging
from pathlib import Path
from typing import Any, Dict

try:
    from dotenv import dotenv_values, load_dotenv
except ImportError:  # pragma: no cover - production images may inject env directly
    dotenv_values = None
    load_dotenv = None


logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parent
ENV_FILE = BACKEND_DIR / ".env"


def _load_backend_env() -> None:
    """Load apps/backend/.env independently from the process working directory."""

    env_exists = ENV_FILE.exists()
    logger.info("Loading backend .env from %s (exists=%s)", ENV_FILE, env_exists)

    if load_dotenv is None or dotenv_values is None:
        if env_exists:
            raise RuntimeError(
                "python-dotenv is required to load apps/backend/.env. "
                "Install backend dependencies with: pip install -r apps/backend/requirements.txt"
            )
        return

    load_dotenv(dotenv_path=ENV_FILE, override=False)

    # python-dotenv intentionally does not override existing process variables.
    # Empty shell variables should not mask real values from apps/backend/.env.
    for key, value in dotenv_values(ENV_FILE).items():
        if value is not None and os.environ.get(key, "") == "":
            os.environ[key] = value


_load_backend_env()


def _require_env(key: str) -> str:
    value = os.environ.get(key)
    if value is None or value == "":
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value


def _optional_env(key: str) -> str | None:
    value = os.environ.get(key)
    if value is None or value == "":
        return None
    return value


def get_contact_smtp_settings() -> Dict[str, Any]:
    """Return SMTP settings for the optional support mailer from environment variables."""

    host = _require_env("CONTACT_SMTP_HOST")
    user = _optional_env("CONTACT_SMTP_USER")
    password = _optional_env("CONTACT_SMTP_PASSWORD")
    recipient = _optional_env("CONTACT_RECIPIENT") or user
    from_address = _optional_env("CONTACT_FROM_ADDRESS") or user or recipient

    return {
        "host": host,
        "user": user,
        "password": password,
        "recipient": recipient,
        "from_address": from_address,
    }
