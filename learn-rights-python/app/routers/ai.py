import os
import random
import time
import json
import re
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.schemas import AIChatbotBody, AIQuizBody
from app.config import GOOGLE_AI_API_KEY, GEMINI_MODEL
from app.routers import game_fallbacks

router = APIRouter()

CACHE_DIR = "cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def _get_cache_key(game_type, module_id, lang, seed=None):
    # Hourly cache for more variety, or use seed if provided
    time_key = datetime.now().strftime("%Y-%m-%d-%H")
    if seed:
        key = f"{game_type}_{module_id}_{lang}_{seed}.json"
        print(f"DEBUG: Using Seed Cache Key: {key}")
        return key
    key = f"{game_type}_{module_id}_{lang}_{time_key}.json"
    print(f"DEBUG: Using Hourly Cache Key: {key}")
    return key

def _get_daily_cache_key(game_type, module_id, lang):
    # Daily cache for stories (24h)
    time_key = datetime.now().strftime("%Y-%m-%d")
    key = f"{game_type}_{module_id}_{lang}_{time_key}.json"
    print(f"DEBUG: Using Daily Cache Key: {key}")
    return key

def _get_cached_questions(filename):
    path = os.path.join(CACHE_DIR, filename)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data
        except Exception as e:
            print(f"Cache Read Error: {e}")
            return None
    return None

def _save_cached_questions(filename, data):
    path = os.path.join(CACHE_DIR, filename)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Cache Save Error: {e}")

DAILY_THEMES = [
    "Workplace Rights & Safety", "Domestic Property & Inheritance", 
    "Family Law & Marriage", "Cyber Safety & Digital Rights",
    "Fundamental Rights & Police Procedures", "Labor Rights & Equal Pay",
    "Education & Maternity Benefits"
]

def _get_daily_theme():
    # Use day of year to pick a theme consistently for 24h
    day_of_year = datetime.now().timetuple().tm_yday
    return DAILY_THEMES[day_of_year % len(DAILY_THEMES)]

# Fallback responses when AI is unavailable (same as JS)
FALLBACK_QUESTIONS = {
    "domestic-violence": {
        "question": "Question: Under the Protection of Women from Domestic Violence Act, 2005, what types of abuse are considered domestic violence?\nA) Only physical abuse\nB) Physical, emotional, sexual, and economic abuse\nC) Only verbal arguments\nD) Only property damage\nCorrect Answer: B",
        "metadata": {"moduleId": "domestic-violence", "questionType": "factual", "fallback": True},
    },
    "workplace-harassment": {
        "question": "Question: What is the maximum time limit to file a complaint under the Sexual Harassment of Women at Workplace Act, 2013?\nA) 1 month\nB) 3 months\nC) 6 months\nD) 1 year\nCorrect Answer: B",
        "metadata": {"moduleId": "workplace-harassment", "questionType": "factual", "fallback": True},
    },
}

LANGUAGES = [{"code":"en","name":"English"},{"code":"hi","name":"Hindi"},{"code":"te","name":"Telugu"},{"code":"ta","name":"Tamil"},{"code":"kn","name":"Kannada"},{"code":"ml","name":"Malayalam"},{"code":"mr","name":"Marathi"},{"code":"bn","name":"Bengali"},{"code":"gu","name":"Gujarati"},{"code":"pa","name":"Punjabi"},{"code":"or","name":"Odia"},{"code":"as","name":"Assamese"},{"code":"ur","name":"Urdu"},{"code":"sa","name":"Sanskrit"},{"code":"ne","name":"Nepali"},{"code":"sd","name":"Sindhi"},{"code":"mai","name":"Maithili"}]

def _get_lang_name(code):
    return next((l["name"] for l in LANGUAGES if l["code"] == code), "English")

def _clean_ai_json(text):
    import re
    # Remove markdown blocks
    text = re.sub(r'```(?:json)?|```', '', text).strip()
    # Find the first '[' or '{' and last ']' or '}'
    match = re.search(r'(\[|\{{).*(\]|\}})', text, re.DOTALL)
    if match:
        return match.group(0)
    return text


def _get_google_model():
    if not GOOGLE_AI_API_KEY:
        raise ValueError("Google AI API key not configured")
    import google.generativeai as genai
    genai.configure(api_key=GOOGLE_AI_API_KEY)
    return genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config=genai.GenerationConfig(
            max_output_tokens=2048,
            temperature=1.0,  # Max variety
        ),
    )

def _get_module_context(module_id: str):
    """Fetch module info from DB for grounding."""
    from app.database import get_db
    db = get_db()
    mod = db["modules"].find_one({"code": module_id})
    if not mod:
        # Try finding by topic title if code not found
        mod = db["modules"].find_one({"title": {"$regex": module_id, "$options": "i"}})
    
    if not mod:
        print(f"DEBUG: No module found for grounding: {module_id}")
        return ""
    
    context = f"Module: {mod.get('title')}\nDescription: {mod.get('description')}\n"
    print(f"DEBUG: Grounding Module Found: {mod.get('title')}")
    topics = mod.get("topics", [])
    if topics:
        # Pick 2 random topics for variety
        sampled = random.sample(topics, min(len(topics), 2))
        for t in sampled:
            context += f"Topic: {t.get('title')}\n"
            subtopics = t.get("subTopics", [])
            if subtopics:
                st = random.choice(subtopics)
                context += f"SubTopic: {st.get('title')}\nContent: {st.get('content')[:500]}\n"
    return context

RECENT_LEGAL_CONTEXT = """
RECENT UPDATES (2024-2025):
- New Labor Codes (implemented Nov 2025) replace 29 old laws.
- Women legally permitted in ALL job roles, including night shifts and mining (with safety measures).
- Mandatory "Equal Pay for Equal Work" for all genders, including transgender persons.
- Work-from-home recognized as a legal right in many service sectors.
- Maternity leave: 26 weeks paid leave for eligible employees; 12 weeks for adoptive mothers.
- Social Security extended to gig/platform/unorganized workers for the first time.
- Businesses with 20+ workers must include women in grievance committees.
"""


@router.get("/check-key")
def check_api_key():
    """Check if GOOGLE_AI_API_KEY is set and if it works with Gemini. Call this to verify your .env."""
    key = (GOOGLE_AI_API_KEY or "").strip()
    if not key:
        return {
            "configured": False,
            "working": False,
            "message": "GOOGLE_AI_API_KEY is not set. Add it to your .env file in the learn-rights-python folder.",
        }
    try:
        model = _get_google_model()
        response = model.generate_content("Reply with exactly: OK")
        text = (getattr(response, "text", None) or "").strip()
        if "OK" in text or text:
            return {"configured": True, "working": True, "message": "API key is valid. Chatbot should work."}
        return {"configured": True, "working": False, "message": "API key responded but with unexpected result."}
    except Exception as e:
        err = str(e)
        return {
            "configured": True,
            "working": False,
            "message": "API key is set but Gemini returned an error.",
            "error": err[:200],
        }


@router.post("/quiz")
def generate_quiz(body: AIQuizBody):
    if not body.moduleId or not body.moduleId.strip():
        raise HTTPException(status_code=400, detail="moduleId is required and must be a non-empty string")
    if not isinstance(body.userProgress, dict):
        raise HTTPException(status_code=400, detail="userProgress is required and must be an object")
    try:
        model = _get_google_model()
        seed = random.randint(0, 999999)
        qtype = random.choice(["factual", "conceptual", "application", "analysis"])
        lang_name = _get_lang_name(body.lang)
        prompt = f'''You are an expert legal educator creating quiz questions for women's legal rights education in India.
Generate ONE unique {qtype} multiple-choice question for the legal education module "{body.moduleId.strip()}".
THE QUESTION AND ALL OPTIONS MUST BE ENTIRELY IN {lang_name.upper()}.
Make it different from typical questions - focus on practical application and real-world scenarios.
Format exactly as shown:
Question: [Your question]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
Correct Answer: [Single letter A, B, C, or D]
Additional Context: seed={seed}-{int(time.time())}'''
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        if not text:
            raise ValueError("Empty response")
        return {
            "question": text,
            "metadata": {"moduleId": body.moduleId.strip(), "questionType": qtype, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "seed": f"{seed}-{int(time.time())}"},
        }
    except Exception as e:
        print(f"AI Quiz Generation Error: {e}")
        fallback = FALLBACK_QUESTIONS.get(body.moduleId) or {
            "question": "Question: What is the primary objective of women's legal rights education?\nA) To create dependency on legal system\nB) To empower women with knowledge of their rights\nC) To increase legal disputes\nD) To discourage women from seeking justice\nCorrect Answer: B",
            "metadata": {"moduleId": body.moduleId or "general", "questionType": "conceptual", "fallback": True},
        }
        fallback["metadata"]["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return fallback


def _parse_base64_image(data_url_or_base64: str):
    """Accept data URL (data:image/...;base64,...) or raw base64; return (base64_str, mime_type)."""
    s = (data_url_or_base64 or "").strip()
    if not s:
        return None, None
    if s.startswith("data:"):
        # data:image/jpeg;base64,xxxx
        parts = s.split(",", 1)
        if len(parts) != 2:
            return None, None
        header = parts[0].lower()
        mime = "image/jpeg"
        if "image/png" in header:
            mime = "image/png"
        elif "image/webp" in header:
            mime = "image/webp"
        return parts[1].strip(), mime
    return s, "image/jpeg"


@router.post("/chatbot")
def chatbot(body: AIChatbotBody):
    message = (body.message or "").strip()[:1000]
    has_image = bool(body.imageBase64 and (body.imageBase64.strip() if isinstance(body.imageBase64, str) else True))
    if not message and not has_image:
        raise HTTPException(status_code=400, detail="Message or image is required")
    context = (body.context or "General legal education and support for women in India")
    # Normalize image: support data URL or raw base64 from frontend
    image_b64, image_mime = None, None
    if body.imageBase64:
        image_b64, image_mime = _parse_base64_image(body.imageBase64)
        image_mime = body.imageMimeType or image_mime or "image/jpeg"
    if image_b64 and not image_mime:
        image_mime = "image/jpeg"
    if not message and image_b64:
        message = "(user sent an image)"

    try:
        from app.database import get_db
        db = get_db()
        settings = db["settings"].find_one({"type": "bot"})
        db_system = settings.get("systemPrompt") if settings else None
        
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        
        default_system = (
            "You are LegalAid AI, a personalized smart tutor specializing in women's rights and laws in India. "
            "Provide detailed, well-structured, and descriptive answers. Use clear headings, bullet points, and numbered lists. "
            "Explain legal concepts simply. Always mention relevant Indian laws (Acts and Sections). "
            "Include practical steps and relevant helpline numbers. "
            "Emergency contacts: Police 100, Women's Helpline 181, NCW Helpline 7827-170-170. "
            "Be empathetic, thorough, and organized."
        )
        
        base_system = db_system if db_system else default_system
        system = f"{base_system}\n\nYOU MUST RESPOND ENTIRELY IN {lang_name.upper()}. Use the provided 'Context' to understand the user's learning progress."

        hist = []
        if body.history and isinstance(body.history, list):
            for item in body.history[-12:]:
                try:
                    sender = (item.get("sender") or "").lower()
                    text = str(item.get("text") or "").strip()
                    if not text:
                        continue
                    role = "user" if sender == "user" else "model"
                    hist.append({"role": role, "parts": [text[:1500]]})
                except Exception:
                    continue

        chat = model.start_chat(history=hist)
        user_content = f"{system}\n\nContext: {context}\n\nUser: {message or '(no text, see image)'}"
        if image_b64 and image_mime:
            import base64
            import io
            try:
                raw = base64.b64decode(image_b64, validate=True)
            except Exception:
                raw = base64.b64decode(image_b64)
            try:
                from PIL import Image
                img = Image.open(io.BytesIO(raw))
                response = chat.send_message([img, user_content])
            except Exception:
                image_part = {"mime_type": image_mime, "data": raw}
                response = chat.send_message([image_part, user_content])
        else:
            response = chat.send_message(user_content)
        text = (getattr(response, "text", None) or "").strip()
        if not text:
            raise ValueError("Empty AI response")
        enhanced = (
            text
            + "\n\n---\n"
            + "Legal Disclaimer: This is educational information only. For personalized legal advice consult a qualified attorney.\n"
            + "Women's Helpline: 181 | Police: 100 | Ambulance: 108"
        )
        return {"response": enhanced, "metadata": {"aiPowered": True, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "disclaimer": "Educational information only"}}
    except Exception as e:
        import traceback
        traceback.print_exc()
        e_str = str(e).lower()
        if "429" in e_str or "quota" in e_str or "exhausted" in e_str:
            return {"response": "The AI service is currently busy (Rate Limit). Please wait a few seconds and try again.", "metadata": {"aiPowered": False}}
        lower = message.lower()
        if "emergency" in lower or "danger" in lower or "help me" in lower or "hurt" in lower or "unsafe" in lower:
            return {"response": "EMERGENCY: Call Police 100, Women's Helpline 181 (24/7), Ambulance 108. Go to a safe place and contact authorities.", "metadata": {"aiPowered": False}}
        if "domestic violence" in lower or "abuse" in lower:
            return {"response": "Under PWDVA 2005, domestic violence includes physical, emotional, sexual, economic abuse. You can get protection orders. Call 181 for help. This is educational only.", "metadata": {"aiPowered": False}}
        if "workplace" in lower or "harassment" in lower or "posh" in lower:
            return {"response": "POSH Act 2013 protects against sexual harassment at work. File complaint with Internal Complaints Committee within 3 months. This is educational only.", "metadata": {"aiPowered": False}}
        return {"response": "I specialize in women's rights in India (domestic violence, workplace harassment, marriage, property). Please share your specific question. Helpline: 181.", "metadata": {"aiPowered": False}}
@router.post("/game/match")
def generate_match_game(body: AIQuizBody):
    """Generate 4 card pairs (Right + Description) for Rights Match game with hourly caching."""
    seed = body.seed
    cache_file = _get_cache_key("match", body.moduleId or "general", body.lang, seed)
    cached = _get_cached_questions(cache_file)
    if cached:
        return cached

    try:
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        theme = _get_daily_theme()
        mod_context = _get_module_context(body.moduleId)
        
        prompt = f'''You are a lead legal educator in India. Generate exactly 6 pairs of matched cards for a "Rights Match" education game.
THE CONTENT MUST BE ENTIRELY IN {lang_name.upper()}.
Focus Topic/Module: {body.moduleId}.
{mod_context}

{RECENT_LEGAL_CONTEXT}

Instructions:
1. Generate 6 unique rights/concepts and their concise 1-sentence descriptions.
2. Use specific details from the Module Context and Recent Updates provided above.
3. Keep descriptions punchy and distinct.
4. Random Variety Seed: {random.randint(0, 999999)}
5. Format as a pure JSON list of objects:
[
  {{"right": "Right/Section Name", "desc": "Simple explanation"}},
  ...
]
Return ONLY the raw JSON list.'''
        
        response = model.generate_content(prompt)
        text = _clean_ai_json(response.text.strip())
        import json
        data = json.loads(text)
        
        # Transform for frontend use
        cards = []
        for i, item in enumerate(data[:6]):
            match_id = 100 + i
            cards.append({"id": i + 1, "type": "right", "content": item["right"], "matchId": match_id})
            cards.append({"id": match_id, "type": "desc", "content": item["desc"], "matchId": i + 1})
            
        # We skip saving to hourly cache for match game to keep it fresh every load
        return cards
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        with open("c:/Users/madha/Desktop/LearnRights-main/ai_errors.txt", "a") as f:
            f.write(f"\n--- {datetime.now()} ---\n{err_msg}\n")
        print(f"AI Match Generation Error: {e}")
        return game_fallbacks.get_match_fallback(body.moduleId)

@router.post("/game/scenario")
def generate_scenario_game(body: AIQuizBody):
    """Generate 3 legal detective scenarios with hourly caching."""
    seed = body.seed
    cache_file = _get_cache_key("scenario", body.moduleId or "general", body.lang, seed)
    cached = _get_cached_questions(cache_file)
    if cached:
        return cached

    try:
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        theme = _get_daily_theme()
        mod_context = _get_module_context(body.moduleId)
        
        prompt = f'''You are creating "Legal Detective" scenarios for an educational app in India. 
Generate exactly 3 interactive scenarios where a woman faces a legal challenge.
THE CONTENT MUST BE ENTIRELY IN {lang_name.upper()}.
Context: {body.moduleId}
{mod_context}

{RECENT_LEGAL_CONTEXT}

Format: JSON list of 3 objects. 
Options must include 1 BEST (50 pts), 1 OKAY (10 pts), and 1 INCORRECT (0 pts).
Feedback must explain the legal reason based on Acts or Sections.
Random Seed: {random.randint(0, 999999)}
Return ONLY raw JSON.'''
        response = model.generate_content(prompt)
        text = _clean_ai_json(response.text.strip())
        import json
        data = json.loads(text)
        _save_cached_questions(cache_file, data)
        return data
    except Exception as e:
        print(f"AI Scenario Generation Error: {e}")
        return game_fallbacks.get_scenario_fallback(body.moduleId)

@router.post("/game/lightning-quiz")
def generate_lightning_quiz(body: AIQuizBody):
    """Generate 5 quick lightning quiz questions with hourly caching."""
    seed = body.seed
    cache_file = _get_cache_key("lightning", body.moduleId or "general", body.lang, seed)
    cached = _get_cached_questions(cache_file)
    if cached:
        return cached

    try:
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        mod_context = _get_module_context(body.moduleId)
        
        prompt = f'''Generate 5 fast legal trivia questions for India.
THE CONTENT MUST BE ENTIRELY IN {lang_name.upper()}.
Topic: {body.moduleId}
{mod_context}
{RECENT_LEGAL_CONTEXT}

Each question must be challenging. Provide 4 options and the 0-indexed correct answer.
Variety Seed: {random.randint(0, 999999)}
Return ONLY raw JSON.'''
        response = model.generate_content(prompt)
        text = _clean_ai_json(response.text.strip())
        import json
        data = json.loads(text)
        _save_cached_questions(cache_file, data)
        return data
    except Exception as e:
        print(f"AI Lightning Quiz Error: {e}")
        return game_fallbacks.get_quiz_fallback(body.moduleId)

@router.post("/stories/generate")
def generate_inspiring_stories(body: AIQuizBody):
    """Generate 3 unique inspiring stories with 24h caching."""
    cache_file = _get_daily_cache_key("stories", "general", body.lang)
    cached = _get_cached_questions(cache_file)
    if cached:
        return cached

    try:
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        
        prompt = f'''Generate exactly 3 unique "Inspiring Stories" about legal pioneers, activists, or landmark cases regarding women's rights and social justice.
THE CONTENT MUST BE ENTIRELY IN {lang_name.upper()}.
Instructions:
1. Focus on diverse figures.
2. Format as a JSON list of objects:
[
  {{
    "title": "Story Title",
    "author": "Author Name/Title",
    "excerpt": "Short hook text",
    "content": "Full detailed story content...",
    "category": "Legal Rights",
    "color": "#7c3aed",
    "imageSearchQuery": "search query"
  }}
]
Return ONLY raw JSON. Theme: {random.randint(0, 9999)}'''

        response = model.generate_content(prompt)
        text = _clean_ai_json(response.text.strip())
        import json
        stories_data = json.loads(text)
        
        processed = []
        import time
        for i, s in enumerate(stories_data[:3]):
            processed.append({
                "_id": f"ai_{int(time.time())}_{i}",
                "title": s["title"],
                "author": s["author"],
                "excerpt": s["excerpt"],
                "content": s["content"],
                "category": s["category"],
                "color": s.get("color", "#ec4899"),
                "imageUrl": f"https://source.unsplash.com/800x600/?{s.get('imageSearchQuery', 'legal')}",
                "lang": body.lang,
                "aiGenerated": True
            })
        _save_cached_questions(cache_file, processed)
        return processed
    except Exception as e:
        print(f"Error generating AI stories: {e}")
        return []
@router.post("/game/explain")
def explain_game_result(body: AIChatbotBody):
    """Provide a detailed legal explanation for a specific game question and user answer."""
    try:
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        
        # We expect the 'message' to contain the Question + User Answer + Correct Answer
        prompt = f'''You are a LegalAid AI Coach. A user just answered a legal quiz question.
THE RESPONSE MUST BE ENTIRELY IN {lang_name.upper()}.
Context: {body.message}
Instructions:
1. Explain why the correct answer is right and why other options might be misleading.
2. Provide deep legal context (Sections, Acts, landmark cases).
3. Use a supportive, educational, and empowering tone.
4. Keep the explanation concise but thorough (2-3 short paragraphs).
4. Keep the explanation concise but thorough (2-3 short paragraphs).
Return only the explanation text.'''

        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        return {"explanation": text}
    except Exception as e:
        return {"explanation": "I'm sorry, I couldn't generate a detailed explanation right now. Remember to always consult the relevant legal acts for precise information."}

@router.post("/game/challenge")
def generate_weekly_challenge(body: AIQuizBody):
    """Generate 5 advanced questions for the daily/weekly challenge with 24h caching."""
    cache_file = _get_daily_cache_key("challenge", "advanced", body.lang)
    cached = _get_cached_questions(cache_file)
    if cached:
        return cached

    try:
        model = _get_google_model()
        lang_name = _get_lang_name(body.lang)
        theme = _get_daily_theme()
        
        prompt = f'''You are a strict legal examiner. Create an advanced quiz with exactly 5 questions on Women's Legal Rights in India.
THE CONTENT MUST BE ENTIRELY IN {lang_name.upper()}.
Theme: {theme}.
Format as a JSON list:
[
  {{
    "question": "The question...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "Exact text of correct option",
    "explanation": "Legal citation..."
  }}
]
Return ONLY raw JSON.'''

        response = model.generate_content(prompt)
        text = _clean_ai_json(response.text.strip())
        import json
        questions = json.loads(text)
        
        formatted = []
        for q in questions[:5]:
             formatted.append({
                 "question": q.get("question", "Unknown"),
                 "options": q.get("options", []),
                 "correctAnswer": q.get("correctAnswer", ""),
                 "explanation": q.get("explanation", "Provided by LegalAid AI."),
                 "difficulty": "Hard"
             })
             
        _save_cached_questions(cache_file, formatted)
        return formatted
    except Exception as e:
        print(f"AI Challenge Error: {e}")
        return [
             {
                 "question": "Under the POSH Act, what is the timeline to file a complaint?",
                 "options": ["3 months", "6 months", "1 year", "No limit"],
                 "correctAnswer": "3 months",
                 "explanation": "Section 9 of POSH Act requires filing within 3 months, extendable by another 3 if reasons exist.",
                 "difficulty": "Hard"
             }
        ]
@router.get("/game/cache/status")
def get_cache_status():
    """Return the number of files in the AI cache."""
    try:
        files = os.listdir(CACHE_DIR)
        return {"count": len(files), "files": files}
    except Exception as e:
        return {"count": 0, "error": str(e)}

@router.post("/game/cache/clear")
def clear_cache():
    """Clear all files in the AI cache directory."""
    try:
        files = os.listdir(CACHE_DIR)
        for f in files:
            os.remove(os.path.join(CACHE_DIR, f))
        return {"success": True, "cleared_count": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")
