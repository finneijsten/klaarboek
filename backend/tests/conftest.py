"""Test fixtures with mocked Supabase client."""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.auth import get_current_user


def _parse_in(raw: str) -> list[str]:
    s = raw.strip()
    if s.startswith("(") and s.endswith(")"):
        s = s[1:-1]
    return [p.strip() for p in s.split(",") if p.strip()]


class MockSupabaseClient:
    """In-memory mock of SupabaseClient for testing."""

    def __init__(self):
        self._tables: dict[str, list[dict]] = {}
        self._id_counter = 0

    def _next_id(self):
        self._id_counter += 1
        return self._id_counter

    async def select(self, table, columns="*", filters=None, order=None, limit=None, offset=0):
        rows = list(self._tables.get(table, []))
        if filters:
            for key, value in filters.items():
                if isinstance(value, dict):
                    for op, val in value.items():
                        if op == "gte":
                            rows = [r for r in rows if r.get(key, "") >= val]
                        elif op == "lt":
                            rows = [r for r in rows if r.get(key, "") < val]
                        elif op == "in":
                            ids = _parse_in(str(val))
                            rows = [r for r in rows if str(r.get(key)) in ids]
                else:
                    rows = [r for r in rows if r.get(key) == value]
        if order:
            # Minimal: respect first sort key direction.
            part = order.split(",")[0].strip()
            if "." in part:
                field, direction = part.split(".", 1)
            else:
                field, direction = part, "asc"
            rows.sort(key=lambda r: (r.get(field) is None, r.get(field)),
                      reverse=(direction.startswith("desc")))
        if offset:
            rows = rows[offset:]
        if limit:
            rows = rows[:limit]
        return rows

    async def insert(self, table, data):
        if table not in self._tables:
            self._tables[table] = []
        row = {"id": self._next_id(), **data}
        if "created_at" not in row:
            row["created_at"] = "2026-01-01T00:00:00+00:00"
        if table == "bank_connections" and "connected_at" not in row:
            row["connected_at"] = "2026-01-01T00:00:00+00:00"
        for field in ["kvk_number", "btw_number", "company_name", "matched_transaction_id",
                      "due_date", "classified_by", "description", "counterparty",
                      "category", "btw_rate", "external_id"]:
            if field not in row:
                row[field] = None
        if table == "transactions" and row.get("classified_by") is None:
            row["classified_by"] = "manual"
        if table == "transactions" and row.get("is_business") is None:
            row["is_business"] = True
        self._tables[table].append(row)
        return row

    async def update(self, table, filters, data):
        rows = self._tables.get(table, [])
        updated = []
        for row in rows:
            if all(row.get(k) == v for k, v in filters.items()):
                row.update(data)
                updated.append(row)
        return updated

    async def delete(self, table, filters):
        rows = self._tables.get(table, [])
        self._tables[table] = [
            r for r in rows
            if not all(r.get(k) == v for k, v in filters.items())
        ]

    async def rpc(self, function_name, params=None):
        return {}


MOCK_USER = {
    "id": 1,
    "email": "test@klaarboek.nl",
    "hashed_password": "hashed",
    "company_name": "Test BV",
    "kvk_number": "12345678",
    "btw_number": "NL123456789B01",
    "created_at": "2026-01-01T00:00:00+00:00",
}


@pytest.fixture
def mock_db():
    return MockSupabaseClient()


@pytest.fixture
def client(mock_db):
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


def seed_bank(mock_db, **kwargs):
    """Synchronously seed a bank_connection row in the mock DB."""
    mock_db._tables.setdefault("bank_connections", [])
    row = {
        "id": mock_db._next_id(),
        "user_id": 1,
        "bank_name": "ING",
        "iban": "NL91INGB0001234567",
        "is_active": True,
        "connected_at": "2026-01-01T00:00:00+00:00",
        **kwargs,
    }
    mock_db._tables["bank_connections"].append(row)
    return row
