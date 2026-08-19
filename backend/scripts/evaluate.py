"""The credibility check: runs the FULL pipeline (rule engine + classifier
ensemble via analyze_text, not just the raw classifier in isolation) against
a held-out test set it never trained on, and reports real precision/recall/
F1 plus — the metric that actually matters for a safety tool — the
false-safe rate on messages that are truly spam.

Run: python scripts/evaluate.py
(after scripts/train_classifier.py has produced data/eval_holdout.csv)
"""

import sys
from pathlib import Path

import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

sys.path.insert(0, str(Path(__file__).parent.parent))
from app.services.analyze import analyze_text  # noqa: E402

HOLDOUT_PATH = Path(__file__).parent.parent / "data" / "eval_holdout.csv"

# The pipeline emits three verdict bands; the held-out set only has binary
# spam/ham labels. "suspicious" counts as a correct-ish call on true spam
# (it did get flagged, just not at full confidence) but must never count as
# correct on true ham — that asymmetry is what this script actually checks.
PRED_TO_BINARY = {"safe": "ham", "suspicious": "spam", "dangerous": "spam"}


def main() -> None:
    if not HOLDOUT_PATH.exists():
        raise SystemExit(f"{HOLDOUT_PATH} not found — run scripts/train_classifier.py first.")

    holdout = pd.read_csv(HOLDOUT_PATH)
    print(f"Evaluating full pipeline on {len(holdout)} held-out messages...\n")

    statuses, binary_preds = [], []
    for text in holdout["text"]:
        result = analyze_text(str(text))
        statuses.append(result.status)
        binary_preds.append(PRED_TO_BINARY[result.status])

    holdout["predicted_status"] = statuses
    holdout["predicted_binary"] = binary_preds

    print("=== Binary classification report (safe -> ham, suspicious/dangerous -> spam) ===")
    print(classification_report(holdout["true_label"], holdout["predicted_binary"], digits=3))

    print("Confusion matrix (rows=true, cols=pred), labels=[ham, spam]:")
    print(confusion_matrix(holdout["true_label"], holdout["predicted_binary"], labels=["ham", "spam"]))

    false_safe = holdout[(holdout["true_label"] == "spam") & (holdout["predicted_status"] == "safe")]
    true_spam_count = (holdout["true_label"] == "spam").sum()
    print(f"\nFalse-safe rate on true spam: {len(false_safe)}/{true_spam_count} "
          f"({100 * len(false_safe) / max(true_spam_count, 1):.1f}%)")
    if len(false_safe) > 0:
        print("These spam messages were incorrectly marked Safe — inspect and add rules/retrain:")
        for t in false_safe["text"].head(5):
            print(f"  - {t[:100]}")

    print("\n=== Verdict band distribution ===")
    print(holdout["predicted_status"].value_counts())


if __name__ == "__main__":
    main()
