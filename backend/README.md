# ShieldBhasha Detection Engine — Text/SMS/Email backend

A hybrid rule engine (deterministic, explainable) + ML classifier (catches
phrasing the rules don't) behind the Text/SMS/Email checker. See
`../[Detection Engine Blueprint]` artifact for the full architecture
writeup — this is that plan, actually built.

## Setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python scripts/download_dataset.py   # fetches the HF dataset, never committed
python scripts/train_classifier.py   # trains + saves models/classifier.joblib
python scripts/evaluate.py           # reports real precision/recall/F1
pytest tests/                        # 7 deterministic tests always run;
                                      # 8 multilingual pipeline tests run once
                                      # a model is trained (auto-skipped otherwise)

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
                        (drives the UI's language badge + explanation locale —
                        separate from the classifier's language coverage below)
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
  download_dataset.py   Fetches + reshapes the Hugging Face dataset (all 21
                         language columns, not just the UI's 4)
  train_classifier.py    Trains the TF-IDF + LogisticRegression pipeline
  evaluate.py              Full-pipeline precision/recall/F1 on a held-out set
data/
  manual_examples.csv   Hand-curated digital-arrest / UPI-fraud examples —
                          committed, since no public dataset covers this yet
  labeled_messages.csv  Fetched dataset, gitignored — regenerate via the script above
models/
  classifier.joblib     Trained pipeline, gitignored — regenerate via the
                         training script (derived directly from the dataset,
                         so it's excluded for the same reason)
tests/
  test_analyze.py       Deterministic tests, run without a trained model
  test_classifier.py    Multilingual pipeline tests (French/German/Chinese/
                         Russian spam + ham), auto-skipped if no model exists
```

## The dataset — and why it's trained on all 21 languages, not just 4

Trained on
[dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset](https://huggingface.co/datasets/dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset)
(machine-translated from the classic UCI SMS Spam Collection, GPL license)
plus `data/manual_examples.csv` — hand-written digital-arrest and UPI-fraud
examples, since no public dataset covers that scam pattern yet. **The
dataset itself is never committed** — `download_dataset.py` fetches it
fresh, `.gitignore` excludes the resulting CSV and the trained model.

The dataset actually contains 21 languages: English, Hindi, Bengali,
German, French, Spanish, Chinese, Arabic, Russian, Portuguese, Japanese,
Indonesian, Urdu, Punjabi, Javanese, Turkish, Korean, Marathi, Ukrainian,
Swedish, Norwegian. `download_dataset.py` uses every one of them —
`106,445` labeled messages total — so the classifier's spam/ham judgment
is a genuinely general-purpose multilingual model, not scoped to just the
4 languages ShieldBhasha's UI currently has explanation templates for
(Hindi/Tamil/Bengali/English). A message in any of the other 17 languages
still gets correctly classified; it just falls back to an English-language
explanation in `explain.py` until someone adds that template.

### Measured results (not claimed — see `scripts/evaluate.py`)

Full pipeline (rule engine + classifier), on a genuine 21,289-message
held-out split it never trained on:

| Metric | Score |
|---|---|
| Accuracy | 99.1% |
| Spam recall | 97.3% |
| Spam precision | 95.3% |
| False-safe rate on true spam | 2.7% (73 / 2,675) |

The classifier alone (no rule engine) scores marginally higher precision
but *lower* recall (96.3%) — the hybrid catches spam messages the raw model
missed, which is the whole reason it's a two-layer system and not just the
model by itself.

## The safety rule

`scorer.py` combines the two layers by taking the **max** of their scores,
never an average — and floors the score at "suspicious" whenever they
disagree sharply. If either layer is confident something is wrong, the
verdict reflects that. A false "Suspicious" costs someone a second look; a
false "Safe" costs someone their money.

## Two real bugs found and fixed while building this

1. **Language misdetection**: Bengali sentences ending in "।" (the Danda
   punctuation mark) were silently misclassified as Hindi — that character
   is Unicode-shared with the Devanagari block, not exclusive to Hindi.
   Fixed in both `app/services/language.py` and the frontend's
   `src/lib/mockAnalyzer.ts`.
2. **Broken code-mixed explanations**: Hindi explanations were dropping raw
   English rule titles into the middle of a Hindi sentence ("जिनमें requests
   otp... शामिल है"). Fixed with real per-language topic translations in
   `explain.py`.
