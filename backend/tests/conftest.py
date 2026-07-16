"""Test fixtures — isolated SQLite DB, fresh per session."""

import os
import sys
from pathlib import Path

# Ensure the backend root is importable (so `import main` works from anywhere).
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

# Configure a throwaway test DB + deterministic secret BEFORE importing the app.
_TEST_DB = BACKEND_ROOT / "_test_badgegen.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"
os.environ["JWT_SECRET"] = "test-secret"

if _TEST_DB.exists():
    _TEST_DB.unlink()

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # `with TestClient(...)` runs startup (init_db) and shutdown.
    with TestClient(main.app) as c:
        yield c
