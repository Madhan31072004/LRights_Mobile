"""
Language / Translation router – uses Google Translate via deep-translator
for fast translation of UI strings to all major Indian languages.
Translations are cached to disk (JSON files) so subsequent requests are instant.
"""

import json
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict

from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Cache directory ───────────────────────────────────────────────────
CACHE_DIR = Path(__file__).resolve().parent.parent / "translation_cache"
CACHE_DIR.mkdir(exist_ok=True)

# ── Supported Indian languages with Google Translate codes ────────────
INDIAN_LANGUAGES = {
    "en":  {"name": "English",               "google": "en"},
    "hi":  {"name": "हिन्दी (Hindi)",         "google": "hi"},
    "te":  {"name": "తెలుగు (Telugu)",         "google": "te"},
    "ta":  {"name": "தமிழ் (Tamil)",          "google": "ta"},
    "kn":  {"name": "ಕನ್ನಡ (Kannada)",        "google": "kn"},
    "ml":  {"name": "മലയാളം (Malayalam)",      "google": "ml"},
    "mr":  {"name": "मराठी (Marathi)",        "google": "mr"},
    "bn":  {"name": "বাংলা (Bengali)",        "google": "bn"},
    "gu":  {"name": "ગુજરાતી (Gujarati)",      "google": "gu"},
    "pa":  {"name": "ਪੰਜਾਬੀ (Punjabi)",       "google": "pa"},
    "or":  {"name": "ଓଡ଼ିଆ (Odia)",          "google": "or"},
    "as":  {"name": "অসমীয়া (Assamese)",      "google": "as"},
    "ur":  {"name": "اردو (Urdu)",           "google": "ur"},
    "sa":  {"name": "संस्कृतम् (Sanskrit)",    "google": "sa"},
    "ne":  {"name": "नेपाली (Nepali)",        "google": "ne"},
    "sd":  {"name": "سنڌي (Sindhi)",          "google": "sd"},
    "mai": {"name": "मैथिली (Maithili)",      "google": "mai"},
}


# ── Disk cache helpers ────────────────────────────────────────────────

def _cache_path(lang: str) -> Path:
    return CACHE_DIR / f"{lang}.json"


def _load_cache(lang: str) -> Dict[str, str] | None:
    p = _cache_path(lang)
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return None
    return None


def _save_cache(lang: str, data: Dict[str, str]):
    _cache_path(lang).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )


# ── Translation helpers ──────────────────────────────────────────────

def _translate_one(text: str, google_code: str) -> str:
    """Translate a single string using Google Translate."""
    from deep_translator import GoogleTranslator
    try:
        result = GoogleTranslator(source="en", target=google_code).translate(text)
        return result if result else text
    except Exception as exc:
        logger.warning(f"Failed to translate '{text[:40]}' to {google_code}: {exc}")
        return text


def _translate_batch(texts: Dict[str, str], lang: str) -> Dict[str, str]:
    """
    Translate all strings concurrently using ThreadPoolExecutor.
    ~200 strings finish in ~5-10 seconds with 10 parallel workers.
    """
    google_code = INDIAN_LANGUAGES.get(lang, {}).get("google")
    if not google_code or lang == "en":
        return texts

    keys = list(texts.keys())
    values = list(texts.values())

    def _do(text):
        return _translate_one(text, google_code)

    # 10 concurrent workers for speed
    with ThreadPoolExecutor(max_workers=10) as pool:
        translated_values = list(pool.map(_do, values))

    return dict(zip(keys, translated_values))


# ── Schemas ───────────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    texts: Dict[str, str]
    target_language: str


# ── Endpoints ─────────────────────────────────────────────────────────

@router.get("/")
def get_languages():
    """Return all supported languages."""
    return {
        "languages": [
            {"code": code, "name": info["name"]}
            for code, info in INDIAN_LANGUAGES.items()
        ]
    }


@router.post("/translate")
def translate_batch(req: TranslateRequest):
    """
    Translate UI strings to the target language.
    - English → instant (returns as-is)
    - Cached language → instant (from disk)
    - New language → translates with Google Translate (~5-10s), then caches
    """
    lang = req.target_language

    if lang == "en":
        return {"translations": req.texts, "language": "en", "cached": True}

    # 1) Check disk cache
    cached = _load_cache(lang)
    if cached:
        # Return cached values; for any NEW keys not in cache, translate them
        missing = {k: v for k, v in req.texts.items() if k not in cached}
        if not missing:
            result = {k: cached.get(k, v) for k, v in req.texts.items()}
            return {"translations": result, "language": lang, "cached": True}
        # Translate only missing keys
        new_translations = _translate_batch(missing, lang)
        cached.update(new_translations)
        _save_cache(lang, cached)
        result = {k: cached.get(k, v) for k, v in req.texts.items()}
        return {"translations": result, "language": lang, "cached": False}

    # 2) Full translation (first time for this language)
    logger.info(f"Translating {len(req.texts)} strings to '{lang}' …")
    translated = _translate_batch(req.texts, lang)
    _save_cache(lang, translated)
    logger.info(f"Translation to '{lang}' complete and cached.")
    return {"translations": translated, "language": lang, "cached": False}


@router.get("/translate/{lang}")
def get_cached_translation(lang: str):
    """
    GET endpoint — serves pre-generated translations from disk cache.
    Much faster than POST (no request body parsing, no re-translation).
    """
    if lang == "en":
        return {"translations": {}, "language": "en", "cached": True}

    cached = _load_cache(lang)
    if cached:
        return {"translations": cached, "language": lang, "cached": True}

    return {"translations": {}, "language": lang, "cached": False, "error": "No cache found. Use POST /translate to generate."}


@router.delete("/cache")
def clear_cache():
    """Clear all cached translations."""
    for f in CACHE_DIR.glob("*.json"):
        f.unlink()
    return {"message": "Translation cache cleared"}
