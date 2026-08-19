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

uvicorn app.main:app --reload --port 8000
```

Then visit `http://localhost:8000/docs` for the live Swagger UI, or:

```bash
curl -X POST http://localhost:8000/api/v1/check/text \
  -H "Content-Type: application/json" \
  -d '{"text": "URGENT: share your OTP now or your account will be blocked"}'
```

## Layout

```
app/
  main.py              FastAPI app + routes
  schemas.py           Pydantic models matching the frontend's AnalysisResult exactly
  rules/scam_rules.yaml  Rule engine patterns — data, not code
  services/
    language.py        Script-based Hindi/Bengali/Tamil/English detection
    rules.py            Rule engine matcher
    segments.py          Builds highlighted-phrase segments from rule matches
    classifier.py        Loads + runs the trained ML classifier
    explain.py            Template-based explanation generation (swap for an
                           LLM call later — see the blueprint's Phase 4)
    scorer.py              Combines rule + classifier scores (max, never average)
    analyze.py               Orchestrates all of the above into one AnalysisResult
scripts/
  download_dataset.py   Fetches + reshapes the Hugging Face dataset
  train_classifier.py    Trains the TF-IDF + LogisticRegression pipeline
  evaluate.py              Full-pipeline precision/recall/F1 on a held-out set
data/
  manual_examples.csv   Hand-curated digital-arrest / UPI-fraud examples —
                          committed, since no public dataset covers this yet
  labeled_messages.csv  Fetched dataset, gitignored — regenerate via the script above
tests/
  test_analyze.py       Deterministic tests, run without a trained model
```

## The dataset

Trained on
[dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset](https://huggingface.co/datasets/dbarbedillo/SMS_Spam_Multilingual_Collection_Dataset)
(machine-translated from the classic UCI SMS Spam Collection into 21
languages, GPL license) plus `data/manual_examples.csv` — hand-written
digital-arrest and UPI-fraud examples, since no public dataset covers that
scam pattern yet. **The dataset itself is never committed** — `download_dataset.py`
fetches it fresh, `.gitignore` excludes the resulting CSV.

## Connecting the frontend

In `../src/pages/TextChecker.tsx`, swap the mock call in `handleCheck()`:

```ts
const res = await fetch('http://localhost:8000/api/v1/check/text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: messageText }),
})
const analysis: AnalysisResult = await res.json()
```

Nothing else changes — the response shape is identical to what
`analyzeTextCheckerMessage()` already returns.
