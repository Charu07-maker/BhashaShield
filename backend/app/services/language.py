"""Script-based language detection for Hindi / Bengali / Tamil / English.

Deliberately not a statistical model (fastText, langdetect): those need a
100MB+ model download and are unreliable below ~30 characters — exactly the
length of most scam SMS. Unicode script-range detection is deterministic,
has zero dependencies, and is *more* accurate here specifically because the
product only needs to distinguish 4 languages, all of which use visually
distinct scripts. Mirrors the identical logic already shipping client-side
in src/lib/mockAnalyzer.ts (detectScriptLanguage), so a message classified
as "Hindi" means the same thing on both sides of the API boundary.
"""

import re

# U+0964 (।) and U+0965 (॥) — the Danda / Double Danda sentence-ending
# marks — live inside the Devanagari Unicode block but are shared
# punctuation used by Bengali, Tamil (rarely), and several other Brahmic
# scripts, not exclusive to Hindi. Excluding them here matters: a Bengali
# sentence ending in "।" would otherwise match the Devanagari check first
# and get silently misclassified as Hindi before the Bengali check ever
# runs, since letters carry the real signal and punctuation doesn't.
_DEVANAGARI = re.compile(r"[ऀ-ॣ०-ॿ]")
_BENGALI = re.compile(r"[ঀ-৿]")
_TAMIL = re.compile(r"[஀-௿]")


def detect_language(text: str) -> str:
    if _DEVANAGARI.search(text):
        return "Hindi"
    if _BENGALI.search(text):
        return "Bengali"
    if _TAMIL.search(text):
        return "Tamil"
    return "English"


# Maps the app's four supported language names to the closest ISO-ish codes
# the trained classifier's per-language columns use (see train_classifier.py).
LANGUAGE_TO_MODEL_CODE = {
    "Hindi": "hi",
    "Bengali": "bn",
    "Tamil": "ta",
    "English": "en",
}
