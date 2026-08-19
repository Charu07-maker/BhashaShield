"""Orchestrates the full pipeline: language ID -> rule engine + classifier ->
ensemble scorer -> segments/explanation/link -> the frontend's exact
AnalysisResult shape. This is the one function the API route calls.
"""

from app.schemas import AnalysisResult, LinkVerdict, RedFlag
from app.services.explain import build_explanation
from app.services.language import LANGUAGE_TO_MODEL_CODE, detect_language
from app.services.rules import find_first_url
from app.services.scorer import score_message
from app.services.segments import build_segments


def _link_verdict_for(url: str, overall_status: str) -> LinkVerdict:
    # A URL inside a message inherits the message's own verdict — a link
    # embedded in an otherwise-dangerous message is not independently
    # "safe" just because the domain itself hasn't been checked yet. The
    # dedicated Link Checker module (a separate API, not built here) is
    # where a URL gets its own independent Safe Browsing / WHOIS-backed
    # verdict; this is a same-request convenience summary only.
    if overall_status == "dangerous":
        flags = ["Found inside a message flagged Dangerous", "Not independently verified — check it separately"]
    elif overall_status == "suspicious":
        flags = ["Found inside a message flagged Suspicious", "Not independently verified — check it separately"]
    else:
        flags = ["No suspicious patterns found in the surrounding message"]
    return LinkVerdict(url=url, status=overall_status, flags=flags)


def analyze_text(text: str) -> AnalysisResult:
    language = detect_language(text)
    lang_code = LANGUAGE_TO_MODEL_CODE[language]

    scored = score_message(text, lang_code)
    segments = build_segments(text, scored.rule_result.spans)
    flags = [RedFlag(title=r.title, description=r.description) for r in scored.rule_result.matched_rules]
    explanation = build_explanation(scored.status, scored.rule_result.matched_rules, language)

    url = find_first_url(text)
    link = _link_verdict_for(url, scored.status) if url else None

    return AnalysisResult(
        status=scored.status,
        risk_score=scored.risk_score,
        language=language,
        segments=segments,
        flags=flags,
        explanation=explanation,
        link=link,
    )
