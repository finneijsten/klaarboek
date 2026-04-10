"""GoCardless/Nordigen Open Banking API client for PSD2 bank sync."""
import httpx
from app.config import settings

NORDIGEN_BASE = "https://bankaccountdata.gocardless.com/api/v2"


class NordigenClient:
    """Client for the GoCardless Bank Account Data API (formerly Nordigen)."""

    def __init__(self):
        self._token: str | None = None

    async def _get_token(self) -> str:
        """Get or refresh access token."""
        if self._token:
            return self._token

        async with httpx.AsyncClient() as client:
            r = await client.post(f"{NORDIGEN_BASE}/token/new/", json={
                "secret_id": settings.nordigen_secret_id,
                "secret_key": settings.nordigen_secret_key,
            }, timeout=30)
            r.raise_for_status()
            self._token = r.json()["access"]
            return self._token

    async def _headers(self) -> dict:
        token = await self._get_token()
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async def list_institutions(self, country: str = "NL") -> list[dict]:
        """List available banks for a country."""
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{NORDIGEN_BASE}/institutions/",
                params={"country": country},
                headers=await self._headers(),
                timeout=30,
            )
            r.raise_for_status()
            return r.json()

    async def create_requisition(self, institution_id: str, redirect_url: str) -> dict:
        """Create a bank connection requisition (user needs to authorize via link)."""
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{NORDIGEN_BASE}/requisitions/",
                json={
                    "institution_id": institution_id,
                    "redirect": redirect_url,
                },
                headers=await self._headers(),
                timeout=30,
            )
            r.raise_for_status()
            return r.json()

    async def get_requisition(self, requisition_id: str) -> dict:
        """Get requisition status and linked accounts."""
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{NORDIGEN_BASE}/requisitions/{requisition_id}/",
                headers=await self._headers(),
                timeout=30,
            )
            r.raise_for_status()
            return r.json()

    async def get_account_details(self, account_id: str) -> dict:
        """Get account metadata (IBAN, name, etc.)."""
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{NORDIGEN_BASE}/accounts/{account_id}/details/",
                headers=await self._headers(),
                timeout=30,
            )
            r.raise_for_status()
            return r.json().get("account", {})

    async def get_transactions(self, account_id: str, date_from: str | None = None) -> list[dict]:
        """Fetch transactions for an account."""
        params = {}
        if date_from:
            params["date_from"] = date_from

        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{NORDIGEN_BASE}/accounts/{account_id}/transactions/",
                params=params,
                headers=await self._headers(),
                timeout=30,
            )
            r.raise_for_status()
            data = r.json()
            # Nordigen returns booked and pending
            booked = data.get("transactions", {}).get("booked", [])
            return booked


nordigen = NordigenClient()
