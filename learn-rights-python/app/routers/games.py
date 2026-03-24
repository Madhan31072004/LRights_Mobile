from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.schemas import GameScoreBody, UpdateStreakBody
from app.utils.streak import update_user_streak
from bson import ObjectId

router = APIRouter()

@router.get("/streak/{user_id}")
async def get_streak(user_id: str, db=Depends(get_db)):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    last_active = user.get("lastActive")
    streak = user.get("streak", 0)
    
    if last_active:
        if isinstance(last_active, str):
            last_active = datetime.fromisoformat(last_active.replace("Z", "+00:00"))
        
        diff = datetime.utcnow() - last_active
        if diff.days > 1:
            streak = 0 # Streak broken
            
    return {"streak": streak, "lastActive": last_active}

@router.post("/streak/update")
async def update_streak(body: UpdateStreakBody, db=Depends(get_db)):
    streak = update_user_streak(body.userId, db)
    if streak is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"streak": streak}

@router.post("/score")
async def save_game_score(body: GameScoreBody, db=Depends(get_db)):
    user = db.users.find_one({"_id": ObjectId(body.userId)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    points_to_add = body.score // 10 # Example: 10 points per 100 game score
    
    daily_limits = user.get("dailyLimits", {})
    today = datetime.utcnow().strftime("%Y-%m-%d")
    daily_limit_reached = False
    
    if daily_limits.get(body.gameType) == today:
        daily_limit_reached = True
        points_to_add = 0
    else:
        daily_limits[body.gameType] = today
        db.users.update_one(
            {"_id": ObjectId(body.userId)},
            {"$inc": {"points": points_to_add}, "$set": {"dailyLimits": daily_limits}}
        )
    
    # Log game activity
    db.game_logs.insert_one({
        "userId": body.userId,
        "gameType": body.gameType,
        "score": body.score,
        "pointsEarned": points_to_add,
        "timestamp": datetime.utcnow()
    })
    
    return {"pointsAdded": points_to_add, "success": True, "dailyLimitReached": daily_limit_reached}

@router.get("/scenarios/{lang}")
async def get_scenarios(lang: str, db=Depends(get_db)):
    # Fallback scenarios if not in DB
    scenarios = [
        {
            "id": "1",
            "title": "The Workplace Dispute",
            "description": "A colleague is being treated unfairly because of her gender.",
            "options": [
                {"text": "Ignore it", "points": 0, "feedback": "Silence doesn't help progress."},
                {"text": "Report to HR", "points": 50, "feedback": "Correct! Use established legal and corporate channels."},
                {"text": "Advise her to quit", "points": 10, "feedback": "Supportive, but doesn't fix the underlying injustice."}
            ]
        },
        {
            "id": "2",
            "title": "Property Rights",
            "description": "Your family says you cannot inherit ancestral property because you are a daughter.",
            "options": [
                {"text": "Accept the tradition", "points": 0, "feedback": "Tradition doesn't override the Hindu Succession Act (Amendment) 2005."},
                {"text": "Consult a lawyer", "points": 50, "feedback": "Excellent. Daughters have equal coparcenary rights now."},
                {"text": "Ask brothers for 'permission'", "points": 5, "feedback": "You don't need permission for your legal right."}
            ]
        }
    ]
    return scenarios
