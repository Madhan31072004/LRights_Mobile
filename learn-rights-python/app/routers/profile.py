from pathlib import Path
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File
from bson import ObjectId
from app.database import get_db
from app.schemas import UpdateProfileBody
from app.config import UPLOAD_DIR
from app.utils.streak import update_user_streak

router = APIRouter()


def _serialize_mongo(obj):
    if isinstance(obj, list):
        return [_serialize_mongo(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _serialize_mongo(v) for k, v in obj.items()}
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj


@router.post("/daily-checkin-reward")
def daily_checkin(payload: dict):
    print(f"[DEBUG] Check-in request received: {payload}")
    userId = payload.get("userId")
    if not userId:
        raise HTTPException(status_code=400, detail="User ID is required")
    db = get_db()
    try:
        oid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = db["users"].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from datetime import datetime
    today = datetime.utcnow().strftime("%Y-%m-%d")
    last_checkin = user.get("lastCheckIn")
    
    if last_checkin == today:
        return {"success": False, "message": "Already checked in today", "points": user.get("points", 0)}
    
    new_points = user.get("points", 0) + 10
    db["users"].update_one(
        {"_id": oid}, 
        {
            "$set": {
                "points": new_points,
                "lastCheckIn": today,
                "lastActive": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True, 
        "message": "Daily check-in successful! +10 points", 
        "points": new_points,
        "pointsAdded": 10
    }


@router.get("/{userId}")
def get_profile(userId: str):
    db = get_db()
    try:
        oid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = db["users"].find_one({"_id": oid}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update streak on profile view to keep it fresh
    update_user_streak(userId, db)
    user = db["users"].find_one({"_id": oid}, {"password": 0})
    return _serialize_mongo(user)


@router.put("/{userId}")
def update_profile(userId: str, body: UpdateProfileBody):
    print(f"[PROFILE] PUT /{{userId}} called with userId='{userId}' (len={len(userId) if userId else 0})")
    import traceback
    try:
        db = get_db()
        print(f"[PROFILE] DB connected, userId='{userId}'")
        try:
            oid = ObjectId(userId)
            print(f"[PROFILE] ObjectId created successfully: {str(oid)}")
        except Exception as oid_err:
            print(f"[PROFILE] ObjectId FAILED: {oid_err}")
            raise HTTPException(status_code=400, detail="Invalid user ID")
        user = db["users"].find_one({"_id": oid})
        print(f"[PROFILE] User query result: {'found' if user else 'NOT FOUND'}")
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        upd = {}
        if body.name is not None:
            upd["name"] = body.name
        if body.email is not None:
            val = body.email.strip()
            upd["email"] = val if val else None
        if body.mobile is not None:
            val = body.mobile.strip()
            upd["mobile"] = val if val else None
        if body.preferredLanguage is not None:
            upd["preferredLanguage"] = body.preferredLanguage
        if body.showOnLeaderboard is not None:
            upd["showOnLeaderboard"] = body.showOnLeaderboard
        if body.emailNotifications is not None:
            upd["emailNotifications"] = body.emailNotifications
        if body.emergencyContacts is not None:
            # Safer dict conversion
            upd["emergencyContacts"] = []
            for c in body.emergencyContacts:
                if hasattr(c, 'dict'):
                    upd["emergencyContacts"].append(c.dict())
                else:
                    upd["emergencyContacts"].append(dict(c))
        
        if upd:
            db["users"].update_one({"_id": oid}, {"$set": upd})
        
        user = db["users"].find_one({"_id": oid}, {"password": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found after update")
        
        return {"message": "Profile updated", "user": _serialize_mongo(user)}
    except Exception as e:
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        print(f"[PROFILE] CRITICAL ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")


@router.post("/{userId}/photo")
async def upload_photo(userId: str, profilePhoto: UploadFile = File(...)):
    db = get_db()
    try:
        oid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = db["users"].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    ext = Path(profilePhoto.filename or "").suffix or ".jpg"
    name = uuid.uuid4().hex + ext
    path = UPLOAD_DIR / name
    content = await profilePhoto.read()
    path.write_bytes(content)
    old_photo = user.get("profilePhoto")
    if old_photo and "/" in old_photo:
        old_name = old_photo.split("/")[-1]
        old_path = UPLOAD_DIR / old_name
        if old_path.exists():
            old_path.unlink()
    profile_path = "/uploads/" + name
    db["users"].update_one({"_id": oid}, {"$set": {"profilePhoto": profile_path}})
    return {"message": "Photo uploaded", "profilePhoto": profile_path}


@router.delete("/{userId}/photo")
def delete_photo(userId: str):
    db = get_db()
    try:
        oid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = db["users"].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    old_photo = user.get("profilePhoto")
    if old_photo and "/" in old_photo:
        old_name = old_photo.split("/")[-1]
        old_path = UPLOAD_DIR / old_name
        if old_path.exists():
            old_path.unlink()
    db["users"].update_one({"_id": oid}, {"$unset": {"profilePhoto": ""}})
    return {"message": "Photo deleted"}


