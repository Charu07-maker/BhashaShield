"""Tests spam/ham judgment through the FULL pipeline (analyze_text — rule
engine + classifier together) for the 5 languages this product is strictly
scoped to: English, Hindi, Bengali, Punjabi, Marathi. Skipped automatically
if models/classifier.joblib hasn't been trained yet.

Bengali cases use phrasing styled after data/bengali_real_holdout.csv (real,
native Bengali — not machine-translated) since that's the distribution that
actually matters; see scripts/evaluate_bengali.py for the full measured
report (95.8% accuracy / 2.5% false-safe on that dedicated holdout).
"""

import pytest

from app.services.analyze import analyze_text
from app.services.classifier import is_model_loaded

pytestmark = pytest.mark.skipif(
    not is_model_loaded(), reason="No trained classifier present — run the training scripts first."
)

SPAM_CASES = [
    ("English", "URGENT: Your account will be suspended. Click here now: free-verify.top/link"),
    ("Hindi", "आपका खाता आज बंद हो जाएगा। तुरंत अपना OTP भेजें: fake-bank.info/verify"),
    ("Bengali", "৳৯৯+অর্ডারে গিফট! কোডঃ 4V ক্যাশব্যাক পেতে ক্লিক করুন: chdl.co/MSBzirsV"),
    ("Punjabi", "ਵਧਾਈਆਂ! ਤੁਸੀਂ 50000 ਰੁਪਏ ਜਿੱਤੇ ਹਨ। ਹੁਣੇ ਦਾਅਵਾ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ: free-prize.top/pa"),
    ("Marathi", "अभिनंदन! तुम्ही 50000 रुपये जिंकले आहेत. लगेच दावा करण्यासाठी क्लिक करा: free-prize.top/mr"),
]

HAM_CASES = [
    ("English", "Hey, are we still on for dinner tonight at 8?"),
    ("Hindi", "क्या आप कल शाम को खाने पर आ रहे हैं?"),
    ("Bengali", "ভাই, আপাতত দুইটার রেফারি হিসেবে জীবন তেজপাতা।"),
    ("Punjabi", "ਭਰਾ, ਕੱਲ੍ਹ ਮਿਲਦੇ ਹਾਂ, ਕੰਮ ਬਾਰੇ ਗੱਲ ਕਰਨੀ ਹੈ।"),
    ("Marathi", "अरे, आपण उद्या संध्याकाळी जेवायला भेटूया का?"),
]


@pytest.mark.parametrize("language,text", SPAM_CASES)
def test_pipeline_flags_spam(language: str, text: str):
    result = analyze_text(text)
    assert result.status in ("suspicious", "dangerous"), (
        f"{language} spam under-flagged: status={result.status}, score={result.risk_score}"
    )


@pytest.mark.parametrize("language,text", HAM_CASES)
def test_pipeline_clears_ham(language: str, text: str):
    result = analyze_text(text)
    assert result.status == "safe", (
        f"{language} ham over-flagged: status={result.status}, score={result.risk_score}"
    )
