"""Trains Layer 2's statistical classifier — the part of the engine that
catches phrasing the rule engine's fixed patterns don't cover.

Why character n-grams, not word n-grams: a single TfidfVectorizer(analyzer=
"char_wb") works uniformly across Devanagari, Bengali, and Latin script
without a per-language tokenizer or stemmer.

Bengali gets special handling: the HF dataset's Bengali column is machine-
translated from the English UCI spam set, and measured directly against
real native Bengali spam it produced a 58.5% false-safe rate — the
translated phrasing (Western "you've won a lottery" style, word-for-word
translated) doesn't match how real Bengali spam is actually written (local
brands, local payment apps, colloquial phrasing). data/bengali_real_train.csv
(see scripts/prepare_bengali_data.py) is real, native Bengali spam/ham, and
is oversampled BENGALI_REAL_OVERSAMPLE times so it isn't drowned out by the
~13x larger volume of machine-translated Bengali in the base dataset.

Run: python scripts/train_classifier.py
(after scripts/download_dataset.py has produced data/labeled_messages.csv
and scripts/prepare_bengali_data.py has produced data/bengali_real_train.csv)
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_DIR = Path(__file__).parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"
LABELED_PATH = DATA_DIR / "labeled_messages.csv"
MANUAL_PATH = DATA_DIR / "manual_examples.csv"
BENGALI_REAL_TRAIN_PATH = DATA_DIR / "bengali_real_train.csv"
MODEL_PATH = MODELS_DIR / "classifier.joblib"
HOLDOUT_PATH = DATA_DIR / "eval_holdout.csv"

RANDOM_STATE = 42
TEST_SIZE = 0.2
BENGALI_REAL_OVERSAMPLE = 10


def load_training_data() -> pd.DataFrame:
    if not LABELED_PATH.exists():
        raise SystemExit(f"{LABELED_PATH} not found — run scripts/download_dataset.py first.")
    df = pd.read_csv(LABELED_PATH)

    if MANUAL_PATH.exists():
        manual = pd.read_csv(MANUAL_PATH)
        print(f"Folding in {len(manual)} hand-curated examples from {MANUAL_PATH.name}")
        df = pd.concat([df, manual[["text", "language", "label"]]], ignore_index=True)

    if BENGALI_REAL_TRAIN_PATH.exists():
        bengali_real = pd.read_csv(BENGALI_REAL_TRAIN_PATH)
        oversampled = pd.concat([bengali_real] * BENGALI_REAL_OVERSAMPLE, ignore_index=True)
        print(f"Folding in {len(bengali_real)} real Bengali examples, "
              f"oversampled {BENGALI_REAL_OVERSAMPLE}x -> {len(oversampled)} rows "
              f"(vs {len(df[df['language'] == 'Bengali'])} machine-translated Bengali rows)")
        df = pd.concat([df, oversampled[["text", "language", "label"]]], ignore_index=True)
    else:
        print(f"NOTE: {BENGALI_REAL_TRAIN_PATH.name} not found — run "
              f"scripts/prepare_bengali_data.py first for accurate Bengali detection.")

    df = df.dropna(subset=["text", "label"])
    df = df[df["text"].str.strip().str.len() > 0]
    return df


def main() -> None:
    df = load_training_data()
    print(f"Training on {len(df)} total labeled messages across languages: "
          f"{df['language'].value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"],
        test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=df["label"],
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            analyzer="char_wb", ngram_range=(2, 4),
            min_df=2, max_features=50_000, sublinear_tf=True,
        )),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", C=4.0)),
    ])

    print("Fitting pipeline...")
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    print("\n=== Held-out test performance ===")
    print(classification_report(y_test, preds, digits=3))
    print("Confusion matrix (rows=true, cols=pred), labels=[ham, spam]:")
    print(confusion_matrix(y_test, preds, labels=["ham", "spam"]))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nSaved trained pipeline to {MODEL_PATH}")

    # Persist the exact same held-out split for scripts/evaluate.py, so the
    # metrics reported there are computed on data the model never trained on.
    holdout = pd.DataFrame({"text": X_test, "true_label": y_test})
    holdout.to_csv(HOLDOUT_PATH, index=False)
    print(f"Saved held-out eval set ({len(holdout)} rows) to {HOLDOUT_PATH}")


if __name__ == "__main__":
    main()
