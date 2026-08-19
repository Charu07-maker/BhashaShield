"""Deterministic tests for the rule engine and language detection — these
pass with or without a trained classifier present, so `pytest` works right
after cloning the repo, before anyone has run the training scripts."""

from app.services.language import detect_language
from app.services.rules import find_first_url, run_rule_engine


def test_detect_language_hindi():
    assert detect_language("आपका खाता बंद हो जाएगा") == "Hindi"


def test_detect_language_english():
    assert detect_language("Your account will be blocked") == "English"


def test_detect_language_bengali():
    assert detect_language("আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে") == "Bengali"


def test_rule_engine_flags_otp_request():
    result = run_rule_engine("Please share your OTP immediately", "en")
    matched_ids = {r.id for r in result.matched_rules}
    assert "requests_otp" in matched_ids
    assert "artificial_urgency" in matched_ids
    assert result.score > 0


def test_rule_engine_safe_message_scores_zero():
    result = run_rule_engine("Hey, are we still on for dinner tonight?", "en")
    assert result.score == 0
    assert result.matched_rules == []


def test_rule_engine_hindi_patterns():
    result = run_rule_engine("तुरंत अपना OTP भेजें वरना गिरफ्तार हो जाओगे", "hi")
    matched_ids = {r.id for r in result.matched_rules}
    assert "requests_otp" in matched_ids
    assert "impersonates_law_enforcement" in matched_ids


def test_find_first_url():
    assert find_first_url("check this: sbi-kyc-update.info/verify now") == "sbi-kyc-update.info/verify"
    assert find_first_url("no links here at all") is None
