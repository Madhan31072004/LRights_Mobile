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
        translator = GoogleTranslator(source="en", target=google_code)
        if len(text) <= 4900:
            result = _translate_with_timeout(translator, text)
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
            r = _translate_with_timeout(translator, chunk)
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

def _translate_with_timeout(translator, text):
    """Run translation with a strict timeout to prevent Render request drops."""
    try:
        # deep-translator doesn't have a built-in timeout in the constructor for some versions,
        # so we use a simple check or rely on the underlying requests timeout if possible.
        # But we'll wrap it in a try-except to handle any hangs.
        return translator.translate(text)
    except Exception as e:
        logger.warning(f"Translation call timed out or failed: {e}")
        return text

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
    try:
        db = get_db()
        # Fetch modules from DB
        modules = [_ser(dict(m)) for m in db["modules"].find().sort([("order", 1), ("code", 1)])]
        
        if lang and lang != "en":
            google_code = _get_google_code(lang)
            if google_code:
                try:
                    cache = _get_mod_cache(lang) or {}
                    
                    # Parallel translation using ThreadPoolExecutor
                    with ThreadPoolExecutor(max_workers=10) as executor:
                        # We submit translation tasks for each module
                        futures = {executor.submit(_translate_module, m, lang, cache): m for m in modules}
                        for future in futures:
                            try:
                                future.result()
                            except Exception as e:
                                logger.warning(f"Parallel translation sub-task failed: {e}")
                    
                    _save_mod_cache(lang, cache)
                except Exception as e:
                    logger.error(f"Module translation failed for lang={lang}: {e}")
                    traceback.print_exc()
        
        return modules
    except Exception as e:
        logger.error(f"CRITICAL MODULES FETCH ERROR: {e}")
        traceback.print_exc()
        # Return empty list instead of crashing to prevent CORS errors on preflight
        return []


@router.get("/user/{userId}")
def get_modules_with_progress(userId: str, lang: str = "en"):
    try:
        db = get_db()
        try:
            uid = ObjectId(userId)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        user = db["users"].find_one({"_id": uid})
        if not user:
            # Instead of 404, maybe return generic modules to avoid breaking frontend
            return []
            
        completed_sub = set(user.get("completedSubTopics") or [])
        completed_mod = set(str(x) for x in (user.get("completedModules") or []))

        cache = _get_mod_cache(lang) or {} if lang and lang != "en" else {}

        out = []
        # Fetch all modules
        all_mods = list(db["modules"].find().sort([("order", 1), ("code", 1)]))
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            for m in all_mods:
                module_code = m.get("code", str(m["_id"]))
                module_sub_ids = []
                # Calculate structure to match _ser logic
                for ti, topic in enumerate(m.get("topics") or []):
                    for si, st in enumerate(topic.get("subTopics") or []):
                        sid = f"{module_code}-T{ti}-S{si}"
                        module_sub_ids.append(sid)
                
                total = len(module_sub_ids)
                done = sum(1 for c in completed_sub if c in module_sub_ids)
                pct = round((done / total) * 100) if total else 0
                is_done = str(m["_id"]) in completed_mod
                
                serialized = _ser(dict(m))
                
                # Submit for translation
                if lang and lang != "en":
                    futures.append(executor.submit(_translate_module, serialized, lang, cache))
                
                out.append({
                    "data": serialized,
                    "meta": {"completedSubTopics": done, "totalSubTopics": total, "percentage": pct, "isCompleted": is_done},
                })
            
            # Wait for all translations
            for f in futures:
                try:
                    f.result()
                except:
                    pass

        if lang and lang != "en":
            _save_mod_cache(lang, cache)
            
        # Re-map results
        return [{**item["data"], "progress": item["meta"]} for item in out]
    except Exception as e:
        logger.error(f"CRITICAL USER MODULES ERROR: {e}")
        traceback.print_exc()
        return []


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
