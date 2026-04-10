"""Rule-based transaction classifier for Dutch ZZP bookkeeping."""

# Keyword → (category, btw_rate, is_business)
RULES: list[tuple[list[str], str, str, bool]] = [
    # Income
    (["factuur", "betaling ontvangen", "inkomende betaling"], "Omzet", "21", True),

    # Office & workspace
    (["kantoor", "office", "bureau", "werkplek"], "Kantoor", "21", True),
    (["huur kantoor", "werkruimte"], "Huisvesting", "21", True),

    # Software & subscriptions
    (["spotify", "netflix", "youtube premium"], "Abonnementen", "21", False),
    (["adobe", "figma", "github", "notion", "slack", "zoom", "microsoft", "google workspace",
      "dropbox", "aws", "azure", "heroku", "vercel", "railway", "supabase", "openai", "anthropic",
      "chatgpt", "copilot"], "Abonnementen", "21", True),
    (["hosting", "domein", "domain", "ssl", "server"], "Abonnementen", "21", True),

    # Transport
    (["ns ", "ov-chipkaart", "ovchipkaart", "trein", "bus", "tram", "metro"], "Transport", "9", True),
    (["shell", "bp ", "esso", "total", "tankstation", "benzine", "diesel"], "Transport", "21", True),
    (["uber", "bolt", "taxi"], "Transport", "9", True),
    (["parking", "parkeer", "q-park"], "Transport", "21", True),

    # Food (usually not deductible unless business)
    (["albert heijn", "jumbo", "lidl", "aldi", "plus ", "dirk", "supermarkt"], "Boodschappen", "9", False),
    (["restaurant", "eetcafe", "cafe", "lunch", "diner", "uber eats", "thuisbezorgd", "deliveroo"],
     "Horeca", "9", False),

    # Insurance
    (["verzekering", "insurance", "zorgverzekering", "aov ", "beroepsaansprakelijkheid"],
     "Verzekeringen", "0", True),

    # Banking & finance
    (["rente", "interest", "bankkosten", "transactiekosten"], "Bankkosten", "0", True),

    # Marketing
    (["facebook ads", "meta ads", "google ads", "linkedin ads", "marketing", "advertentie", "reclame",
      "drukwerk", "flyers", "visitekaart"], "Marketing", "21", True),

    # Hardware & materials
    (["coolblue", "bol.com", "mediamarkt", "alternate", "amazon"], "Materiaal", "21", True),

    # Professional services
    (["accountant", "boekhouder", "belastingadviseur", "notaris", "advocaat", "juridisch"],
     "Professionele diensten", "21", True),

    # Telecom
    (["kpn", "vodafone", "t-mobile", "tele2", "ziggo", "telefoon", "internet", "mobiel"],
     "Telecom", "21", True),

    # Education & books
    (["cursus", "training", "workshop", "boek", "udemy", "coursera"], "Opleiding", "21", True),
]


def classify_transaction(description: str | None, counterparty: str | None) -> dict:
    """Classify a transaction based on description and counterparty keywords.

    Returns dict with category, btw_rate, is_business, classified_by.
    """
    text = f"{description or ''} {counterparty or ''}".lower().strip()

    if not text:
        return {"category": None, "btw_rate": None, "is_business": True, "classified_by": "manual"}

    for keywords, category, btw_rate, is_business in RULES:
        for keyword in keywords:
            if keyword in text:
                return {
                    "category": category,
                    "btw_rate": btw_rate,
                    "is_business": is_business,
                    "classified_by": "auto",
                }

    return {"category": "Overig", "btw_rate": "21", "is_business": True, "classified_by": "auto"}
