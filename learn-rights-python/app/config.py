"""Configuration - load from environment."""
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the project root (learn-rights-python folder) so it's always found
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=_project_root / ".env")

# MongoDB
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://gopaladasmadhanmohan70998_db_user:FOEEnULaQ10cAQea@cluster0.4arbdnd.mongodb.net/learn-rights?retryWrites=true&w=majority",
)
MONGODB_LOCAL_URI = "mongodb://localhost:27017/learn-rights"
DB_NAME = "learn-rights"

# Auth
JWT_SECRET = os.getenv("JWT_SECRET", "learn-rights-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

# Server
PORT = int(os.getenv("PORT", "5000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Uploads
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# AI
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")
# Use Gemini 2.5 Flash (fast, strong general assistant)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
