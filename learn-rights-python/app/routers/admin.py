from fastapi import APIRouter, Depends
from app.database import get_db
from app.deps import require_auth

router = APIRouter()


def serialize_mongo_doc(doc):
    """Recursively convert BSON types for JSON serialization."""
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        new_doc = {}
        for k, v in doc.items():
            if k == "_id":
                new_doc[k] = str(v)
            elif hasattr(v, "isoformat"): # Datetime
                new_doc[k] = v.isoformat()
            elif hasattr(v, "__dict__"): # Objects
                new_doc[k] = serialize_mongo_doc(v.__dict__)
            else:
                new_doc[k] = serialize_mongo_doc(v)
        return new_doc
    # Fallback for ObjectId or other non-JSON types at leaf level
    if hasattr(doc, "__str__") and not isinstance(doc, (str, int, float, bool, type(None))):
        return str(doc)
    return doc

# ── Public stats endpoint (no auth) – used by Home & Welcome pages ────
@router.get("/public-stats")
def get_public_stats():
    """Return basic platform stats without requiring authentication."""
    try:
        db = get_db()
        total_users = db["users"].count_documents({})
        total_modules = db["modules"].count_documents({})
        total_posts = db["community_posts"].count_documents({})
        total_entries = db["competition_entries"].count_documents({})
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error fetching public stats: {e}")
        total_users = 0
        total_modules = 0
        total_posts = 0
        total_entries = 0

    # Count supported languages from language router config
    try:
        from app.routers.language import INDIAN_LANGUAGES
        total_languages = len(INDIAN_LANGUAGES)
    except Exception:
        total_languages = 17  # fallback

    return {
        "totalUsers": total_users,
        "totalModules": total_modules,
        "totalLanguages": total_languages,
        "totalPosts": total_posts,
        "totalEntries": total_entries,
    }


@router.get("/users", dependencies=[Depends(require_auth)])
def get_all_users():
    try:
        db = get_db()
        users = list(db["users"].find({}, {"password": 0}))
        return [serialize_mongo_doc(u) for u in users]
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"User Fetch Error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

# ── Module Management ────────────────────────────────────────────────
@router.post("/modules", dependencies=[Depends(require_auth)])
def create_module(body: dict):
    db = get_db()
    new_mod = {
        "title": body.get("title", "New Module"),
        "description": body.get("description", ""),
        "icon": body.get("icon", "BookOpen"),
        "code": body.get("code", "MOD_NEW"),
        "order": body.get("order", 10),
        "topics": []
    }
    result = db["modules"].insert_one(new_mod)
    return {"message": "Module created", "id": str(result.inserted_id)}

@router.delete("/modules/{module_id}", dependencies=[Depends(require_auth)])
def delete_module(module_id: str):
    db = get_db()
    from bson import ObjectId
    db["modules"].delete_one({"_id": ObjectId(module_id)})
    return {"message": "Module deleted"}

@router.post("/modules/{module_id}/topics", dependencies=[Depends(require_auth)])
def add_topic(module_id: str, body: dict):
    db = get_db()
    from bson import ObjectId
    new_topic = {
        "title": body.get("title", "New Topic"),
        "subTopics": []
    }
    db["modules"].update_one(
        {"_id": ObjectId(module_id)},
        {"$push": {"topics": new_topic}}
    )
    return {"message": "Topic added"}

@router.post("/modules/{module_id}/topics/{topic_idx}/subtopics", dependencies=[Depends(require_auth)])
def add_subtopic(module_id: str, topic_idx: int, body: dict):
    db = get_db()
    from bson import ObjectId
    new_sub = {
        "title": body.get("title", "New Lesson"),
        "content": body.get("content", "")
    }
    db["modules"].update_one(
        {"_id": ObjectId(module_id)},
        {"$push": {f"topics.{topic_idx}.subTopics": new_sub}}
    )
    return {"message": "Content added"}

@router.patch("/modules/{module_id}", dependencies=[Depends(require_auth)])
def update_module(module_id: str, body: dict):
    db = get_db()
    from bson import ObjectId
    update_data = {}
    for k in ["title", "description", "icon", "code", "order"]:
        if k in body: update_data[k] = body[k]
    db["modules"].update_one({"_id": ObjectId(module_id)}, {"$set": update_data})
    return {"message": "Module updated"}

@router.patch("/modules/{module_id}/topics/{topic_idx}", dependencies=[Depends(require_auth)])
def update_topic(module_id: str, topic_idx: int, body: dict):
    db = get_db()
    from bson import ObjectId
    if "title" in body:
        db["modules"].update_one(
            {"_id": ObjectId(module_id)},
            {"$set": {f"topics.{topic_idx}.title": body["title"]}}
        )
    return {"message": "Topic updated"}

@router.patch("/modules/{module_id}/topics/{topic_idx}/subtopics/{sub_idx}", dependencies=[Depends(require_auth)])
def update_subtopic(module_id: str, topic_idx: int, sub_idx: int, body: dict):
    db = get_db()
    from bson import ObjectId
    update_data = {}
    if "title" in body: update_data[f"topics.{topic_idx}.subTopics.{sub_idx}.title"] = body["title"]
    if "content" in body: update_data[f"topics.{topic_idx}.subTopics.{sub_idx}.content"] = body["content"]
    
    if update_data:
        db["modules"].update_one({"_id": ObjectId(module_id)}, {"$set": update_data})
    return {"message": "Content updated"}

@router.delete("/modules/{module_id}/topics/{topic_idx}", dependencies=[Depends(require_auth)])
def delete_topic(module_id: str, topic_idx: int):
    db = get_db()
    from bson import ObjectId
    # Using $unset and $pull to remove item from array by index is tricky in Mongo
    # Easier to pull by value if unique, or use positional update. 
    # For simplicity, we'll use the $unset + $pull pattern
    db["modules"].update_one({"_id": ObjectId(module_id)}, {"$unset": {f"topics.{topic_idx}": 1}})
    db["modules"].update_one({"_id": ObjectId(module_id)}, {"$pull": {"topics": None}})
    return {"message": "Topic deleted"}

@router.delete("/modules/{module_id}/topics/{topic_idx}/subtopics/{sub_idx}", dependencies=[Depends(require_auth)])
def delete_subtopic(module_id: str, topic_idx: int, sub_idx: int):
    db = get_db()
    from bson import ObjectId
    db["modules"].update_one({"_id": ObjectId(module_id)}, {"$unset": {f"topics.{topic_idx}.subTopics.{sub_idx}": 1}})
    db["modules"].update_one({"_id": ObjectId(module_id)}, {"$pull": {f"topics.{topic_idx}.subTopics": None}})
    return {"message": "Lesson deleted"}

# ── Bot Settings ─────────────────────────────────────────────────────
@router.get("/bot/settings", dependencies=[Depends(require_auth)])
def get_bot_settings():
    db = get_db()
    settings = db["settings"].find_one({"type": "bot"})
    if not settings:
        # Default settings if none exist
        return {
            "systemPrompt": "You are LegalAid AI, a personalized smart tutor specializing in women's rights and laws in India.",
            "safetyLevel": "medium",
            "webSearchEnabled": True
        }
    settings["_id"] = str(settings["_id"])
    return settings

@router.patch("/bot/settings", dependencies=[Depends(require_auth)])
def update_bot_settings(body: dict):
    db = get_db()
    update_data = {}
    if "systemPrompt" in body: update_data["systemPrompt"] = body["systemPrompt"]
    if "safetyLevel" in body: update_data["safetyLevel"] = body["safetyLevel"]
    if "webSearchEnabled" in body: update_data["webSearchEnabled"] = body["webSearchEnabled"]
    
    db["settings"].update_one(
        {"type": "bot"},
        {"$set": update_data},
        upsert=True
    )
    return {"message": "Bot settings updated"}

@router.get("/stats", dependencies=[Depends(require_auth)])
def get_user_stats():
    try:
        db = get_db()
        total_users = db["users"].count_documents({})
        total_modules = db["modules"].count_documents({})
        total_posts = db["community_posts"].count_documents({})
        total_entries = db["competition_entries"].count_documents({})
        completed_modules = db["progresses"].count_documents({"completed": True}) if "progresses" in db.list_collection_names() else 0
        
        # Fetch recent reported posts
        recent_reports = list(db["community_posts"].find({"reported": True}).sort("createdAt", -1).limit(3))
        
        return serialize_mongo_doc({
            "totalUsers": total_users, 
            "totalModules": total_modules, 
            "totalPosts": total_posts,
            "totalEntries": total_entries,
            "completedModules": completed_modules,
            "recentReports": recent_reports
        })
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error fetching user stats: {e}")
        return {"totalUsers": 0, "totalModules": 0, "completedModules": 0}


@router.get("/reports", dependencies=[Depends(require_auth)])
def get_progress_reports():
    db = get_db()
    if "progresses" not in db.list_collection_names():
        return []
    pipeline = [
        {"$group": {"_id": "$moduleId", "count": {"$sum": 1}}},
        {"$lookup": {"from": "modules", "localField": "_id", "foreignField": "_id", "as": "module"}},
        {"$unwind": {"path": "$module"}},
    ]
    return list(db["progresses"].aggregate(pipeline))
@router.get("/game-stats", dependencies=[Depends(require_auth)])
def get_admin_game_stats():
    """Aggregate game play statistics from game_logs collection."""
    try:
        db = get_db()
        pipeline = [
            {"$group": {"_id": "$gameType", "totalPlays": {"$sum": 1}, "avgScore": {"$avg": "$score"}}}
        ]
        stats = list(db["game_logs"].aggregate(pipeline))
        return stats
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error fetching game stats: {e}")
        return []

@router.patch("/users/{user_id}", dependencies=[Depends(require_auth)])
def update_user_status(user_id: str, body: dict):
    db = get_db()
    from bson import ObjectId
    update_data = {}
    if "role" in body: update_data["role"] = body["role"]
    if "status" in body: update_data["status"] = body["status"] # active/banned
    
    if not update_data:
        return {"message": "No data provided"}
        
    db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}", dependencies=[Depends(require_auth)])
def delete_user(user_id: str):
    db = get_db()
    from bson import ObjectId
    db["users"].delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted successfully"}

@router.post("/ai/clear-cache", dependencies=[Depends(require_auth)])
def clear_ai_cache():
    import shutil
    import os
    from app.routers.ai import CACHE_DIR
    if os.path.exists(CACHE_DIR):
        shutil.rmtree(CACHE_DIR)
        os.makedirs(CACHE_DIR)
    return {"message": "AI Cache cleared successfully"}

@router.patch("/community/posts/{post_id}/dismiss-report", dependencies=[Depends(require_auth)])
def dismiss_post_report(post_id: str):
    db = get_db()
    from bson import ObjectId
    db["community_posts"].update_one(
        {"_id": ObjectId(post_id)}, 
        {"$set": {"reported": False}}
    )
    return {"message": "Report dismissed"}
