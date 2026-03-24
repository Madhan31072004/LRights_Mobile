from datetime import datetime, timedelta
from bson import ObjectId

def update_user_streak(user_id: str, db):
    """
    Robustly update user streak based on calendar days.
    - If last active was yesterday: increment.
    - If last active was before yesterday: reset to 1.
    - If last active was today: do nothing.
    """
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    
    now = datetime.utcnow()
    today = now.date()
    last_active = user.get("lastActive")
    streak = user.get("streak", 0)
    
    if last_active:
        if isinstance(last_active, str):
            try:
                last_active = datetime.fromisoformat(last_active.replace("Z", "+00:00"))
            except:
                last_active = now # Fallback
        
        last_date = last_active.date()
        
        if today == last_date + timedelta(days=1):
            streak += 1 # Success!
        elif today > last_date + timedelta(days=1):
            streak = 1 # Reset
        # if today == last_date, streak remains same
    else:
        streak = 1 # First time
        
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"streak": streak, "lastActive": now}}
    )
    return streak
