# ShieldBhasha Detection Engine — Text/SMS/Email backend

A hybrid rule engine (deterministic, explainable) + ML classifier (catches
phrasing the rules don't) behind the Text/SMS/Email checker. See
`../[Detection Engine Blueprint]` artifact for the full architecture
writeup — this is that plan, actually built.

**Strictly scoped to 5 languages**: English, Hindi, Bengali, Punjabi,
Marathi. This is a deliberate restriction, not a gap — the source dataset
has 21, and 16 are intentionally unused.

## Setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python scripts/download_dataset.py     # fetches the HF dataset (5 languages
                                        # only), never committed
python scripts/prepare_bengali_data.py # splits the real Bengali dataset into
                                        # a train fold + a held-out eval set
python scripts/train_classifier.py     # trains + saves models/classifier.joblib
python scripts/evaluate.py             # general precision/recall/F1
python scripts/evaluate_bengali.py     # the number that actually matters —
                                        # accuracy on real, native Bengali
                                        # text never seen during training
pytest tests/                          # 7 deterministic tests always run;
                                        # 10 pipeline tests run once a model
                                        # is trained (auto-skipped otherwise)

uvicorn app.main:app --reload --port 8000
```

Then visit `http://localhost:8000/docs` for the live Swagger UI, or:

```bash
curl -X POST http://localhost:8000/api/v1/check/text \
  -H "Content-Type: application/json" \
  -d '{"text": "URGENT: share your OTP now or your account will be blocked"}'
```

The frontend (`../src/pages/TextChecker.tsx`) already calls this API —
`npm run dev` in the project root plus this server running is the full
stack, no further wiring needed.

## Layout

```
app/
  main.py              FastAPI app + routes
  schemas.py           Pydantic models matching the frontend's AnalysisResult exactly
  rules/scam_rules.yaml  Rule engine patterns — data, not code
  services/
    language.py        Script-based Hindi/Bengali/Tamil/English detection
                        (drives the UI's language badge + explanation locale)
    rules.py            Rule engine matcher
    segments.py          Builds highlighted-phrase segments from rule matches
    classifier.py         Loads + runs the trained ML classifier
    explain.py              Template-based explanation generation (English/
                             Hindi/Bengali; swap for an LLM call later — see
                             the blueprint's Phase 4)
    scorer.py                 Combines rule + classifier scores (max, never
                               average — see "The safety rule" below)
    analyze.py                   Orchestrates all of the above into one AnalysisResult
scripts/
  download_dataset.py       Fetches the HF dataset, restricted to 5 language columns
  prepare_bengali_data.py    Splits the real Bengali dataset into train/holdout
  train_classifier.py         Trains the TF-IDF + LogisticRegression pipeline
                               (folds in the oversampled real Bengali train set)
  evaluate.py                   General full-pipeline precision/recall/F1
  evaluate_bengali.py             Bengali-specific accuracy on the dedicated holdout
data/
  manual_examples.csv       Hand-curated digital-arrest / UPI-fraud examples — committed
  raw/bengali_spam_source.csv  Real, native Bengali spam/ham — user-provided,
                                committed (no automated re-fetch path exists,
                                unlike the HF dataset)
  bengali_real_train.csv       Derived train fold (oversampled into training)
  bengali_real_holdout.csv     Derived holdout — NEVER used in training
  labeled_messages.csv      HF dataset, gitignored — regenerate via the script above
models/
  classifier.joblib         Trained pipeline, gitignored — regenerate via the
                             training script
tests/
  test_analyze.py           Deterministic tests, run without a trained model
  test_classifier.py        Pipeline tests for all 5 languages, auto-skipped
                             if no model exists
```

## The dataset(s)

**Base**: [dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset](https://huggingface.co/datasets/dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset)
(machine-translated from the classic UCI SMS Spam Collection, GPL license).
`download_dataset.py` uses exactly 5 of its 21 language columns — English,
Hindi, Bengali, Punjabi, Marathi — `25,400` labeled messages. **Never
committed** — the script fetches it fresh; `.gitignore` excludes the CSV
and the trained model.

**Plus** `data/manual_examples.csv` — hand-written digital-arrest and
UPI-fraud examples, since no public dataset covers that scam pattern.

**Plus real, native Bengali data** (`data/raw/bengali_spam_source.csv`,
477 messages, user-provided) — see the fix below.

## The Bengali fix

Measured directly against real, native Bengali spam (not the HF dataset's
machine-translated Bengali column), the original model had a **58.5%
false-safe rate** — real Bengali scam messages were being called safe more
often than not. Machine-translated Bengali reads like Western "you've won a
lottery" spam translated word-for-word; real Bengali spam is written
differently (local brands, local payment apps, colloquial phrasing), and a
model trained mostly on the former didn't generalize to the latter.

The fix: `prepare_bengali_data.py` splits the real dataset into an 80%
train fold and a 20% holdout that is **never used in training** — a
dedicated, honest measure of whether Bengali detection actually improved,
independent of the general (mostly-translated) evaluation set.
`train_classifier.py` folds the train fold in **oversampled 10x**, so it
isn't drowned out by the ~13x larger volume of machine-translated Bengali
already in the base dataset.

**Before → after, measured on the same never-trained-on real-Bengali holdout:**

| Metric | Before | After |
|---|---|---|
| Accuracy | 73.0% | **95.8%** |
| False-safe rate on true spam | 58.5% (127/217) | **2.5%** (1/40) |

Run `scripts/evaluate_bengali.py` to reproduce this yourself.

### General results (not claimed — see `scripts/evaluate.py`)

Full pipeline (rule engine + classifier), on a genuine held-out split
across all 5 languages combined:

| Metric | Score |
|---|---|
| Accuracy | 98.8% |
| Spam recall | 95.3% |
| Spam precision | 97.0% |

## The safety rule

`scorer.py` combines the two layers by taking the **max** of their scores,
never an average — and floors the score at "suspicious" whenever they
disagree sharply. If either layer is confident something is wrong, the
verdict reflects that. A false "Suspicious" costs someone a second look; a
false "Safe" costs someone their money.

## Real bugs found and fixed while building this

1. **Bengali false-safe rate (58.5%)** — see above. The single biggest fix.
2. **Language misdetection**: Bengali sentences ending in "।" (the Danda
   punctuation mark) were silently misclassified as Hindi — that character
   is Unicode-shared with the Devanagari block, not exclusive to Hindi.
   Fixed in both `app/services/language.py` and the frontend's
   `src/lib/mockAnalyzer.ts`.
3. **Broken code-mixed explanations**: Hindi explanations were dropping raw
   English rule titles into the middle of a Hindi sentence ("जिनमें requests
   otp... शामिल है"). Fixed with real per-language topic translations in
   `explain.py`.
