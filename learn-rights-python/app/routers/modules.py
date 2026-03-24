from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import get_db
import json, logging, traceback
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Translation helpers ──────────────────────────────────────────────
MOD_CACHE_DIR = Path(__file__).resolve().parent.parent / "translation_cache" / "modules"
MOD_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Languages known to be unsupported by Google Translate
_UNSUPPORTED_LANGS = set()

def _translate_text(text: str, google_code: str) -> str:
    if not text or not text.strip():
        return text
    if google_code in _UNSUPPORTED_LANGS:
        return text
    from deep_translator import GoogleTranslator
    try:
        # Google Translate has a 5000 char limit per request
        if len(text) <= 4900:
            result = GoogleTranslator(source="en", target=google_code).translate(text)
            return result if result else text
        # Split long text into chunks
        chunks = []
        lines = text.split('\n')
        current = ""
        for line in lines:
            if len(current) + len(line) + 1 > 4900:
                chunks.append(current)
                current = line
            else:
                current = current + '\n' + line if current else line
        if current:
            chunks.append(current)
        translated_chunks = []
        for chunk in chunks:
            r = GoogleTranslator(source="en", target=google_code).translate(chunk)
            translated_chunks.append(r if r else chunk)
        return '\n'.join(translated_chunks)
    except Exception as e:
        err_msg = str(e).lower()
        if 'not supported' in err_msg or 'invalid' in err_msg:
            logger.warning(f"Language '{google_code}' not supported, skipping future attempts")
            _UNSUPPORTED_LANGS.add(google_code)
        else:
            logger.warning(f"Translation failed for '{google_code}': {e}")
        return text

def _get_google_code(lang: str) -> str | None:
    codes = {
        "hi": "hi", "te": "te", "ta": "ta", "kn": "kn", "ml": "ml",
        "mr": "mr", "bn": "bn", "gu": "gu", "pa": "pa", "or": "or",
        "as": "as", "ur": "ur", "sa": "sa", "ne": "ne", "sd": "sd", "mai": "mai",
    }
    return codes.get(lang)

def _get_mod_cache(lang: str) -> dict | None:
    p = MOD_CACHE_DIR / f"{lang}.json"
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except:
            return None
    return None

def _save_mod_cache(lang: str, data: dict):
    p = MOD_CACHE_DIR / f"{lang}.json"
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _ser(m):
    m["_id"] = str(m["_id"])
    code = m.get("code", m["_id"])
    for ti, topic in enumerate(m.get("topics") or []):
        for si, st in enumerate(topic.get("subTopics") or []):
            # Always assign a stable position-based ID so completion tracking
            # works regardless of language translations
            st["_id"] = f"{code}-T{ti}-S{si}"
    return m


def _translate_module(m: dict, lang: str, cache: dict) -> dict:
    """Translate title, description, topic titles, subtopic titles & content."""
    google_code = _get_google_code(lang)
    if not google_code:
        return m

    def _cached_translate(key: str, text: str) -> str:
        if key in cache:
            return cache[key]
        translated = _translate_text(text, google_code)
        cache[key] = translated
        return translated

    mid = m.get("code", m.get("_id", ""))
    m["title"] = _cached_translate(f"{mid}.title", m.get("title", ""))
    m["description"] = _cached_translate(f"{mid}.desc", m.get("description", ""))

    for ti, topic in enumerate(m.get("topics") or []):
        tk = f"{mid}.t{ti}"
        topic["title"] = _cached_translate(f"{tk}.title", topic.get("title", ""))
        for si, st in enumerate(topic.get("subTopics") or []):
            sk = f"{tk}.s{si}"
            st["title"] = _cached_translate(f"{sk}.title", st.get("title", ""))
            st["content"] = _cached_translate(f"{sk}.content", st.get("content", ""))
    return m


@router.get("/")
def get_modules(lang: str = "en"):
    db = get_db()
    modules = [_ser(dict(m)) for m in db["modules"].find().sort([("order", 1), ("code", 1)])]
    if lang and lang != "en":
        try:
            cache = _get_mod_cache(lang) or {}
            for m in modules:
                _translate_module(m, lang, cache)
            _save_mod_cache(lang, cache)
        except Exception as e:
            logger.error(f"Module translation failed for lang={lang}: {e}")
            # Return untranslated modules rather than failing
    return modules


@router.get("/user/{userId}")
def get_modules_with_progress(userId: str, lang: str = "en"):
    db = get_db()
    try:
        uid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = db["users"].find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    completed_sub = set(user.get("completedSubTopics") or [])
    completed_mod = set(str(x) for x in (user.get("completedModules") or []))

    cache = _get_mod_cache(lang) or {} if lang and lang != "en" else {}

    out = []
    for m in db["modules"].find().sort([("order", 1), ("code", 1)]):
        module_code = m.get("code", str(m["_id"]))
        module_sub_ids = []
        for ti, topic in enumerate(m.get("topics") or []):
            for si, st in enumerate(topic.get("subTopics") or []):
                sid = f"{module_code}-T{ti}-S{si}"
                module_sub_ids.append(sid)
        total = len(module_sub_ids)
        done = sum(1 for c in completed_sub if c in module_sub_ids)
        pct = round((done / total) * 100) if total else 0
        is_done = str(m["_id"]) in completed_mod
        serialized = _ser(dict(m))
        if lang and lang != "en":
            try:
                _translate_module(serialized, lang, cache)
            except Exception as e:
                logger.warning(f"Translation failed for module {serialized.get('code')}: {e}")
        out.append({
            **serialized,
            "progress": {"completedSubTopics": done, "totalSubTopics": total, "percentage": pct, "isCompleted": is_done},
        })

    if lang and lang != "en":
        try:
            _save_mod_cache(lang, cache)
        except Exception as e:
            logger.error(f"Failed to save module cache for lang={lang}: {e}")
    return out


@router.get("/{id}")
def get_module_by_id(id: str):
    db = get_db()
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    m = db["modules"].find_one({"_id": oid})
    if not m:
        raise HTTPException(status_code=404, detail="Module not found")
    return _ser(dict(m))
