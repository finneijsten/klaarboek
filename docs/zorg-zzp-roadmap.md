# KlaarBoek — Zorg-ZZP Roadmap (MVP → Paying Product)

**Laatst bijgewerkt:** 2026-04-16
**Status:** Live, pre-PMF. Gekozen niche: Zorg-ZZP (2026-04-15).
**Succes-drempel (4-6 mnd):** 30+ betalende Zorg-ZZP gebruikers @ €9,99/mo, <5% monthly churn.
**Mist-drempel:** <30 paying óf >5% churn → sunset KlaarBoek, focus naar Schadewijzer.

**Werkwijze:** Vink top-down af. Geen substap overslaan tenzij expliciet gemarkeerd als "optioneel". Bij twijfel: interviews opnieuw raadplegen (zie fase 0).

---

## Fase 0 — Validatie (2-3 weken) — GEEN CODE TOT 8+ INTERVIEWS GEDAAN

**Doel:** Bevestigen dat dé pijn rond zorgverzekeraar-declaraties / Vektis / NZa / BTW-vrijstelling zorgdiensten echt zo acuut is dat ze €9,99/mo willen betalen. En welke sub-vertical binnen zorg-ZZP het scherpst trekt.

### 0.1 Sub-vertical keuze

- [ ] Geralt-input verwerken over welke zorg-subgroep als eerste te targeten *(wacht op Discord-antwoord, zie MEMORY bij stappenplan)*
- [ ] Shortlist van 2 sub-verticals: primair + backup
- [ ] Per sub-vertical: marktomvang NL, beroepsvereniging(en), tarief-complexiteit, gemiddeld inkomen (bepaalt price sensitivity voor €9,99)
- [ ] Besluitdocument in `docs/sub-vertical-keuze.md` met 1 zin rationale

### 0.2 Interview-infrastructuur

- [ ] Interview-script schrijven rond:
  - Hoe doe je nu boekhouding? (welke tool, handmatig, boekhouder?)
  - Uren per maand kwijt aan administratie?
  - Biggest pain bij declaraties/Vektis/NZa/BTW?
  - Laatste keer iets misgelopen: wat was het, wat heeft het gekost?
  - Zou €9,99/mo betalen voor [oplossing X]? Waarom wel/niet?
  - Wie beïnvloedt jouw keuze (collega's, boekhouder, beroepsvereniging)?
- [ ] 15 interview-prospects verzamelen:
  - [ ] 5 via beroepsvereniging-Facebook/LinkedIn (KNGF, NVLF, NVD, NIP, V&VN)
  - [ ] 5 via ZZP-Zorg Facebook-groep + NVZ (Nederlandse Vereniging Zelfstandigen)
  - [ ] 5 via directe LinkedIn-outreach op beroeptitel
- [ ] Warm outreach-template: geen pitch, alleen "20 min gesprek, leer van jouw praktijk, geen verkoop"
- [ ] Calendly/Cal.com link — 30 min slots
- [ ] Interview-template in Notion/doc voor notities

### 0.3 Interviews uitvoeren

- [ ] Interview 1-3 (week 1) — bepaal of pijn-hypothese klopt
- [ ] Review na 3: aanpassen script als pijn ergens anders blijkt te zitten
- [ ] Interview 4-8 (week 2)
- [ ] **Beslis-moment na 8**: pijn bevestigd? Ga door. Niet? Stop en re-assess.
- [ ] Interview 9-15 (week 3) — patroon-bevestiging + feature-prio signalen

### 0.4 Landing page `/zorg` variant

- [ ] Copy-draft: hero richt zich specifiek op gekozen sub-vertical met hun eigen taal (bv. "Declareren bij zorgverzekeraars zonder gedoe" i.p.v. generieke ZZP-copy)
- [ ] Pain-list section met 3-5 concrete voorbeelden uit interviews (anoniem quoten mag)
- [ ] "Waarom niet Moneybird/e-Boekhouden?" comparison-section (Moneybird doet geen zorg-specifieke workflows)
- [ ] Email-capture formulier: "Krijg als eerste toegang" → waitlist tabel
- [ ] Deploy op `klaarboek.vercel.app/zorg`
- [ ] A/B tegen generieke landing (of: verwijs alle zorg-outreach naar `/zorg` en meet conversie)

### 0.5 Validatie-exit-criteria

- [ ] 15 interviews done
- [ ] ≥10 van 15 bevestigen dé hoofdpijn
- [ ] ≥7 zeggen "ja, zou €9,99/mo betalen als X werkt"
- [ ] Waitlist op `/zorg` heeft ≥30 signups (gekochte traffic mag)
- [ ] 1 duidelijke sub-vertical als winner

**Alleen doorgaan naar Fase 1 als alle 5 bullets groen.** Bij twijfel: extra interviews of pivot binnen zorg.

---

## Fase 1 — Niche MVP (3-4 weken) — CODE START

**Doel:** KlaarBoek-UI en flows specifiek maken voor de gekozen zorg-sub-vertical, en die pre-paying users daarin binnenhalen.

### 1.1 Feature-scope bepalen

- [ ] Top 3 pijnpunten uit interviews → 3 features die op launch moeten werken
- [ ] Alles wat er niet bij hoort: **expliciet** in `docs/not-in-v1.md` zodat er geen scope creep komt
- [ ] Geralt's input over launch-critical vs. "kan 3 mnd later" verwerken *(wacht op Discord-antwoord)*

### 1.2 Code-werk

- [ ] Landing `/zorg` → full niche-landing (niet meer variant)
- [ ] Onboarding-flow aanpassen: eerste scherm vraagt beroeptitel i.p.v. generieke "ZZP"
- [ ] Transactie-categorieën: zorg-specifieke categorieën toevoegen (declaratie-ontvangsten, Vektis-terugboekingen, praktijkkosten-subtypen)
- [ ] BTW-handling: BTW-vrijgestelde zorgdiensten correct afhandelen (art. 11 lid 1 onder g Wet OB) — geen BTW op factuur, wel BTW aftrekbaar op praktijkkosten
- [ ] Factuur-template: specifieke layout met AGB-code, BIG-nummer-veld, vrijstellingsclausule
- [ ] Dashboard: declaratie-overzicht zorgverzekeraars (openstaand, geweigerd, uitbetaald)
- [ ] Demo-data: vul met realistische zorg-ZZP transacties zodat demo-login overtuigt

### 1.3 Zorg-specifieke logica

- [ ] Vektis-code lookup tabel (of API als bestaat)
- [ ] NZa-tarief-referentie per prestatiecode (jaarlijkse update nodig — noteer als tech-debt)
- [ ] BTW-vrijstelling detectie: transactie-type + counterparty → auto-flag als vrijgestelde dienst
- [ ] Ruling: iedere niet-zorgdienst (bv. verkoop van tape, producten) krijgt wél 21% BTW — moet handmatig markeerbaar zijn

### 1.4 QA

- [ ] 5 testcases per feature met realistische zorg-data
- [ ] Handmatige walk-through van onboarding → eerste factuur → BTW-export, timer erbij, target <10 min
- [ ] 3 interview-prospects uit Fase 0 vragen om beta-test (gratis 3 mnd)

---

## Fase 2 — Paying V1 (4-6 weken) — GELD BINNENKRIJGEN

**Doel:** Eerste 10 betalende klanten. Focus op activatie + betaling, geen premature optimalisatie.

### 2.1 Betaalflow

- [ ] Mollie-account aanmaken (NL-vriendelijk, iDEAL support, lagere fees dan Stripe voor NL-markt)
- [ ] Subscription-endpoint in backend: `POST /subscribe`, `POST /cancel`, webhook voor `payment.succeeded` en `payment.failed`
- [ ] UI: paywall na 14 dagen trial of na X acties (bv. na 3e factuur of 2e maand)
- [ ] Factuur-voor-factuur: KlaarBoek moet zelf BTW-plichtige facturen sturen aan users (21%) — kip-en-ei, maak de eerste handmatig voordat het geautomatiseerd is
- [ ] Cancel-flow: in 2 kliks, geen weerstand, gratis export van alle data

### 2.2 Onboarding → activatie

- [ ] Welcome-email sequence (4 mails in 7 dagen): dag 0 welkom + quick-start, dag 2 "heb je al je eerste factuur gemaakt?", dag 5 "vragen?", dag 7 "hoe bevalt het"
- [ ] In-app tour (Intro.js of eigen): 5 stappen door de kernfeatures
- [ ] "Eerste factuur maken" als expliciet dashboard-doel met voortgangsindicator
- [ ] Drop-off detectie: users die na 3 dagen nog geen factuur hebben → triggered email

### 2.3 Bank-integratie (lean)

- [ ] CSV-upload van bankafschriften (ING, Rabo, ABN, Bunq, Knab, Revolut) — **geen** Nordigen PSD2 in V1
- [ ] Parse + dedupe op external_id
- [ ] Auto-categorisatie (bestaande AI) + handmatige override
- [ ] Noteer als tech-debt: Nordigen later (Fase 4)

### 2.4 BTW-rapport

- [ ] Per kwartaal PDF met alle cijfers die de user zelf op belastingdienst.nl kan invullen
- [ ] **Niet** SBR/Digipoort filing — dat is Fase 4, vereist e-Herkenning + PKI certs + maanden werk
- [ ] Duidelijke disclaimer: "KlaarBoek levert het rapport, jij doet zelf de aangifte — voor directe filing zie [roadmap]"

### 2.5 Prijs-test

- [ ] Start op €9,99/mo zoals afgesproken
- [ ] Beta-users (Fase 1) krijgen 50% voor eerste 6 mnd als referral-incentive
- [ ] Na maand 1: 3 users vragen "had je meer willen betalen?" — signal voor prijsverhoging later

### 2.6 Support-flow

- [ ] Helpscout of Crisp live-chat in-app
- [ ] FAQ met 15 meest-gestelde vragen uit interviews
- [ ] Email `support@klaarboek.nl` → actief monitoren, target <4u response werkdagen
- [ ] Bug-tracker: Linear of GitHub Issues, niet in hoofd

---

## Fase 3 — Acquisitie (doorlopend vanaf Fase 1)

**Doel:** Kost-efficiënt 30+ betalende klanten in 4-6 mnd. Geralt-input over kanalen verwachten we hier.

### 3.1 Content-as-acquisition

- [ ] Blog-sectie op klaarboek.nl (of subdomein)
- [ ] 10 artikelen voor SEO, allemaal long-tail zorg-ZZP keywords:
  - "BTW-vrijstelling [sub-vertical] 2026 uitleg"
  - "Hoe declareer ik bij Zilveren Kruis als zelfstandig [beroep]"
  - "[Beroep] en Moneybird — werkt het?"
  - "Vektis-codes [sub-vertical] cheatsheet"
  - "Praktijkonkosten aftrekbaar voor [beroep] — checklist"
- [ ] Google Search Console opzetten, monitoren wat ranked
- [ ] Interne links tussen blog → landing `/zorg`

### 3.2 Paid (klein en meetbaar)

- [ ] Google Ads: €150 budget per maand
  - Keyword-set: "[beroep] boekhoudprogramma", "declaratie software zorg", "boekhouden [sub-vertical]"
  - Negative keywords: "gratis", "cursus", "opleiding"
  - Conversie-tracking op signup + op paid-conversion
  - Kill campagne als CAC > €50 na 30 dagen
- [ ] Instagram/Facebook Ads: €200/mnd
  - Doelgroep: ZZP'ers in zorg, 25-45, NL
  - Creatives: 2-3 short videos van interviewpijnen ("Ik verloor 8 uur aan declaraties vorige week")
- [ ] LinkedIn-ads (duurder): €100 eerst, alleen als Google+Meta onvoldoende schaal geeft

### 3.3 Community + partnerships

- [ ] Beroepsvereniging-partnerships: KNGF/NVLF/NVD/NIP/V&VN → ledenkorting in ruil voor vermelding in nieuwsbrief
- [ ] ZZP-Zorg Facebook-groep: waardevolle posts (niet pitchen), na vertrouwen opbouwen zachte call-to-action
- [ ] Podcast-interviews: "Praktijk Perfect", "De Zelfstandige Zorgverlener", andere nichepodcasts → Finn vertelt eigen verhaal
- [ ] Geralt-input verwerken over specifieke kanalen die werken *(wacht op Discord-antwoord)*

### 3.4 Referral

- [ ] In-app referral: "Nodig een collega uit, krijg 1 mnd gratis"
- [ ] Unieke referral-link per user
- [ ] Tracking in DB (wie heeft wie gebracht)
- [ ] Budget: €350 zoals in marketing plan

### 3.5 Cold outreach (laatste redmiddel)

- [ ] LinkedIn Sales Navigator of gewoon manueel
- [ ] Max 10 berichten/dag, gepersonaliseerd
- [ ] Script: "Ik interview zorg-ZZP'ers over [sub-vertical] admin, 20 min zou waardevol zijn"
- [ ] Alleen als inbound stokt

---

## Fase 4 — Schaal (3-6 mnd na eerste paying customer)

**Doel:** Van 30 naar 300 paying. Automatiseren wat handmatig was. Pas instappen als Fase 2 staat.

### 4.1 Nordigen/GoCardless PSD2

- [ ] Nordigen-account + Enable Banking integratie
- [ ] Bank-linking OAuth-flow in settings
- [ ] Auto-sync dagelijks
- [ ] Migration-pad voor users die nu CSV uploaden (optie om over te stappen)
- [ ] Kosten-check: Nordigen is gratis <100 users, daarna €X/acct/mnd — pricing recalibreren

### 4.2 BTW SBR/Digipoort filing

- [ ] E-Herkenning EH3 aanvragen (duurt 4-6 weken, €40/jr)
- [ ] PKIoverheid certificaat (duurt 2-4 weken, €100-200/jr)
- [ ] Digipoort test-omgeving toegang
- [ ] Implementatie SBR Nexus library (Python)
- [ ] Test-aangifte op pre-prod, accountant-review
- [ ] Pas LIVE na 3 succesvolle test-runs
- [ ] Feature verkopen als add-on of premium-tier (+€5/mo?)

### 4.3 Sub-vertical expansion

- [ ] Als primaire sub-vertical >50 paying: tweede vertical toevoegen
- [ ] Zelfde Fase 0 → Fase 2 loop, maar nu met bewezen template
- [ ] Tech-architectuur: sub-vertical-specifieke logica in `/verticals/<naam>/` module, plugin-stijl

### 4.4 Automatisering

- [ ] Declaratie-scraping zorgverzekeraar-portals (als dit kan binnen TOS)
- [ ] Of: partnership met Vektis voor directe feed
- [ ] Herinneringen voor openstaande facturen (auto-email)
- [ ] Jaarafsluiting-wizard

### 4.5 B2B2C overweging

- [ ] Als Zorg-ZZP product werkt: boekhouders die zorg-ZZP'ers bedienen benaderen
- [ ] Multi-tenant dashboard voor kantoren
- [ ] White-label optie
- [ ] Prijs: €5/user/mo bulk, target >50 users per kantoor
- [ ] **Alleen starten na eerste 30 B2C paying** (mist betekent sunset, niet pivot)

---

## Fase 5 — Business operations (parallel vanaf Fase 2)

**Doel:** KlaarBoek als legitiem bedrijf, niet een zij-project.

### 5.1 Juridisch

- [ ] KvK-inschrijving (als eenmanszaak of BV — BV pas als investering nodig)
- [ ] BTW-ID bij belastingdienst
- [ ] Algemene voorwaarden opstellen (laten checken door Legal, bv. Klappr of FlexApp)
- [ ] Privacy policy GDPR-compliant — extra streng voor zorg-data, mogelijk AVG-DPIA nodig
- [ ] Verwerkersovereenkomst-template voor users die dat vragen
- [ ] Cookie-banner + consent-log
- [ ] SOC 2 / ISO 27001: te duur voor nu, maar later marketable

### 5.2 Financieel

- [ ] Zakelijke bankrekening (Bunq/Knab voor ZZP voordelig)
- [ ] Boekhouding van KlaarBoek zelf (dogfood: gebruik KlaarBoek hiervoor, los bugs snel)
- [ ] Stripe/Mollie-verkoop-admin
- [ ] Prognose sheet: maandelijks MRR-doel, CAC-budget, runway

### 5.3 Security / compliance

- [ ] Hash algorithm van passwords checken (bcrypt rounds voldoende)
- [ ] Rate-limiting op /auth endpoints
- [ ] 2FA voor admin-accounts
- [ ] Logging: wie accessed welke data wanneer (audit-trail) — belangrijk voor zorg-compliance
- [ ] Backup-strategie Supabase (point-in-time recovery activeren)
- [ ] Penetratietest voor live: Hackademy of iets laagdrempeligs

### 5.4 Analytics + observability

- [ ] GA4 correct inregelen met events (signup, paid_conversion, feature_usage)
- [ ] PostHog of Plausible voor product-analytics
- [ ] Sentry voor error-tracking
- [ ] Uptime-monitoring: UptimeRobot of Better Stack

### 5.5 Support-schaal

- [ ] FAQ uitgroeien naar help-center (≥50 artikelen bij 50 paying)
- [ ] Template-antwoorden voor top 20 vragen
- [ ] Eventueel: VA inhuren voor support (€15-20/u, 10u/wk)

---

## Beslis-momenten (niet overslaan)

- **Na Fase 0.5 (week 3)**: pijn bevestigd? Ga door, anders STOP of pivot binnen zorg.
- **Na 8 interviews (week 2)**: hypothese-check — nog steeds goed, of aanpassen?
- **Na Fase 2.1 launch (maand 2-3)**: eerste 3 paying binnen? Zo niet: acquisitie-kanaal re-evalueren.
- **Na 3 maanden Fase 3**: traject naar 30 paying zichtbaar? Zo niet: prijs/message/niche re-check.
- **Na 6 maanden**: succes-drempel gehaald? Ja → Fase 4. Nee → sunset of hard pivot.

---

## Afhankelijkheden / externe blokkers

- E-Herkenning EH3 aanvragen vóór Fase 4 start (4-6 weken lead time) — begin dit al in Fase 2
- PKIoverheid certs: idem, 2-4 weken
- Beroepsvereniging-partnership: lange sales-cycle (maanden) — start gesprekken in Fase 0 al
- Zorgverzekeraar-data: onduidelijk welke APIs bestaan, onderzoeken in Fase 1

---

## Vindbaarheid

- **Dit document:** `docs/zorg-zzp-roadmap.md` in de klaarboek repo
- **Memory-pointer:** zie `project_klaarboek_roadmap.md` in Claude's auto-memory
- **Commit-history:** elke belangrijke update commit'en met `docs(roadmap): ...` prefix
