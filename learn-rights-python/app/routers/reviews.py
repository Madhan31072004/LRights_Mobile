from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import get_db
from app.schemas import ReviewCreateBody
from datetime import datetime

router = APIRouter()

def _serialize_mongo(obj):
    if isinstance(obj, list):
        return [_serialize_mongo(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _serialize_mongo(v) for k, v in obj.items()}
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

@router.post("/{userId}")
def submit_review(userId: str, body: ReviewCreateBody):
    db = get_db()
    try:
        oid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = db["users"].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    review_data = {
        "rating": body.rating,
        "feedback": body.feedback,
        "createdAt": datetime.utcnow()
    }
    
    # Store at "the users particular place" - directly in the user document
    db["users"].update_one(
        {"_id": oid},
        {"$set": {"appReview": review_data}}
    )
    
    return {
        "success": True,
        "message": "Review submitted successfully",
        "review": _serialize_mongo(review_data)
    }
