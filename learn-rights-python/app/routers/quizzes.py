import random
import time
import json
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from pymongo import ReturnDocument

from app.database import get_db
from app.deps import require_auth
from app.quiz_data import QUESTION_BANK

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Quiz translation helpers ──────────────────────────────────────────
QUIZ_CACHE_DIR = Path(__file__).resolve().parent.parent / "translation_cache" / "quizzes"
QUIZ_CACHE_DIR.mkdir(parents=True, exist_ok=True)

_UNSUPPORTED_LANGS = set()

def _get_google_code(lang: str):
    codes = {
        "hi": "hi", "te": "te", "ta": "ta", "kn": "kn", "ml": "ml",
        "mr": "mr", "bn": "bn", "gu": "gu", "pa": "pa", "or": "or",
        "as": "as", "ur": "ur", "sa": "sa", "ne": "ne", "sd": "sd", "mai": "mai",
    }
    return codes.get(lang)

def _translate_text(text: str, google_code: str) -> str:
    if not text or not text.strip():
        return text
    if google_code in _UNSUPPORTED_LANGS:
        return text
    from deep_translator import GoogleTranslator
    try:
        result = GoogleTranslator(source="en", target=google_code).translate(text[:4900])
        return result if result else text
    except Exception as e:
        err_msg = str(e).lower()
        if 'not supported' in err_msg or 'invalid' in err_msg:
            _UNSUPPORTED_LANGS.add(google_code)
        logger.warning(f"Quiz translation failed for '{google_code}': {e}")
        return text

def _get_quiz_cache(lang: str):
    p = QUIZ_CACHE_DIR / f"{lang}.json"
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except:
            return {}
    return {}

def _save_quiz_cache(lang: str, data: dict):
    p = QUIZ_CACHE_DIR / f"{lang}.json"
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def _translate_questions(questions: list, module_code: str, lang: str) -> list:
    """Translate question text and options to the target language."""
    google_code = _get_google_code(lang)
    if not google_code:
        return questions
    cache = _get_quiz_cache(lang)
    try:
        for i, q in enumerate(questions):
            qk = f"{module_code}.q{i}"
            # translate question
            ckey_q = f"{qk}.question"
            if ckey_q in cache:
                q["question"] = cache[ckey_q]
            else:
                translated = _translate_text(q["question"], google_code)
                cache[ckey_q] = translated
                q["question"] = translated
            # translate each option
            new_opts = []
            for j, opt in enumerate(q.get("options", [])):
                ckey_o = f"{qk}.opt{j}"
                if ckey_o in cache:
                    new_opts.append(cache[ckey_o])
                else:
                    translated = _translate_text(opt, google_code)
                    cache[ckey_o] = translated
                    new_opts.append(translated)
            q["options"] = new_opts
        _save_quiz_cache(lang, cache)
    except Exception as e:
        logger.error(f"Quiz translation error: {e}")
    return questions


def generate_quiz_questions(module, lang="en"):
    code = module.get("code", "")
    module_questions = QUESTION_BANK.get(code, [])
    if not module_questions:
        # fallback: try matching by title
        title = (module.get("title") or "").strip()
        module_questions = QUESTION_BANK.get(title, [])
    shuffled = list(module_questions)
    random.shuffle(shuffled)
    # pick 8 questions (or all if fewer)
    import copy
    selected = copy.deepcopy(shuffled[:8])
    t = int(time.time() * 1000)
    questions = [{**q, "marks": 10, "_id": f"question-{t}-{i}"} for i, q in enumerate(selected)]
    # translate if needed
    if lang and lang != "en":
        questions = _translate_questions(questions, code, lang)
    return questions


@router.get("/", dependencies=[Depends(require_auth)])
def get_all_quizzes():
    db = get_db()
    quizzes = list(db["quizzes"].find())
    for q in quizzes:
        q["_id"] = str(q["_id"])
    return quizzes


@router.get("/module", dependencies=[Depends(require_auth)])
def get_quiz_by_module_id(moduleId: str = Query(...), lang: str = Query("en"), user_id: str = Depends(require_auth)):
    db = get_db()
    try:
        mid = ObjectId(moduleId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid module ID")

    # ── Security: user must have completed all subtopics in this module ──
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if user:
        completed_mods = [str(x) for x in (user.get("completedModules") or [])]
        if moduleId not in completed_mods:
            raise HTTPException(
                status_code=403,
                detail="You must complete all subtopics in this module before taking the quiz."
            )

    module = db["modules"].find_one({"_id": mid})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    questions = generate_quiz_questions(module, lang=lang)
    if not questions:
        raise HTTPException(status_code=500, detail="Failed to generate quiz questions")
    dynamic_quiz = {
        "_id": f"dynamic-{moduleId}-{int(time.time()*1000)}",
        "moduleId": moduleId,
        "title": f"{module.get('title', '')} Quiz",
        "questions": questions,
        "passMarks": (len(questions) * 60 + 99) // 100,
        "totalMarks": len(questions) * 10,
        "isDynamic": True,
    }
    return [dynamic_quiz]


@router.get("/{id}", dependencies=[Depends(require_auth)])
def get_quiz_by_id(id: str):
    db = get_db()
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    q = db["quizzes"].find_one({"_id": oid})
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    q["_id"] = str(q["_id"])
    return q


@router.post("/", dependencies=[Depends(require_auth)])
def create_quiz(body: dict):
    db = get_db()
    r = db["quizzes"].insert_one(body)
    body["_id"] = str(r.inserted_id)
    return body


@router.put("/{id}", dependencies=[Depends(require_auth)])
def update_quiz(id: str, body: dict):
    db = get_db()
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    q = db["quizzes"].find_one_and_update({"_id": oid}, {"$set": body}, return_document=ReturnDocument.AFTER)
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    q["_id"] = str(q["_id"])
    return q


@router.delete("/{id}", dependencies=[Depends(require_auth)])
def delete_quiz(id: str):
    db = get_db()
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    r = db["quizzes"].delete_one({"_id": oid})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"message": "Quiz deleted"}
