"""The number that actually matters for the Bengali fix: accuracy on
data/bengali_real_holdout.csv, which is real, native Bengali spam/ham that
was NEVER used in training (see prepare_bengali_data.py) — a direct,
honest answer to "is Bengali detection actually fixed now," independent of
the general random holdout which is mostly machine-translated text.

Run: python scripts/evaluate_bengali.py
"""

import sys
from pathlib import Path

import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

sys.path.insert(0, str(Path(__file__).parent.parent))
from app.services.analyze import analyze_text  # noqa: E402
from app.services.classifier import get_spam_score  # noqa: E402

HOLDOUT_PATH = Path(__file__).parent.parent / "data" / "bengali_real_holdout.csv"
PRED_TO_BINARY = {"safe": "ham", "suspicious": "spam", "dangerous": "spam"}


def main() -> None:
    if not HOLDOUT_PATH.exists():
        raise SystemExit(f"{HOLDOUT_PATH} not found — run scripts/prepare_bengali_data.py first.")

    df = pd.read_csv(HOLDOUT_PATH)
    print(f"Evaluating on {len(df)} real, native Bengali messages "
          f"(never seen during training): {df['label'].value_counts().to_dict()}\n")

    classifier_only_preds, pipeline_preds = [], []
    for text in df["text"]:
        classifier_only_preds.append("spam" if get_spam_score(str(text)) >= 35 else "ham")
        pipeline_preds.append(PRED_TO_BINARY[analyze_text(str(text)).status])

    for label, preds in [("Classifier alone", classifier_only_preds), ("Full pipeline", pipeline_preds)]:
        print(f"=== {label} ===")
        print(classification_report(df["label"], preds, digits=3))
        print("Confusion matrix (rows=true, cols=pred), labels=[ham, spam]:")
        print(confusion_matrix(df["label"], preds, labels=["ham", "spam"]))
        false_safe = ((df["label"] == "spam") & (pd.Series(preds) == "ham")).sum()
        total_spam = (df["label"] == "spam").sum()
        print(f"False-safe rate: {false_safe}/{total_spam} = {100*false_safe/total_spam:.1f}%\n")


if __name__ == "__main__":
    main()
