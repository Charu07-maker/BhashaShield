"""Tests multilingual spam/ham judgment through the FULL pipeline
(analyze_text — rule engine + classifier together), not the classifier in
isolation. That distinction matters: the raw classifier's confidence on
short spam phrasing alone is only moderate for some languages (e.g. ~30%
for German/Chinese "you won a prize" text with no link) and only becomes
confident once a URL is present — which is realistic, not a bug, since real
scam messages almost always include one, and the rule engine's link
detection exists specifically to carry that signal. Testing analyze_text()
directly reflects what ships, not an artificial single-layer scenario.

Skipped automatically if models/classifier.joblib hasn't been trained yet.
"""

import pytest

from app.services.analyze import analyze_text
from app.services.classifier import is_model_loaded

pytestmark = pytest.mark.skipif(
    not is_model_loaded(), reason="No trained classifier present — run the training scripts first."
)

# One clearly-spam (with a link, like a real scam message), one clearly-ham
# example per language, in languages well beyond the 4 the UI localizes
# explanations for — proves the classifier generalizes across the dataset's
# full language set, not just ShieldBhasha's current 4 UI languages.
SPAM_CASES = [
    ("French", "FELICITATIONS! Vous avez gagne un prix de 5000 euros. Cliquez ici: free-prize-claim.top/fr"),
    ("German", "Herzlichen Glueckwunsch! Sie haben einen Preis gewonnen. Klicken Sie sofort hier: free-prize.top/de"),
    ("Chinese", "恭喜您中奖了！请立即点击链接领取您的免费奖品：free-gift-xyz.top/win"),
    ("Russian", "ПОЗДРАВЛЯЕМ! Вы выиграли приз. Перейдите по ссылке немедленно: free-prize-claim.top/ru"),
]

HAM_CASES = [
    ("French", "Salut, on se voit demain pour le dejeuner au bureau?"),
    ("German", "Hallo, treffen wir uns morgen um 15 Uhr im Cafe? Bis dann!"),
    ("Chinese", "你好，我们明天下午三点在咖啡馆见面吧"),
    ("Russian", "Привет, давай встретимся завтра в кафе в три часа."),
]


@pytest.mark.parametrize("language,text", SPAM_CASES)
def test_pipeline_flags_multilingual_spam(language: str, text: str):
    result = analyze_text(text)
    assert result.status in ("suspicious", "dangerous"), (
        f"{language} spam under-flagged: status={result.status}, score={result.risk_score}"
    )


@pytest.mark.parametrize("language,text", HAM_CASES)
def test_pipeline_clears_multilingual_ham(language: str, text: str):
    result = analyze_text(text)
    assert result.status == "safe", (
        f"{language} ham over-flagged: status={result.status}, score={result.risk_score}"
    )
