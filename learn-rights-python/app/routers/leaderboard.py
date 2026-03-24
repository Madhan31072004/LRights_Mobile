from fastapi import APIRouter
from app.database import get_db

router = APIRouter()


@router.get("/")
@router.get("/top")
def get_leaderboard():
    db = get_db()
    users = list(
        db["users"]
        .find(
            {
                "$and": [
                    {"role": {"$nin": ["super_admin", "admin"]}},
                    {"email": {"$not": {"$regex": "admin", "$options": "i"}}},
                    {"name": {"$not": {"$regex": "Admin", "$options": "i"}}}
                ]
            }, 
            {"name": 1, "points": 1, "completedModules": 1, "profilePhoto": 1}
        )
        .sort("points", -1)
        .limit(10)
    )
    for u in users:
        u["_id"] = str(u["_id"])
        u["completedModules"] = [str(x) for x in (u.get("completedModules") or [])]
    return users
