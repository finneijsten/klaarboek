"""Tests for the transaction classifier."""
from app.classifier import classify_transaction


def test_classify_adobe():
    result = classify_transaction("Adobe CC monthly", "Adobe Systems")
    assert result["category"] == "Abonnementen"
    assert result["btw_rate"] == "21"
    assert result["is_business"] is True
    assert result["classified_by"] == "auto"


def test_classify_ns():
    result = classify_transaction("NS treinkaartje", "NS Reizigers")
    assert result["category"] == "Transport"
    assert result["btw_rate"] == "9"


def test_classify_supermarket():
    result = classify_transaction("Albert Heijn 1234", None)
    assert result["category"] == "Boodschappen"
    assert result["is_business"] is False


def test_classify_insurance():
    result = classify_transaction("AOV premie maart", "Nationale-Nederlanden")
    assert result["category"] == "Verzekeringen"
    assert result["btw_rate"] == "0"


def test_classify_unknown():
    result = classify_transaction("Random payment xyz", "Unknown Corp")
    assert result["category"] == "Overig"
    assert result["classified_by"] == "auto"


def test_classify_empty():
    result = classify_transaction(None, None)
    assert result["category"] is None
    assert result["classified_by"] == "manual"


def test_classify_github():
    result = classify_transaction("GitHub Pro subscription", None)
    assert result["category"] == "Abonnementen"
    assert result["is_business"] is True


def test_classify_marketing():
    result = classify_transaction("Google Ads payment", "Google")
    assert result["category"] == "Marketing"
