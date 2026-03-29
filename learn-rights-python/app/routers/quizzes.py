import random
import time
import json
import copy
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from pymongo import ReturnDocument

from app.database import get_db
from app.deps import require_auth
from app.quiz_data import QUESTION_BANK
from app.config import GOOGLE_AI_API_KEY, GEMINI_MODEL

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


# ── Language helpers ──────────────────────────────────────────────────
LANGUAGES = [
    {"code":"en","name":"English"},{"code":"hi","name":"Hindi"},{"code":"te","name":"Telugu"},
    {"code":"ta","name":"Tamil"},{"code":"kn","name":"Kannada"},{"code":"ml","name":"Malayalam"},
    {"code":"mr","name":"Marathi"},{"code":"bn","name":"Bengali"},{"code":"gu","name":"Gujarati"},
    {"code":"pa","name":"Punjabi"},{"code":"or","name":"Odia"},{"code":"as","name":"Assamese"},
    {"code":"ur","name":"Urdu"},{"code":"sa","name":"Sanskrit"},{"code":"ne","name":"Nepali"},
    {"code":"sd","name":"Sindhi"},{"code":"mai","name":"Maithili"}
]

def _get_lang_name(code):
    return next((l["name"] for l in LANGUAGES if l["code"] == code), "English")


def _clean_ai_json(text):
    import re
    text = re.sub(r'```(?:json)?|```', '', text).strip()
    match = re.search(r'(\[|\{).*(]|})', text, re.DOTALL)
    if match:
        return match.group(0)
    return text


def _get_module_content_summary(module: dict) -> str:
    """Extract a summary of module content for AI quiz generation."""
    parts = []
    parts.append(f"Module Title: {module.get('title', 'Unknown')}")
    parts.append(f"Module Code: {module.get('code', 'Unknown')}")
    if module.get('description'):
        parts.append(f"Description: {module['description']}")
    
    for ti, topic in enumerate(module.get("topics") or []):
        parts.append(f"\nTopic {ti+1}: {topic.get('title', '')}")
        for si, st in enumerate(topic.get("subTopics") or []):
            parts.append(f"  Subtopic: {st.get('title', '')}")
            content = st.get('content', '')
            if content:
                # Take first 500 chars of content for context
                parts.append(f"  Content: {content[:500]}...")
    
    return "\n".join(parts)


def _generate_ai_quiz(module: dict, lang: str = "en", num_questions: int = 8) -> list:
    """Use Gemini AI to generate quiz questions based on module content."""
    if not GOOGLE_AI_API_KEY:
        logger.warning("No Google AI API key configured, cannot generate AI quiz")
        return []
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_AI_API_KEY)
        
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=genai.GenerationConfig(
                max_output_tokens=4096,
                temperature=0.9,
            )
        )
        
        lang_name = _get_lang_name(lang)
        module_summary = _get_module_content_summary(module)
        seed = random.randint(0, 999999)
        
        prompt = f"""You are an expert legal educator creating quiz questions for women's legal rights education in India.

MODULE CONTENT TO BASE QUESTIONS ON:
{module_summary}

INSTRUCTIONS:
1. Generate exactly {num_questions} multiple-choice questions based STRICTLY on the module content above.
2. Each question must have exactly 4 options.
3. Questions should cover different topics/subtopics from the module.
4. Mix question types: factual recall, practical application, scenario-based, and conceptual understanding.
5. {"THE QUESTIONS AND ALL OPTIONS MUST BE ENTIRELY IN " + lang_name.upper() + "." if lang != "en" else "Write in English."}
6. Make questions educational and empowering.
7. Vary difficulty: include some easy, medium, and hard questions.

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation.
Format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }}
]

The "correctAnswer" field must be the 0-indexed position of the correct option.
Random seed for variety: {seed}-{int(time.time())}

Return ONLY the raw JSON array."""

        response = model.generate_content(prompt)
        text = (getattr(response, "text", None) or "").strip()
        
        if not text:
            logger.warning("Empty response from Gemini for quiz generation")
            return []
        
        cleaned = _clean_ai_json(text)
        questions = json.loads(cleaned)
        
        if not isinstance(questions, list) or len(questions) == 0:
            logger.warning("AI returned invalid quiz format")
            return []
        
        # Validate and normalize each question
        validated = []
        t_ms = int(time.time() * 1000)
        for i, q in enumerate(questions[:num_questions]):
            if not q.get("question") or not q.get("options") or len(q.get("options", [])) < 2:
                continue
            correct = q.get("correctAnswer", 0)
            if not isinstance(correct, int) or correct < 0 or correct >= len(q["options"]):
                correct = 0
            validated.append({
                "question": q["question"],
                "options": q["options"][:4],
                "correctAnswer": correct,
                "marks": 10,
                "_id": f"ai-question-{t_ms}-{i}",
            })
        
        logger.info(f"AI generated {len(validated)} quiz questions for module {module.get('code', 'unknown')}")
        return validated
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI quiz JSON: {e}")
        return []
    except Exception as e:
        logger.error(f"AI quiz generation failed: {e}")
        return []


def generate_quiz_questions(module, lang="en"):
    """Generate quiz questions: try AI first, fallback to static question bank."""
    code = module.get("code", "")
    
    # Strategy 1: Try AI-generated questions (fresh every time)
    ai_questions = _generate_ai_quiz(module, lang=lang)
    if ai_questions and len(ai_questions) >= 4:
        logger.info(f"Using AI-generated quiz for module {code}")
        return ai_questions
    
    # Strategy 2: Fallback to static question bank
    logger.info(f"Falling back to static question bank for module {code}")
    module_questions = QUESTION_BANK.get(code, [])
    if not module_questions:
        # fallback: try matching by title
        title = (module.get("title") or "").strip()
        module_questions = QUESTION_BANK.get(title, [])
    
    if module_questions:
        shuffled = list(module_questions)
        random.shuffle(shuffled)
        selected = copy.deepcopy(shuffled[:8])
        t = int(time.time() * 1000)
        questions = [{**q, "marks": 10, "_id": f"question-{t}-{i}"} for i, q in enumerate(selected)]
        # translate if needed
        if lang and lang != "en":
            questions = _translate_questions(questions, code, lang)
        return questions
    
    # Strategy 3: If both fail, try AI one more time with English
    if lang != "en":
        ai_questions_en = _generate_ai_quiz(module, lang="en")
        if ai_questions_en and len(ai_questions_en) >= 4:
            if lang != "en":
                ai_questions_en = _translate_questions(ai_questions_en, code, lang)
            return ai_questions_en
    
    return []


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
        raise HTTPException(status_code=500, detail="Failed to generate quiz questions. Please try again.")
    dynamic_quiz = {
        "_id": f"dynamic-{moduleId}-{int(time.time()*1000)}",
        "moduleId": moduleId,
        "title": f"{module.get('title', '')} Quiz",
        "questions": questions,
        "passMarks": (len(questions) * 60 + 99) // 100,
        "totalMarks": len(questions) * 10,
        "isDynamic": True,
        "aiGenerated": True,
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
