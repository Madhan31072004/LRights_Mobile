"""
LearnRights API - Python (FastAPI).
Same API contract as the Node/Express backend for the React frontend.
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import UPLOAD_DIR
from app.database import close_db, get_db
from app.routers import (
    admin,
    ai,
    auth,
    community,
    competitions,
    games,
    language,
    leaderboard,
    modules,
    profile,
    progress,
    quizzes,
    safety,
    stories,
    lawyers,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    close_db()


app = FastAPI(title="LearnRights API", version="1.0.0", lifespan=lifespan)

from fastapi import Request, Response

@app.middleware("http")
async def manual_cors_middleware(request: Request, call_next):
    # Aggressive CORS Handling
    if request.method == "OPTIONS":
        response = Response()
        response.status_code = 204
    else:
        response = await call_next(request)

    origin = request.headers.get("origin")
    # Allow all onrender.com subdomains and localhost
    if origin and (".onrender.com" in origin or "localhost" in origin or "127.0.0.1" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Bypass-Tunnel-Reminder, X-Requested-With"
    elif not origin:
        # Fallback for non-browser requests
        response.headers["Access-Control-Allow-Origin"] = "*"
    
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url} Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    return response

# Mount API routes under /api to match frontend baseURL
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(modules.router, prefix="/api/modules", tags=["modules"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(language.router, prefix="/api/language", tags=["language"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])
app.include_router(games.router, prefix="/api/games", tags=["games"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(community.router, prefix="/api/community", tags=["community"])
app.include_router(stories.router, prefix="/api/stories", tags=["stories"])
app.include_router(safety.router, prefix="/api/safety", tags=["safety"])
app.include_router(competitions.router, prefix="/api/competitions", tags=["competitions"])
app.include_router(lawyers.router, prefix="/api/lawyers", tags=["lawyers"])
# Static uploads (same as Express)
if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response

@app.options("/{rest:path}")
async def preflight_handler():
    # Explicitly return empty dict for OPTIONS to satisfy preflight
    return {}

@app.get("/")
def root():
    return {
        "message": "LearnRights API (Python) is active",
        "docs": "/docs",
        "timestamp": True
    }
