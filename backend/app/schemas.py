"""Pydantic models mirroring src/lib/analysis.ts exactly.

Field names are declared snake_case (Pythonic) and serialized camelCase via
the alias generator below, so the JSON this API emits is byte-for-byte what
the frontend's AnalysisResult / MessageSegment / RedFlag / LinkVerdict types
already expect. No frontend types change when this backend replaces the mock.
"""

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict

VerdictStatus = Literal["safe", "suspicious", "dangerous"]


def _to_camel(field: str) -> str:
    first, *rest = field.split("_")
    return first + "".join(word.capitalize() for word in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)


class MessageSegment(CamelModel):
    text: str
    flagged: Optional[bool] = None


class RedFlag(CamelModel):
    title: str
    description: str


class LinkVerdict(CamelModel):
    url: str
    status: VerdictStatus
    flags: list[str]


class AnalysisResult(CamelModel):
    status: VerdictStatus
    risk_score: int
    language: str
    segments: list[MessageSegment]
    flags: list[RedFlag]
    explanation: str
    link: Optional[LinkVerdict] = None


class CheckTextRequest(CamelModel):
    text: str
