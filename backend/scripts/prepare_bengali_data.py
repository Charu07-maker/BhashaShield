"""Splits the real, native-Bengali spam/ham dataset (data/raw/bengali_spam_
source.csv — user-provided, not from Hugging Face) into two files:

- data/bengali_real_train.csv   folded into training (see train_classifier.py)
- data/bengali_real_holdout.csv NEVER used in training — the honest,
                                 dedicated measure of "does this actually fix
                                 real Bengali detection", independent of the
                                 general random train/test split.

Why a dedicated split instead of just mixing this into the general dataset:
the whole point of this data is that it's a *different, better* distribution
than the machine-translated Bengali already in the HF dataset. Measuring
against a random holdout that's mostly translated-English-in-Bengali-script
would hide exactly the gap this data exists to close. This holdout is pure
native Bengali, so its score is a direct answer to "is Bengali detection
actually fixed."

Run: python scripts/prepare_bengali_data.py
"""

from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

RAW_PATH = Path(__file__).parent.parent / "data" / "raw" / "bengali_spam_source.csv"
TRAIN_OUT = Path(__file__).parent.parent / "data" / "bengali_real_train.csv"
HOLDOUT_OUT = Path(__file__).parent.parent / "data" / "bengali_real_holdout.csv"

RANDOM_STATE = 42
HOLDOUT_SIZE = 0.2


def main() -> None:
    if not RAW_PATH.exists():
        raise SystemExit(f"{RAW_PATH} not found.")

    df = pd.read_csv(RAW_PATH, header=None, names=["label", "text"], encoding="utf-8-sig")
    df["label"] = df["label"].str.strip().str.lower()
    df = df[df["label"].isin(["spam", "ham"])]
    df["text"] = df["text"].str.strip()
    df = df[df["text"].str.len() > 0].drop_duplicates(subset=["text"])

    print(f"Loaded {len(df)} real Bengali messages: {df['label'].value_counts().to_dict()}")

    train_df, holdout_df = train_test_split(
        df, test_size=HOLDOUT_SIZE, random_state=RANDOM_STATE, stratify=df["label"],
    )

    train_df = train_df.assign(language="Bengali")[["text", "language", "label"]]
    holdout_df = holdout_df[["text", "label"]]

    train_df.to_csv(TRAIN_OUT, index=False)
    holdout_df.to_csv(HOLDOUT_OUT, index=False)

    print(f"Train fold: {len(train_df)} rows -> {TRAIN_OUT}")
    print(f"Holdout (never trained on): {len(holdout_df)} rows -> {HOLDOUT_OUT}")


if __name__ == "__main__":
    main()
