# KlaarBoek — MVP Roadmap

## Top 5 Features (Priority Order)

### 1. Bank Import + Auto-Categorization
**Priority: CRITICAL — Core value prop**
- Connect to bank API via Nordigen/GoCardless (PSD2)
- Parse and import transactions automatically
- Keyword-based classification (business vs. personal, expense types)
- BTW rate assignment per transaction
- User corrections feed back into the model

### 2. BTW Calculation Engine
**Priority: HIGH — The thing users dread most**
- Auto-calculate 21% / 9% / 0% / exempt per transaction
- Generate quarterly BTW-aangifte summary
- Pre-filled form ready for submission to Belastingdienst
- Running BTW liability tracker

### 3. Auth + User Onboarding
**Priority: HIGH — Nothing works without it**
- Auth.js integration
- KvK number input + validation
- BTW number registration
- Fiscal year setup
- Bank connection wizard (Nordigen OAuth flow)

### 4. Dashboard
**Priority: MEDIUM — The "10-second overview"**
- Income vs. expenses (current month + YTD)
- BTW owed this quarter
- Year-to-date profit/loss
- One screen, no clutter
- ZZP'ers need to see their situation in 10 seconds

### 5. PDF Invoice Generator
**Priority: MEDIUM — Essential for daily operations**
- Create professional invoices
- Auto-numbering
- Custom logo upload
- Legally compliant Dutch invoice format
- Auto-match payments when they arrive via bank sync

## Out of Scope (v2+)
- Automated BTW filing via Belastingdienst API
- Accountant portal / multi-user access
- Mobile app
- Subsidy automation
- Belgium expansion
- Payment matching and reminders

## Proposed by
- **KevlarD Prime** — Technical lead
- **Terminator** — Project coordination
