"""Test fixtures with mocked Supabase client."""
import pytest
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.auth import get_current_user


class MockSupabaseClient:
    """In-memory mock of SupabaseClient for testing."""

    def __init__(self):
        self._tables: dict[str, list[dict]] = {}
        self._id_counter = 0

    def _next_id(self):
        self._id_counter += 1
        return self._id_counter

    async def select(self, table, columns="*", filters=None, order=None, limit=None, offset=0):
        rows = self._tables.get(table, [])
        if filters:
            for key, value in filters.items():
                if isinstance(value, dict):
                    for op, val in value.items():
                        if op == "gte":
                            rows = [r for r in rows if r.get(key, "") >= val]
                        elif op == "lt":
                            rows = [r for r in rows if r.get(key, "") < val]
                else:
                    rows = [r for r in rows if r.get(key) == value]
        if limit:
            rows = rows[offset:offset + limit]
        return rows

    async def insert(self, table, data):
        if table not in self._tables:
            self._tables[table] = []
        row = {"id": self._next_id(), **data}
        if "created_at" not in row:
            row["created_at"] = "2026-01-01T00:00:00+00:00"
        if table == "bank_connections" and "connected_at" not in row:
            row["connected_at"] = "2026-01-01T00:00:00+00:00"
        # Default nullable fields
        for field in ["kvk_number", "btw_number", "company_name", "matched_transaction_id",
                      "due_date", "classified_by", "description", "counterparty",
                      "category", "btw_rate", "external_id"]:
            if field not in row:
                row[field] = None
        if table == "transactions" and row.get("classified_by") is None:
            row["classified_by"] = "manual"
        self._tables[table].append(row)
        return row

    async def update(self, table, filters, data):
        rows = self._tables.get(table, [])
        updated = []
        for row in rows:
            match = all(row.get(k) == v for k, v in filters.items())
            if match:
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
