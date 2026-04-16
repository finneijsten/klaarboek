# KlaarBoek

**Eenvoudige boekhouding voor Nederlandse ZZP'ers.**

KlaarBoek helpt ZZP'ers hun administratie zelf doen zonder dure boekhouder: bank-CSV importeren, transacties automatisch categoriseren, BTW-rapport per kwartaal, en facturen.

## Status

Alpha. Live deploy op Vercel (zowel frontend als FastAPI backend via serverless).
Niche-pivot naar Zorg-ZZP staat in `docs/zorg-zzp-roadmap.md`; zie daar het afgesproken plan en beslis-momenten.

## Stack

| Laag | Keuze |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind |
| Backend | FastAPI + httpx tegen Supabase PostgREST |
| Database | Supabase (Postgres) — schema in `backend/db/migrations/` |
| Auth | JWT met bcrypt |
| PDF | ReportLab |
| Hosting | Vercel (FE + BE als serverless) |

## Werkende functionaliteit

- Registratie / login / profiel
- Bankrekeningen handmatig koppelen (IBAN-validatie met ISO 7064 mod-97)
- **CSV-import** voor ING, Rabobank, ABN AMRO, Bunq, Knab, Revolut
- Regel-gebaseerde categorisatie + BTW-tarief toewijzing
- Facturen: aanmaken, bewerken, verwijderen, PDF-download
- BTW-berekening per kwartaal + opslaan als concept-aangifte
- Waitlist-endpoint voor marketing
- Dashboard met inkomsten/uitgaven/winst/BTW

## Nog niet af

Zie `docs/zorg-zzp-roadmap.md` voor het volledige plan. Grootste ontbrekende stukken:

- Mollie / paywall / subscription flow
- Nordigen PSD2 bank-sync (code bestaat maar is feature-flagged uit)
- SBR/Digipoort BTW-filing (Fase 4)
- Zorg-vertical specifieke workflows (Fase 1)

## Lokaal draaien

Backend:
```sh
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # vul SUPABASE_* en SECRET_KEY in
uvicorn app.main:app --reload
```

Frontend:
```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Database schema: zie `backend/db/README.md`.

## Licentie

MIT
