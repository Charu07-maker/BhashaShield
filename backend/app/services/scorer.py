"""Ensemble scorer — combines the rule engine (Layer 1, deterministic) and
the classifier (Layer 2, statistical) into one verdict.

The core safety rule, stated once here so it can't drift: take the MAX of
the two layers' scores, never an average. If either layer is confident
something is wrong, the verdict reflects that — a false "Suspicious" costs
someone a second look; a false "Safe" costs someone their money. When the
two layers land far apart, that disagreement is itself evidence of an
ambiguous message, so it's floored at "suspicious" rather than diluted away.
"""

from dataclasses import dataclass

from app.services.classifier import get_spam_score
from app.services.rules import RuleEngineResult, run_rule_engine

DANGEROUS_THRESHOLD = 70
SUSPICIOUS_THRESHOLD = 35
DISAGREEMENT_FLOOR_GAP = 40
DISAGREEMENT_FLOOR_SCORE = 35


@dataclass
class ScoredResult:
    status: str
    risk_score: int
    rule_result: RuleEngineResult
    classifier_score: int


def score_message(text: str, lang_code: str) -> ScoredResult:
    rule_result = run_rule_engine(text, lang_code)
    classifier_score = get_spam_score(text)

    final_score = max(rule_result.score, classifier_score)

    disagreement = abs(rule_result.score - classifier_score)
    if disagreement > DISAGREEMENT_FLOOR_GAP:
        final_score = max(final_score, DISAGREEMENT_FLOOR_SCORE)

    if final_score >= DANGEROUS_THRESHOLD:
        status = "dangerous"
    elif final_score >= SUSPICIOUS_THRESHOLD:
        status = "suspicious"
    else:
        status = "safe"

    return ScoredResult(
        status=status,
        risk_score=final_score,
        rule_result=rule_result,
        classifier_score=classifier_score,
    )
