from fastapi import APIRouter, HTTPException, Depends
from app.deps import require_auth
import jwt
from datetime import datetime, timedelta
from app.utils.streak import update_user_streak

from app.database import get_db
from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_DAYS, GOOGLE_CLIENT_ID
from app.schemas import SignupBody, LoginBody
from bson import ObjectId

router = APIRouter()


def _hash_password(password: str) -> str:
    """Hash password with bcrypt (works on Python 3.11–3.13)."""
    try:
        import bcrypt
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    except Exception:
        from passlib.context import CryptContext
        return CryptContext(schemes=["bcrypt"], deprecated="auto").hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        import bcrypt
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        from passlib.context import CryptContext
        return CryptContext(schemes=["bcrypt"], deprecated="auto").verify(plain, hashed)


def _user_to_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "mobile": user.get("mobile"),
        "preferredLanguage": user.get("preferredLanguage", "en"),
        "role": user.get("role", "user"),
    }


@router.post("/signup")
def signup(body: SignupBody):
    db = get_db()
    users = db["users"]
    if not body.email:
        raise HTTPException(status_code=400, detail="Email is required")
    q = {"$or": [{"email": body.email}]}
    if body.mobile:
        q["$or"].append({"mobile": body.mobile})
    if users.find_one(q):
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = _hash_password(body.password) if body.password else None
    doc = {
        "name": body.name,
        "email": body.email,
        "password": hashed,
        "preferredLanguage": body.preferredLanguage or "en",
        "profilePhoto": "",
        "completedModules": [],
        "completedSubTopics": [],
        "quizzes": [],
        "points": 0,
        "badges": [],
        "role": "user",
        "createdAt": datetime.utcnow(),
    }
    # Only include mobile if provided (avoid null values in sparse unique index)
    if body.mobile:
        doc["mobile"] = body.mobile
    r = users.insert_one(doc)
    doc["_id"] = r.inserted_id
    payload = {"userId": str(r.inserted_id), "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {
        "message": "User signed up successfully",
        "token": token,
        "user": _user_to_response(doc),
    }


@router.post("/login")
def login(body: LoginBody):
    db = get_db()
    users = db["users"]
    if not body.email and not body.mobile:
        raise HTTPException(status_code=400, detail="Email or mobile is required")
    q = {"$or": []}
    if body.email:
        q["$or"].append({"email": body.email})
    if body.mobile:
        q["$or"].append({"mobile": body.mobile})
    user = users.find_one(q)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.password and user.get("password"):
        if not _verify_password(body.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid credentials")
    payload = {"userId": str(user["_id"]), "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    update_user_streak(str(user["_id"]), db)
    return {
        "message": "Login successful",
        "token": token,
        "user": _user_to_response(user),
    }


# ---------- Google OAuth ----------

from pydantic import BaseModel
import httpx as httpx_client

class GoogleAuthBody(BaseModel):
    access_token: str  # Google OAuth access token

@router.post("/google")
def google_login(body: GoogleAuthBody):
    """Verify Google access token via Google userinfo API & login/signup the user."""
    try:
        # Call Google's userinfo endpoint to verify token and get user details
        resp = httpx_client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {body.access_token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google access token")
        id_info = resp.json()
    except httpx_client.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Failed to verify Google token: {e}")

    email = id_info.get("email")
    name = id_info.get("name", "")
    picture = id_info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    db = get_db()
    users = db["users"]

    # Check if user already exists
    user = users.find_one({"email": email})

    if not user:
        # Create new user from Google account
        doc = {
            "name": name,
            "email": email,
            "password": None,
            "preferredLanguage": "en",
            "profilePhoto": picture,
            "completedModules": [],
            "completedSubTopics": [],
            "quizzes": [],
            "points": 0,
            "badges": [],
            "role": "user",
            "googleAuth": True,
            "createdAt": datetime.utcnow(),
        }
        r = users.insert_one(doc)
        doc["_id"] = r.inserted_id
        user = doc
    else:
        # Update profile photo from Google if not already set
        if not user.get("profilePhoto") and picture:
            users.update_one({"_id": user["_id"]}, {"$set": {"profilePhoto": picture}})

    payload = {"userId": str(user["_id"]), "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    update_user_streak(str(user["_id"]), db)
    return {
        "message": "Google login successful",
        "token": token,
        "user": _user_to_response(user),
    }

@router.get("/me")
def get_current_user(user_id: str = Depends(require_auth)):
    db = get_db()
    users = db["users"]
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_user_streak(user_id, db)
    return _user_to_response(user)
