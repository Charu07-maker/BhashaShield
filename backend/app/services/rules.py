"""Deterministic, explainable rule engine — Layer 1 of the detection engine.

Every flag this layer raises traces back to a literal pattern in
scam_rules.yaml — zero hallucination risk, 100% auditable. Loaded once at
import time; edit the YAML and restart to pick up new patterns.
"""

import re
from dataclasses import dataclass
from pathlib import Path

import yaml

_RULES_PATH = Path(__file__).parent.parent / "rules" / "scam_rules.yaml"
_RULES: list[dict] = yaml.safe_load(_RULES_PATH.read_text(encoding="utf-8"))


@dataclass
class MatchedRule:
    id: str
    title: str
    description: str
    weight: int


@dataclass
class Span:
    start: int
    end: int


@dataclass
class RuleEngineResult:
    score: int
    matched_rules: list[MatchedRule]
    spans: list[Span]  # merged, sorted, non-overlapping — for segment building


def _compiled_patterns_for(rule: dict, lang_code: str) -> list[re.Pattern]:
    patterns = rule["patterns"]
    raw = list(patterns.get(lang_code, [])) + list(patterns.get("en", []))
    return [re.compile(p, re.IGNORECASE) for p in dict.fromkeys(raw)]  # dedupe, keep order


def _merge_spans(spans: list[tuple[int, int]]) -> list[Span]:
    if not spans:
        return []
    spans = sorted(spans)
    merged = [list(spans[0])]
    for start, end in spans[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return [Span(s, e) for s, e in merged]


def run_rule_engine(text: str, lang_code: str) -> RuleEngineResult:
    matched: list[MatchedRule] = []
    raw_spans: list[tuple[int, int]] = []

    for rule in _RULES:
        rule_hit = False
        for pattern in _compiled_patterns_for(rule, lang_code):
            for m in pattern.finditer(text):
                if m.end() == m.start():
                    continue
                raw_spans.append((m.start(), m.end()))
                rule_hit = True
        if rule_hit:
            matched.append(
                MatchedRule(
                    id=rule["id"],
                    title=rule["title"],
                    description=rule["description"],
                    weight=rule["weight"],
                )
            )

    score = min(100, sum(r.weight for r in matched)) if text.strip() else 0
    return RuleEngineResult(score=score, matched_rules=matched, spans=_merge_spans(raw_spans))


def find_first_url(text: str) -> str | None:
    m = re.search(r"https?://[^\s]+|\bwww\.[^\s]+|\b[a-z0-9-]+\.(?:info|xyz|top|co|link|click|shop)\b[^\s]*", text, re.IGNORECASE)
    return m.group(0) if m else None
