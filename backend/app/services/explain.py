"""Plain-language explanation generation — currently template-based so the
backend runs standalone with zero external API keys and zero per-request
cost. This is intentionally the one seam designed for the blueprint's
Phase 4 LLM reasoning layer: swap get_llm_assessment() in for
build_explanation() here and nothing else in the pipeline changes, since
both return a single `explanation: str` in the message's detected language.

Topic names are translated per rule ID (_TOPIC_TRANSLATIONS below), not by
lower-casing the English rule title — a Hindi/Bengali sentence with raw
English phrases like "kyc update pressure" stitched in reads as broken, not
bilingual. Bengali topic phrases are a first pass (common/simple vocabulary,
not yet native-speaker reviewed) — flagging that honestly rather than
shipping it as verified.
"""

from app.services.rules import MatchedRule

_TEMPLATES = {
    "English": {
        "safe": "This message doesn't match any known scam patterns — no urgency, "
                "no payment requests, and no suspicious links.",
        "suspicious": "A few suspicious signals were found, including {topics}. "
                       "Proceed carefully and verify independently before acting.",
        "dangerous": "Multiple strong scam signals were found, including {topics}. "
                      "Avoid clicking any links or sharing personal details.",
        "suspicious_no_topics": "This message's overall phrasing has some resemblance to spam "
                                  "or scam patterns, even though no single red flag stood out on "
                                  "its own. Proceed with a bit of caution.",
        "dangerous_no_topics": "This message's overall phrasing closely matches known scam "
                                 "patterns, even though no single red flag stood out on its own. "
                                 "Treat it with caution and verify independently before acting.",
    },
    "Hindi": {
        "safe": "इस संदेश में किसी ज्ञात धोखाधड़ी पैटर्न का कोई संकेत नहीं मिला — "
                "न तो जल्दबाज़ी, न भुगतान की मांग, न ही कोई संदिग्ध लिंक।",
        "suspicious": "कुछ संदिग्ध संकेत मिले हैं, जिनमें {topics} शामिल है। सावधानी से आगे बढ़ें "
                       "और स्वतंत्र रूप से पुष्टि करें।",
        "dangerous": "कई मज़बूत धोखाधड़ी के संकेत मिले हैं, जिनमें {topics} शामिल है। किसी भी लिंक "
                      "पर क्लिक न करें और व्यक्तिगत जानकारी साझा न करें।",
        "suspicious_no_topics": "इस संदेश की भाषा में स्पैम या धोखाधड़ी जैसे पैटर्न की कुछ झलक मिलती "
                                  "है, भले ही कोई खास संकेत अलग से सामने न आया हो। थोड़ी सावधानी बरतें।",
        "dangerous_no_topics": "इस संदेश की समग्र भाषा धोखाधड़ी के जाने-पहचाने पैटर्न से काफी मिलती-जुलती "
                                 "है, भले ही कोई एक खास संकेत अलग से सामने न आया हो। सावधानी बरतें और "
                                 "स्वतंत्र रूप से पुष्टि करें।",
    },
    "Bengali": {
        "safe": "এই বার্তায় কোনো পরিচিত প্রতারণার ধরন পাওয়া যায়নি — না তাড়াহুড়ো, "
                "না অর্থপ্রদানের অনুরোধ, না কোনো সন্দেহজনক লিংক।",
        "suspicious": "কিছু সন্দেহজনক ইঙ্গিত পাওয়া গেছে, যার মধ্যে রয়েছে {topics}। সতর্কভাবে এগিয়ে যান "
                       "এবং স্বাধীনভাবে যাচাই করুন।",
        "dangerous": "একাধিক শক্তিশালী প্রতারণার ইঙ্গিত পাওয়া গেছে, যার মধ্যে রয়েছে {topics}। কোনো "
                      "লিংকে ক্লিক করবেন না বা ব্যক্তিগত তথ্য শেয়ার করবেন না।",
        "suspicious_no_topics": "এই বার্তার ভাষায় স্প্যাম বা প্রতারণার প্যাটার্নের কিছুটা মিল পাওয়া গেছে, "
                                  "যদিও নির্দিষ্ট কোনো একক ইঙ্গিত আলাদাভাবে ধরা পড়েনি। কিছুটা সতর্কতার সাথে "
                                  "এগিয়ে যান।",
        "dangerous_no_topics": "এই বার্তার সামগ্রিক ভাষা পরিচিত প্রতারণার প্যাটার্নের সাথে যথেষ্ট মিলে "
                                 "যায়, যদিও নির্দিষ্ট কোনো একক ইঙ্গিত আলাদাভাবে ধরা পড়েনি। সতর্ক থাকুন "
                                 "এবং স্বাধীনভাবে যাচাই করুন।",
    },
}

# Per-rule-id topic phrase, by language — keeps explanations from mixing raw
# English rule titles into a Hindi/Bengali sentence.
_TOPIC_TRANSLATIONS: dict[str, dict[str, str]] = {
    "requests_otp": {"English": "requests for your OTP", "Hindi": "ओटीपी मांगना", "Bengali": "ওটিপি চাওয়া"},
    "kyc_pressure": {"English": "KYC update pressure", "Hindi": "केवाईसी अपडेट का दबाव", "Bengali": "কেওয়াইসি আপডেটের চাপ"},
    "artificial_urgency": {"English": "artificial urgency", "Hindi": "जल्दबाज़ी बनाना", "Bengali": "তাড়াহুড়ো তৈরি করা"},
    "threatens_account_action": {"English": "threats to block your account", "Hindi": "खाता बंद करने की धमकी", "Bengali": "অ্যাকাউন্ট বন্ধ করার হুমকি"},
    "impersonates_law_enforcement": {"English": "impersonating law enforcement", "Hindi": "कानून प्रवर्तन की नकल", "Bengali": "আইনশৃঙ্খলা বাহিনীর ছদ্মবেশ"},
    "requests_financial_details": {"English": "requests for banking details", "Hindi": "बैंकिंग जानकारी मांगना", "Bengali": "ব্যাংকিং তথ্য চাওয়া"},
    "unrealistic_reward": {"English": "an unrealistic reward", "Hindi": "अवास्तविक इनाम का लालच", "Bengali": "অবাস্তব পুরস্কারের প্রলোভন"},
    "stay_on_call": {"English": "instructions to stay on the call", "Hindi": "कॉल पर बने रहने का निर्देश", "Bengali": "কলে থাকার নির্দেশ"},
    "video_surveillance": {"English": "demands to stay on video", "Hindi": "वीडियो कॉल पर निगरानी", "Bengali": "ভিডিও কলে নজরদারি"},
    "suspicious_link": {"English": "a suspicious link", "Hindi": "संदिग्ध लिंक", "Bengali": "সন্দেহজনক লিংক"},
}


def _topic_phrase(rule: MatchedRule, language: str) -> str:
    translations = _TOPIC_TRANSLATIONS.get(rule.id)
    if translations:
        return translations.get(language, translations["English"])
    return rule.title.lower()  # fallback for any rule not yet in the table above


def build_explanation(status: str, matched_rules: list[MatchedRule], language: str) -> str:
    templates = _TEMPLATES.get(language, _TEMPLATES["English"])

    if status == "safe":
        return templates["safe"]

    if not matched_rules:
        # Classifier-only verdict — no specific rule fired, so there are no
        # "topics" to name. Previously this fell back to the "safe" template,
        # which flatly contradicted a Suspicious/Dangerous banner.
        return templates[f"{status}_no_topics"]

    topics = ", ".join(_topic_phrase(r, language) for r in matched_rules[:3])
    return templates[status].format(topics=topics)
