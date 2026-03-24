from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime

from app.database import get_db
from app.schemas import CompleteSubtopicBody, SubmitQuizBody, UpdateProgressBody

router = APIRouter()

# Certificate milestones: (modules_needed, certificate_type, title)
CERTIFICATE_MILESTONES = [
    (2, "foundation", "Foundation Certificate"),
    (4, "intermediate", "Intermediate Certificate"),
    (6, "advanced", "Advanced Certificate"),
    (8, "expert", "Expert Certificate"),
]


def _check_and_award_certificates(user, users_coll):
    """Check if user qualifies for new certificates and award them."""
    completed_modules = [str(x) for x in (user.get("completedModules") or [])]
    quizzes = user.get("quizzes") or []
    # Count modules where user completed AND passed quiz (score >= 48 out of 80, i.e. 60%)
    qualified_modules = 0
    for mod_id in completed_modules:
        for q in quizzes:
            if str(q.get("moduleId")) == mod_id and q.get("score", 0) >= 48:
                qualified_modules += 1
                break
    existing_certs = user.get("certificates") or []
    existing_types = {c["type"] for c in existing_certs}
    new_certs = []
    for needed, cert_type, cert_title in CERTIFICATE_MILESTONES:
        if qualified_modules >= needed and cert_type not in existing_types:
            new_certs.append({
                "type": cert_type,
                "title": cert_title,
                "earnedAt": datetime.utcnow().isoformat(),
                "modulesRequired": needed,
                "modulesCompleted": qualified_modules,
            })
    if new_certs:
        all_certs = existing_certs + new_certs
        users_coll.update_one(
            {"_id": user["_id"]},
            {"$set": {"certificates": all_certs}},
        )
    return new_certs


def _serialize_certificates(certs: list) -> list:
    """Convert certificates to JSON-safe format."""
    out = []
    for c in (certs or []):
        out.append({
            "type": c.get("type"),
            "title": c.get("title"),
            "earnedAt": c["earnedAt"] if isinstance(c.get("earnedAt"), str) else (c["earnedAt"].isoformat() if c.get("earnedAt") else None),
            "modulesRequired": c.get("modulesRequired", 0),
            "modulesCompleted": c.get("modulesCompleted", 0),
        })
    return out


@router.post("/complete-subtopic")
def complete_subtopic(body: CompleteSubtopicBody):
    db = get_db()
    users = db["users"]
    modules_coll = db["modules"]
    try:
        uid = ObjectId(body.userId)
        mid = ObjectId(body.moduleId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    user = users.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    completed = list(user.get("completedSubTopics") or [])
    if body.subTopicId not in completed:
        completed.append(body.subTopicId)
    module = modules_coll.find_one({"_id": mid})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    module_code = module.get("code", str(module["_id"]))
    module_sub_ids = []
    for ti, topic in enumerate(module.get("topics") or []):
        for si, st in enumerate(topic.get("subTopics") or []):
            # Use stable position-based IDs matching _ser() in modules.py
            sid = f"{module_code}-T{ti}-S{si}"
            module_sub_ids.append(sid)
    total = len(module_sub_ids)
    done_count = sum(1 for c in completed if c in module_sub_ids)
    completed_modules = [str(x) for x in (user.get("completedModules") or [])]
    points = user.get("points") or 0
    badges = list(user.get("badges") or [])
    if total and done_count >= total and body.moduleId not in completed_modules:
        completed_modules.append(body.moduleId)
        points += 10
        if len(completed_modules) == 1 and "First Module Completed" not in badges:
            badges.append("First Module Completed")
    users.update_one(
        {"_id": uid},
        {
            "$set": {
                "completedSubTopics": completed,
                "completedModules": [ObjectId(x) for x in completed_modules],
                "points": points,
                "badges": badges,
            }
        },
    )
    # Check for new certificates after module completion
    updated_user = users.find_one({"_id": uid})
    new_certs = _check_and_award_certificates(updated_user, users)
    updated_user = users.find_one({"_id": uid})
    return {
        "message": "Subtopic completed",
        "progress": {
            "completedSubTopics": completed,
            "completedModules": completed_modules,
            "points": points,
            "badges": badges,
            "certificates": _serialize_certificates(updated_user.get("certificates") or []),
        },
        "newCertificates": _serialize_certificates(new_certs),
    }


def _serialize_quizzes(quizzes: list) -> list:
    """Convert ObjectId/datetime in quiz records to JSON-safe types."""
    out = []
    for q in quizzes:
        out.append({
            "moduleId": str(q["moduleId"]) if q.get("moduleId") else None,
            "score": q.get("score", 0),
            "attempts": q.get("attempts", 0),
            "lastAttempt": q["lastAttempt"].isoformat() if q.get("lastAttempt") else None,
        })
    return out


@router.post("/submit-quiz")
def submit_quiz(body: SubmitQuizBody):
    db = get_db()
    users = db["users"]
    try:
        uid = ObjectId(body.userId)
        mid = ObjectId(body.moduleId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    user = users.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    quizzes = list(user.get("quizzes") or [])
    total_marks = body.totalQuestions * 10
    pass_marks = (total_marks * 60 + 99) // 100      # 60 % to pass
    points_earned = body.score if body.score >= pass_marks else 0
    found = False
    for i, q in enumerate(quizzes):
        if str(q.get("moduleId")) == body.moduleId:
            quizzes[i] = {
                "moduleId": mid,
                "score": body.score,
                "attempts": (q.get("attempts") or 0) + 1,
                "lastAttempt": datetime.utcnow(),
            }
            found = True
            break
    if not found:
        quizzes.append({
            "moduleId": mid,
            "score": body.score,
            "attempts": 1,
            "lastAttempt": datetime.utcnow(),
        })
    new_points = (user.get("points") or 0) + points_earned
    users.update_one(
        {"_id": uid},
        {"$set": {"quizzes": quizzes, "points": new_points}},
    )
    # Check for new certificates after quiz submission
    u2 = users.find_one({"_id": uid})
    new_certs = _check_and_award_certificates(u2, users)
    u2 = users.find_one({"_id": uid})
    qs = _serialize_quizzes(u2.get("quizzes") or [])
    comp = [str(x) for x in (u2.get("completedModules") or [])]
    return {
        "message": "Quiz submitted successfully",
        "score": body.score,
        "passed": body.score >= pass_marks,
        "pointsEarned": points_earned,
        "progress": {
            "quizzes": qs,
            "points": new_points,
            "completedModules": comp,
            "badges": u2.get("badges") or [],
            "certificates": _serialize_certificates(u2.get("certificates") or []),
        },
        "newCertificates": _serialize_certificates(new_certs),
    }


@router.post("/update")
def update_progress(body: UpdateProgressBody):
    db = get_db()
    users = db["users"]
    try:
        uid = ObjectId(body.userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = users.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    upd = {}
    if body.moduleId:
        comp = [str(x) for x in (user.get("completedModules") or [])]
        if body.moduleId not in comp:
            comp.append(body.moduleId)
            upd["completedModules"] = [ObjectId(x) for x in comp]
    if body.quizScore is not None and body.moduleId:
        quizzes = list(user.get("quizzes") or [])
        mid = ObjectId(body.moduleId)
        for i, q in enumerate(quizzes):
            if str(q.get("moduleId")) == body.moduleId:
                quizzes[i] = {
                    **q,
                    "score": body.quizScore,
                    "attempts": (q.get("attempts") or 0) + 1,
                    "lastAttempt": datetime.utcnow(),
                }
                break
        else:
            quizzes.append({
                "moduleId": mid,
                "score": body.quizScore,
                "attempts": 1,
                "lastAttempt": datetime.utcnow(),
            })
        upd["quizzes"] = quizzes
    daily_limit_reached = False
    if body.pointsEarned:
        if body.gameType:
            daily_limits = user.get("dailyLimits", {})
            today = datetime.utcnow().strftime("%Y-%m-%d")
            if daily_limits.get(body.gameType) == today:
                daily_limit_reached = True
            else:
                daily_limits[body.gameType] = today
                upd["dailyLimits"] = daily_limits
                upd["points"] = (user.get("points") or 0) + body.pointsEarned
        else:
            upd["points"] = (user.get("points") or 0) + body.pointsEarned
            
    if body.badge:
        badges = list(user.get("badges") or [])
        if body.badge not in badges:
            badges.append(body.badge)
            upd["badges"] = badges
    if upd:
        users.update_one({"_id": uid}, {"$set": upd})
    u2 = users.find_one({"_id": uid})
    
    res_msg = "Progress updated"
    if daily_limit_reached:
        res_msg = f"Daily limit reached for {body.gameType}. Try again tomorrow!"
        
    return {
        "message": res_msg,
        "dailyLimitReached": daily_limit_reached,
        "pointsEarned": 0 if daily_limit_reached else (body.pointsEarned or 0),
        "progress": {
            "completedModules": [str(x) for x in (u2.get("completedModules") or [])],
            "quizzes": _serialize_quizzes(u2.get("quizzes") or []),
            "points": u2.get("points") or 0,
            "badges": u2.get("badges") or [],
        },
    }


@router.get("/leaderboard/top")
def get_leaderboard_top():
    db = get_db()
    users = list(
        db["users"]
        .find({}, {"name": 1, "email": 1, "points": 1, "completedModules": 1})
        .sort("points", -1)
        .limit(10)
    )
    out = []
    for u in users:
        u["_id"] = str(u["_id"])
        comp = u.get("completedModules") or []
        u["completedModules"] = [str(x) for x in comp]
        out.append(u)
    return out


@router.get("/{userId}")
def get_user_progress(userId: str):
    db = get_db()
    try:
        uid = ObjectId(userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = db["users"].find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "completedSubTopics": user.get("completedSubTopics") or [],
        "quizzes": _serialize_quizzes(user.get("quizzes") or []),
        "points": user.get("points") or 0,
        "completedModules": [str(x) for x in (user.get("completedModules") or [])],
        "badges": user.get("badges") or [],
        "certificates": _serialize_certificates(user.get("certificates") or []),
    }
