"""Builds the frontend's MessageSegment[] shape from merged rule-engine spans
— the same split-around-matches approach as buildSegments() in
src/lib/mockAnalyzer.ts, so highlighted phrases render identically."""

from app.schemas import MessageSegment
from app.services.rules import Span


def build_segments(text: str, spans: list[Span]) -> list[MessageSegment]:
    if not spans:
        return [MessageSegment(text=text)]

    segments: list[MessageSegment] = []
    cursor = 0
    for span in spans:
        if span.start > cursor:
            segments.append(MessageSegment(text=text[cursor:span.start]))
        segments.append(MessageSegment(text=text[span.start:span.end], flagged=True))
        cursor = span.end
    if cursor < len(text):
        segments.append(MessageSegment(text=text[cursor:]))
    return segments
