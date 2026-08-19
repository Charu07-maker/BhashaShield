import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnalysisResult, CheckTextRequest
from app.services.analyze import analyze_text
from app.services.classifier import is_model_loaded

logging.basicConfig(level=logging.INFO)

MAX_TEXT_LENGTH = 5_000

app = FastAPI(
    title="ShieldBhasha Detection Engine",
    description="Hybrid rule engine + ML classifier for the Text/SMS/Email checker.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    # Vite's default dev port. Tighten this to the deployed frontend origin
    # before sharing a public URL.
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health() -> dict:
    return {"status": "ok", "classifier_loaded": is_model_loaded()}


@app.post("/api/v1/check/text", response_model=AnalysisResult, response_model_by_alias=True)
def check_text(payload: CheckTextRequest) -> AnalysisResult:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Message text cannot be empty.")
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(status_code=413, detail=f"Message exceeds {MAX_TEXT_LENGTH} characters.")

    return analyze_text(text)
