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

@router.get("/")
def get_public_reviews():
    db = get_db()
    # Find users who have an appReview, project only the review and user name
    users_with_reviews = db["users"].find(
        {"appReview": {"$exists": True}},
        {"name": 1, "appReview": 1, "profilePhoto": 1}
    ).sort("appReview.createdAt", -1).limit(10)
    
    reviews = []
    for u in users_with_reviews:
        reviews.append({
            "userName": u.get("name", "Anonymous"),
            "profilePhoto": u.get("profilePhoto"),
            "rating": u["appReview"].get("rating"),
            "feedback": u["appReview"].get("feedback"),
            "createdAt": u["appReview"].get("createdAt")
        })
    
    return _serialize_mongo(reviews)
