# KlaarBoek — Technical Architecture

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, fast, great DX |
| Backend | FastAPI (Python) | ML-ready for transaction classification |
| Database | PostgreSQL + Prisma | Solid, relational, audit-friendly |
| Bank Sync | Nordigen (GoCardless) | PSD2-compliant, NL banks covered |
| Auth | Auth.js | Simple, proven |
| Hosting | Vercel (FE) + Railway (BE) | Fast to deploy, cheap to start |
| BTW Filing | Belastingdienst e-Herkenning API | Required for real filing |

## Architecture Overview

```
[User Browser]
      |
      v
[Next.js Frontend — Vercel]
      |
      v
[FastAPI Backend — Railway]
      |
      ├── [PostgreSQL Database]
      ├── [Nordigen Bank API — PSD2]
      ├── [ML Transaction Classifier]
      └── [Belastingdienst API — BTW]
```

## Core Modules

### 1. Bank Connection (PSD2)
- Nordigen/GoCardless for Open Banking
- Supports all major Dutch banks (ING, Rabobank, ABN AMRO, etc.)
- Automatic daily transaction sync

### 2. Transaction Classification
- AI-powered categorization (business vs. personal)
- Expense type detection (travel, office, equipment, etc.)
- BTW rate assignment (21%, 9%, 0%, exempt)
- User corrections feed back into the model

### 3. BTW Engine
- Automatic quarterly BTW calculation
- Pre-filled BTW-aangifte ready for submission
- Integration with Belastingdienst via e-Herkenning

### 4. Invoice Module
- Create and send professional invoices
- Automatic payment matching with bank transactions
- Overdue payment reminders

### 5. Dashboard
- Real-time income/expense overview
- Profit & loss
- BTW liability tracker
- Year-end summary for IB-aangifte preparation

## Data Model (Core)

```
User
  ├── BankConnection (1:N)
  │     └── Transaction (1:N)
  │           ├── category
  │           ├── btw_rate
  │           └── is_business
  ├── Invoice (1:N)
  │     └── PaymentMatch (1:1 → Transaction)
  └── BTWDeclaration (1:N)
        └── quarter, year, amount, status
```

## Security

- All bank connections via PSD2 (read-only, no payment initiation)
- Data encrypted at rest and in transit
- GDPR compliant — user data deletion on request
- No storage of bank credentials (handled by Nordigen)

## MVP Scope (v1)

1. Bank connection + transaction import
2. Manual + AI-assisted transaction classification
3. BTW calculation + export
4. Basic dashboard

## Future (v2+)

- Automated BTW filing via Belastingdienst API
- Invoice creation and payment matching
- Subsidy automation for SMEs
- Multi-user / accountant access
- Mobile app
