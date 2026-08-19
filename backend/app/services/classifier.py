"""Loads the trained TF-IDF + LogisticRegression pipeline (Layer 2) and
exposes a single scoring function. If no trained model is present yet (fresh
clone, before running the training scripts), falls back to a neutral score
so the API still runs — the rule engine alone still produces a real verdict.
"""

import logging
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)

_MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "classifier.joblib"
_pipeline = None

if _MODEL_PATH.exists():
    _pipeline = joblib.load(_MODEL_PATH)
    logger.info("Loaded classifier from %s", _MODEL_PATH)
else:
    logger.warning(
        "No trained classifier found at %s — run scripts/download_dataset.py "
        "then scripts/train_classifier.py. Falling back to rule-engine-only scoring.",
        _MODEL_PATH,
    )


def is_model_loaded() -> bool:
    return _pipeline is not None


def get_spam_score(text: str) -> int:
    """Returns 0-100: the classifier's confidence this message is spam."""
    if _pipeline is None or not text.strip():
        return 0
    proba = _pipeline.predict_proba([text])[0]
    classes = list(_pipeline.classes_)
    spam_idx = classes.index("spam") if "spam" in classes else 1
    return round(float(proba[spam_idx]) * 100)
