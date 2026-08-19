"""Fetches dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset from the
Hugging Face Hub and reshapes it into one flat labeled CSV: one row per
(message, language) pair, columns [text, language, label].

The source dataset stores one row per original SMS with a translated column
per language (text_en, text_hi, text_bn, ...) and a shared label — this
script "melts" that wide format into the long format the classifier and
eval harness both expect.

Run: python scripts/download_dataset.py
"""

import sys
from pathlib import Path

import pandas as pd
from datasets import load_dataset

OUT_PATH = Path(__file__).parent.parent / "data" / "labeled_messages.csv"

# The 4 languages this product actually supports. Extend this list later if
# ShieldBhasha adds more — everything downstream reads from the CSV, not
# from this dict.
LANGUAGE_COLUMNS = {
    "text": "English",
    "text_hi": "Hindi",
    "text_bn": "Bengali",
    # No Tamil column in this dataset (see conversation notes) — Tamil
    # coverage for now comes entirely from the rule engine's patterns and
    # any hand-curated examples added to data/manual_examples.csv.
}


def main() -> None:
    print("Downloading dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset ...")
    ds = load_dataset("dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset", split="train")
    df = ds.to_pandas()

    print(f"Raw dataset: {len(df)} rows. Columns: {list(df.columns)}")

    label_col = next((c for c in ["labels", "label", "Label", "type", "spam"] if c in df.columns), None)
    if label_col is None:
        print("ERROR: couldn't find a label column. Inspect df.columns above and update this script.")
        sys.exit(1)

    present_lang_cols = {col: lang for col, lang in LANGUAGE_COLUMNS.items() if col in df.columns}
    if not present_lang_cols:
        print("ERROR: none of the expected language columns were found. Inspect df.columns above.")
        sys.exit(1)
    print(f"Using language columns: {present_lang_cols}")

    rows = []
    for _, row in df.iterrows():
        raw_label = str(row[label_col]).strip().lower()
        label = "spam" if raw_label in {"spam", "1", "true"} else "ham"
        for col, language in present_lang_cols.items():
            text = row.get(col)
            if isinstance(text, str) and text.strip():
                rows.append({"text": text.strip(), "language": language, "label": label})

    long_df = pd.DataFrame(rows).drop_duplicates(subset=["text", "language"])
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    long_df.to_csv(OUT_PATH, index=False)

    print(f"Wrote {len(long_df)} labeled (text, language) rows to {OUT_PATH}")
    print(long_df.groupby(["language", "label"]).size())


if __name__ == "__main__":
    main()
