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


def _get_google_model(system_instruction: str = None):
    if not GOOGLE_AI_API_KEY:
        raise ValueError("Google AI API key not configured")
    import google.generativeai as genai
    genai.configure(api_key=GOOGLE_AI_API_KEY)
    
    model_kwargs = {
        "model_name": GEMINI_MODEL,
        "generation_config": genai.GenerationConfig(
            max_output_tokens=2048,
            temperature=1.0, # Max variety
        )
    }
    
    if system_instruction:
        model_kwargs["system_instruction"] = system_instruction
        
    return genai.GenerativeModel(**model_kwargs)

    return context

def _get_keyword_context(message: str):
    """Search for relevant module context based on keywords in user message."""
    try:
        from app.database import get_db
        db = get_db()
        # Extract meaningful keywords
        words = re.findall(r'\w+', message.lower())
        common = {"the", "and", "rights", "legal", "what", "how", "india", "woman", "women", "help"}
        keywords = [w for w in words if w not in common and len(w) > 3]
        
        if not keywords:
            return ""
            
        # Search modules for matching keywords
        regex = "|".join(keywords)
        matched_mod = db["modules"].find_one({
            "$or": [
                {"title": {"$regex": regex, "$options": "i"}},
                {"description": {"$regex": regex, "$options": "i"}}
            ]
        })
        
        if matched_mod:
            return _get_module_context(matched_mod["code"])
    except Exception as e:
        print(f"Keyword Grounding Error: {e}")
    return ""

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
    has_audio = bool(getattr(body, "audioBase64", None) and body.audioBase64.strip())
    
    if not message and not has_image and not has_audio:
        raise HTTPException(status_code=400, detail="Message, image, or audio is required")
    
    lang_name = _get_lang_name(body.lang)
    
    # Build Grounding Context
    dynamic_context = (body.context or "General legal education and support for women in India")
    keyword_context = _get_keyword_context(message)
    if keyword_context:
        dynamic_context += f"\n\nRelevant Module Content for Grounding:\n{keyword_context}"
    
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
        
        default_system = (
            "You are LegalAid AI, a personalized smart tutor specializing in women's rights and laws in India. "
            "Provide detailed, well-structured, and descriptive answers. Use clear headings, bullet points, and numbered lists. "
            "Explain legal concepts simply. Always mention relevant Indian laws (Acts and Sections). "
            "Emergency contacts: Police 100, Women's Helpline 181, NCW Helpline 7827-170-170. "
            "Be empathetic, thorough, and organized."
        )
        
        base_system = db_system if db_system else default_system
        
        # CORE INSTRUCTION: Strict Language Adherence + Recent Legal Grounding + Context Prioritization
        system_instruction = (
            f"{base_system}\n\n"
            f"STRICT INSTRUCTION: YOU MUST RESPOND ENTIRELY IN {lang_name.upper()}. "
            "NEVER switch to English even for technical terms. Use the script of the target language for all content.\n\n"
            "CONTEXT PRIORITIZATION:\n"
            "1. Ground your response in the 'Context' provided (user progress and module summaries).\n"
            "2. If the user asks about their progress, streak, or points, use the 'Context' to answer accurately.\n"
            "3. If requested legal info is in 'Relevant Module Content', prioritize it over internal knowledge.\n\n"
            f"LEGAL GROUNDING (2024-2025 Updates):\n{RECENT_LEGAL_CONTEXT}\n\n"
            f"USER STATE:\n{dynamic_context}\n\n"
            "Style: Empathetic, thorough, and organized with clear headings."
        )
        
        model = _get_google_model(system_instruction=system_instruction)

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
        
        # Prepare parts for send_message (text + optional image/audio)
        content_parts = []
        if message:
            content_parts.append(message)
            
        if image_b64 and image_mime:
            import base64
            import io
            try:
                raw = base64.b64decode(image_b64, validate=True)
            except Exception:
                raw = base64.b64decode(image_b64)
            # Use PIL for safety/validation if available, or raw dict
            try:
                from PIL import Image
                img = Image.open(io.BytesIO(raw))
                content_parts.append(img)
            except Exception:
                content_parts.append({"mime_type": image_mime, "data": raw})
                
        if has_audio:
            import base64
            # We assume a common audio format like aac or wav from expo-audio
            audio_raw = base64.b64decode(body.audioBase64)
            content_parts.append({"mime_type": "audio/aac", "data": audio_raw})

        if not content_parts:
            content_parts.append("(User sent empty input)")
            
        response = chat.send_message(content_parts)
            
        text = (getattr(response, "text", None) or "").strip()
        if not text:
            raise ValueError("Empty AI response")
            
        # Add localized footer (Full 17-language coverage)
        footer_map = {
            "en": "\n\n---\nLegal Disclaimer: Educational information only. Consult an attorney for legal advice.\nWomen's Helpline: 181 | Police: 100",
            "hi": "\n\n---\nकानूनी अस्वीकरण: यह केवल शैक्षिक जानकारी है। व्यक्तिगत कानूनी सलाह के लिए वकील से परामर्श लें।\nमहिला हेल्पलाइन: 181 | पुलिस: 100",
            "te": "\n\n---\nన్యాయపరమైన నిరాకరణ: ఇది కేవలం విద్యా సమాచారం మాత్రమే. వ్యక్తిగత న్యాయ సలహా కోసం న్యాయవాదిని సంప్రదించండి.\nಮಹಿಳಾ ಹೆಲ್ಪ್‌ಲೈನ್: 181 | ಪೊಲೀಸ್: 100",
            "ta": "\n\n---\nசட்ட ரீதியான மறுப்பு: இது கல்வித் தகவல் மட்டுமே. தனிப்பட்ட சட்ட ஆலோசனைக்கு வழக்கறிஞரை அணுகவும்.\nபெண்கள் உதவி எண்: 181 | போலீஸ்: 100",
            "kn": "\n\n---\nಕಾನೂನು ಹಕ್ಕು ನಿರಾಕರಣೆ: ಇದು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮಾತ್ರ. ವೈಯಕ್ತಿಕ ಕಾನೂನು ಸಲಹೆಗಾಗಿ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.\nಮಹಿಳಾ ಸಹಾಯವಾಣಿ: 181 | ಪೊಲೀಸ್: 100",
            "ml": "\n\n---\nനിയമപരമായ നിരാകരണം: ഇത് വിദ്യാഭ്യാസപരമായ വിവരങ്ങൾ മാത്രമാണ്. വ്യക്തിപരമായ നിയമോപദേശത്തിനായി ഒരു വക്കീലിനെ സമീപിക്കുക.\nവനിതാ ഹെൽപ്‌ലൈൻ: 181 | പോലീസ്: 100",
            "mr": "\n\n---\nकायदेशीर अस्वीकरण: ही केवळ शैक्षणिक माहिती आहे. वैयक्तिक कायदेशीर सल्ल्यासाठी वकिलाचा सल्ला घ्या.\nमहिला हेल्पलाइन: 181 | पोलीस: 100",
            "bn": "\n\n---\nআইনি সতর্কতা: এটি শুধুমাত্র শিক্ষামূলক তথ্য। ব্যক্তিগত আইনি পরামর্শের জন্য একজন আইনজীবীর সাথে কথা বলুন।\nমহিলা হেল্পলাইন: 181 | পুলিশ: 100",
            "gu": "\n\n---\nકાનૂની અસ્વીકરણ: આ માત્ર શૈક્ષણિક માહિતી છે. વ્યક્તિગત કાનૂની સલાહ માટે વકીલનો સંપર્ક કરો.\nમહિલા હેલ્પલાઇન: 181 | પોલીસ: 100",
            "pa": "\n\n---\nਕਾਨੂੰਨੀ ਬੇਦਾਅਵਾ: ਇਹ ਸৰਫ ਵਿਦਿਅਕ ਜਾਣਕਾਰੀ ਹੈ। ਨਿੱਜੀ ਕਾਨੂੰਨੀ ਸਲਾਹ ਲਈ ਵਕੀਲ ਨਾਲ ਸਲਾਹ ਕਰੋ।\nਮਹਿਲਾ ਹੈਲਪਲਾਈਨ: 181 | ਪੁਲਿਸ: 100",
            "or": "\n\n---\nଆଇନଗତ ଅସ୍ୱୀକାର: ଏହା କେବଳ ଶିକ୍ଷାଗତ ସୂଚନା | ବ୍ୟକ୍ତିଗତ ଆଇନଗତ ପରାମର୍ଶ ପାଇଁ ଏକ ଓକିଲଙ୍କ ସହିତ ପରାମର୍ଶ କৰନ୍ତୁ |\nମହିଳା ହେଲ୍ପଲାଇନ: 181 | ପୋଲିସ: 100",
            "as": "\n\n---\nআইনী সতৰ্কবাণী: এইটো কেৱল শিক্ষামূলক তথ্য। ব্যক্তিগত আইনী পৰামৰ্শৰ বাবে এজন অধিবক্তাৰ সৈতে যোগাযোগ কৰক।\nমহিলা হেল্পলাইন: 181 | আৰক্ষী: 100",
            "ur": "\n\n---\nقانونی دستبرداری: یہ صرف تعلیمی معلومات ہے۔ ذاتی قانونی مشورے کے لیے کسی وکیل سے رجوع کریں۔\nخواتین کی ہیلپ لائن: 181 | پولیس: 100",
            "sa": "\n\n---\nविधिक-अस्वीकरणम्: इयं केवलं शैक्षणिकसूचना अस्ति। वयक्तिक-विधिक-परामर्शाय न्यायवादिनं मिलन्तु।\nमहिला-हेल्पलाइन: १८१ | आरक्षकः: १००",
            "ne": "\n\n---\nकानूनी अस्वीकरण: यो केवल शैक्षिक जानकारी हो। व्यक्तिगत कानूनी सल्लाहको लागि वकीलसँग परामर्श लिनुहोस्।\nमहिला हेल्पलाइन: १८१ | प्रहरी: १००",
            "sd": "\n\n---\nقانوني دستبرداري: هي صرف تعليمي معلومات آهي. ذاتي قانوني مشوري لاءِ وڪيل سان صلاح ڪريو.\nعورتن جي هيلپ لائن: 181 | پوليس: 100",
            "mai": "\n\n---\nकानूनी अस्वीकरण: ई केवल शैक्षिक जानकारी अछि। व्यक्तिगत कानूनी सलाहक लेल वकील सँ संपर्क करू।\nमहिला हेल्पलाइन: 181 | पुलिस: 100"
        }
        footer = footer_map.get(body.lang, footer_map["en"])
        
        return {"response": text + footer, "metadata": {"aiPowered": True, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "lang": body.lang}}
        
    except Exception as e:
        import traceback
        # Log error to file
        with open("ai_errors.txt", "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now()}] Chatbot Error: {str(e)}\n{traceback.format_exc()}\n\n")
            
        e_str = str(e).lower()
        if "429" in e_str or "quota" in e_str:
            return {"response": "Service busy (Limit reached). Please retry in 1 minute.", "metadata": {"aiPowered": False}}
            
        # Localized Fallbacks (Full 17-language coverage)
        fallbacks = {
            "en": "I specialize in Indian women's rights (DOMESTIC VIOLENCE, POSH, PROPERTY). Please ask your specific question. Helpline: 181",
            "hi": "नमस्ते, मैं महिलाओं के अधिकारों (हिंसा, संपत्ति, कार्यस्थल) में मदद कर सकती हूँ। कृपया अपना प्रश्न पूछें। हेल्पलाइन: 181",
            "te": "నమస్కారం, నేను మహిళల హక్కుల (ఆస్తి, పని ప్రదేశం, రక్షణ) గురించి మీకు సహాయం చేయగలను. దయచేసి మీ ప్రశ్న అడగండి. హెల్ప్‌లైన్: 181",
            "ta": "வணக்கம், நான் பெண்களின் உரிமைகள் (வன்முறை, சொத்து, வேலை இடம்) பற்றி உங்களுக்கு உதவ முடியும். தயவுசெய்து உங்கள் கேள்வியைக் கேளுங்கள். உதவி எண்: 181",
            "kn": "ನಮಸ್ಕಾರ, ನಾನು ಮಹಿಳೆಯರ ಹಕ್ಕುಗಳ (ಹಿಂಸೆ, ಆಸ್ತಿ, ಕೆಲಸದ ಸ್ಥಳ) ಬಗ್ಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ. ಸಹಾಯವಾಣಿ: 181",
            "ml": "നമസ്‌കാരം, സ്ത്രീകളുടെ അവകാശങ്ങളെക്കുറിച്ച് (അക്രമം, സ്വത്ത്, തൊഴിലിടം) എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും. ദയവായി നിങ്ങളുടെ ചോദ്യം ചോദിക്കുക. ഹെൽപ്‌ലൈൻ: 181",
            "mr": "नमस्कार, मी महिलांच्या हक्कांबद्दल (हिंसा, मालमत्ता, कामाची जागा) तुम्हाला मदत करू शकते. कृपया तुमचा प्रश्न विचारा. हेल्पलाइन: 181",
            "bn": "নমস্কার, আমি মহিলাদের অধিকার (হিংসা, সম্পত্তি, কর্মস্থল) সম্পর্কে আপনাকে সাহায্য করতে পারি। আপনার প্রশ্ন জিজ্ঞাসা করুন। হেল্পলাইন: 181",
            "gu": "નમસ્તે, હું મહિલાઓના અધિકારો (હિંસા, મિલકત, કાર્યસ્થળ) વિશે તમને મદદ કરી શકું છું. કૃપા કરીને તમારો પ્રશ્ન પૂછો. હેલ્પલાઈન: 181",
            "pa": "ਨਮਸਤੇ, ਮੈਂ ਮਹਿਲਾਵਾਂ ਦੇ ਅਧਿਕਾਰਾਂ (ਹਿੰਸਾ, ਜਾਇਦਾਦ, ਕੰਮ ਵਾਲੀ ਥਾਂ) ਬਾਰੇ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ। ਹੈਲਪਲਾਈਨ: 181",
            "or": "ନମସ୍କାର, ମୁଁ ମହିଳା ଅଧିକାର (ହିଂସା, ସମ୍ପତ୍ତି, କାର୍ଯ୍ୟସ୍ଥଳ) ବିଷୟରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି | ଦୟାକରି ଆପଣଙ୍କର ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ | ହେଲ୍ପଲାଇନ: 181",
            "as": "নমস্কাৰ, মই মহিলাৰ অধিকাৰ (হিংসা, সম্পত্তি, কৰ্মস্থলী) বিষয়ে আপোনাক সহায় কৰিব পাৰো। অনুগ্ৰহ কৰি আপোনাৰ প্ৰশ্ন সোধক। হেল্পলাইন: 181",
            "ur": "آداب، میں خواتین کے حقوق (تشدد، جائیداد، کام کی جگہ) کے بارے میں آپ کی مدد کر سکتی ہوں۔ براہ کرم اپنا سوال پوچھیں۔ ہیلپ لائن: 181",
            "sa": "नमस्ते, अहं महिलानां अधिकाराणाम् (हिंसा, सम्पत्तिः, कार्यस्थलम्) विषये साहाय्यं कर्तುं शक्नोमि। कृपया स्वप्रश्नं पृच्छतु। हेल्पलाइन: 181",
            "ne": "नमस्ते, म महिलाहरूको अधिकार (हिंसा, सम्पत्ति, कार्यस्थल) को बारेमा तपाईलाई मद्दत गर्न सक्छु। कृपया आफ्नो प्रश्न सोध्नुहोस्। हेल्पलाइन: 181",
            "sd": "سلام، مان عورتن جي حقن (تشدد، ملڪيت، ڪم جي جاءِ) بابت توهان جي مدد ڪري سگهان ٿو. مهرباني ڪري پنهنجو سوال پڇو. هيلپ لائين: 181",
            "mai": "नमस्ते, हम महिलाक अधिकार (हिंसा, संपत्ति, कार्यस्थल) क बारे में अहाँक मदद क सकय छी। कृपया अपन प्रश्न पूछू। हेल्पलाइन: 181"
        }
        return {"response": fallbacks.get(body.lang, fallbacks["en"]), "metadata": {"aiPowered": False, "error": True}}
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
        with open("ai_errors.txt", "a") as f:
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
