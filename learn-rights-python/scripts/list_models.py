import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv()

def main():
    key = os.getenv("GOOGLE_AI_API_KEY")
    if not key:
        print("Set GOOGLE_AI_API_KEY in .env")
        return
    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        for m in genai.list_models():
            if "generateContent" in (m.supported_generation_methods or []):
                print(m.name, "-", getattr(m, "description", "") or "N/A")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
