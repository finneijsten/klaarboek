"""Supabase REST API client — replaces direct SQLAlchemy connection."""
import httpx
from app.config import settings


class SupabaseClient:
    """Lightweight Supabase PostgREST client using httpx."""

    def __init__(self):
        self.base_url = f"{settings.supabase_url}/rest/v1"
        self.headers = {
            "apikey": settings.supabase_service_key,
            "Authorization": f"Bearer {settings.supabase_service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    async def select(self, table: str, columns: str = "*", filters: dict | None = None,
                     order: str | None = None, limit: int | None = None, offset: int = 0) -> list[dict]:
        """SELECT from a table with optional filters."""
        params = {"select": columns}
        url = f"{self.base_url}/{table}"

        # Build filter query params
        filter_headers = dict(self.headers)
        query_parts = []
        if filters:
            for key, value in filters.items():
                if isinstance(value, dict):
                    for op, val in value.items():
                        query_parts.append(f"{key}={op}.{val}")
                else:
                    query_parts.append(f"{key}=eq.{value}")

        if order:
            params["order"] = order
        if limit:
            params["limit"] = str(limit)
        if offset:
            params["offset"] = str(offset)

        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        if query_parts:
            query_string += "&" + "&".join(query_parts)

        async with httpx.AsyncClient() as client:
            r = await client.get(f"{url}?{query_string}", headers=filter_headers, timeout=30)
            r.raise_for_status()
            return r.json()

    async def insert(self, table: str, data: dict) -> dict:
        """INSERT a row and return it."""
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self.base_url}/{table}",
                json=data,
                headers=self.headers,
                timeout=30,
            )
            r.raise_for_status()
            result = r.json()
            return result[0] if isinstance(result, list) else result

    async def update(self, table: str, filters: dict, data: dict) -> list[dict]:
        """UPDATE rows matching filters."""
        url = f"{self.base_url}/{table}"
        filter_parts = [f"{k}=eq.{v}" for k, v in filters.items()]
        query = "&".join(filter_parts)

        async with httpx.AsyncClient() as client:
            r = await client.patch(
                f"{url}?{query}",
                json=data,
                headers=self.headers,
                timeout=30,
            )
            r.raise_for_status()
            return r.json()

    async def delete(self, table: str, filters: dict) -> None:
        """DELETE rows matching filters."""
        url = f"{self.base_url}/{table}"
        filter_parts = [f"{k}=eq.{v}" for k, v in filters.items()]
        query = "&".join(filter_parts)

        async with httpx.AsyncClient() as client:
            r = await client.delete(f"{url}?{query}", headers=self.headers, timeout=30)
            r.raise_for_status()

    async def rpc(self, function_name: str, params: dict | None = None) -> any:
        """Call a Postgres function via RPC."""
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self.base_url}/rpc/{function_name}",
                json=params or {},
                headers=self.headers,
                timeout=30,
            )
            r.raise_for_status()
            return r.json()


# Singleton
db = SupabaseClient()


def get_db() -> SupabaseClient:
    return db
