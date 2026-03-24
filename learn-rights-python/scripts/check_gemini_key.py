"""
Run this from the learn-rights-python folder to check if your Gemini API key works:
  python scripts/check_gemini_key.py
"""
import sys
from pathlib import Path

# Ensure project root is on path so app.config loads .env from learn-rights-python
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import GOOGLE_AI_API_KEY, GEMINI_MODEL

def main():
    print("Checking Gemini API key...")
    print(f"  GEMINI_MODEL = {GEMINI_MODEL}")
    key = (GOOGLE_AI_API_KEY or "").strip()
    if not key:
        print("  GOOGLE_AI_API_KEY is NOT set or empty.")
        print("  Create a file named .env in the learn-rights-python folder with:")
        print('    GOOGLE_AI_API_KEY=your_api_key_here')
        print("  Then run this script again.")
        return 1
    print(f"  GOOGLE_AI_API_KEY is set (length {len(key)} chars)")

    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_AI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content("Say OK in one word.")
        text = (response.text or "").strip()
        print(f"  Gemini response: {text[:80]}")
        print("  API key is working.")
        return 0
    except Exception as e:
        print(f"  Error: {e}")
        print("  Fix: Check that your API key is valid at https://aistudio.google.com/apikey")
        return 1

if __name__ == "__main__":
    sys.exit(main())
