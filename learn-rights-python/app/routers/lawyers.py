from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.deps import require_auth
from app.schemas import LawyerProfileCreateBody, UpdateLawyerStatusBody
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/profile")
def create_or_update_lawyer_profile(body: LawyerProfileCreateBody, user_id: str = Depends(require_auth)):
    db = get_db()
    lawyers = db["lawyers"]
    
    # Check if user already has a profile
    existing = lawyers.find_one({"userId": body.userId})
    
    doc = body.model_dump()
    doc["updatedAt"] = datetime.utcnow()
    
    if existing:
        lawyers.update_one({"userId": body.userId}, {"$set": doc})
        message = "Lawyer profile updated successfully"
    else:
        doc["verified"] = False  # New profiles are unverified by default
        doc["createdAt"] = datetime.utcnow()
        lawyers.insert_one(doc)
        message = "Lawyer profile created successfully and pending verification"
        
    return {"message": message}

@router.get("/")
def list_lawyers(verified_only: bool = True):
    db = get_db()
    query = {"verified": True} if verified_only else {}
    results = list(db["lawyers"].find(query).sort("createdAt", -1))
    for r in results:
        r["_id"] = str(r["_id"])
    return results

@router.get("/{id}")
def get_lawyer_detail(id: str):
    db = get_db()
    try:
        oid = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid lawyer ID")
        
    lawyer = db["lawyers"].find_one({"_id": oid})
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    lawyer["_id"] = str(lawyer["_id"])
    return lawyer

@router.patch("/{id}/verify", dependencies=[Depends(require_auth)])
def verify_lawyer(id: str, body: UpdateLawyerStatusBody):
    db = get_db()
    try:
        oid = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid lawyer ID")
        
    result = db["lawyers"].update_one({"_id": oid}, {"$set": {"verified": body.verified}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    return {"message": "Lawyer verification status updated"}
