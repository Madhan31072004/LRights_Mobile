from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from app.database import get_db
from app.schemas import UpdateLocationBody, TriggerSOSBody, SafetyRecordingBody
from app.config import UPLOAD_DIR
from bson import ObjectId
import time
import os
import uuid
# from twilio.rest import Client # Removed per user request

router = APIRouter()

@router.post("/location")
def update_location(body: UpdateLocationBody):
    """Update user's live location in the database."""
    db = get_db()
    try:
        oid = ObjectId(body.userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    db["users"].update_one(
        {"_id": oid},
        {"$set": {
            "lastLocation": {
                "lat": body.latitude,
                "lng": body.longitude,
                "timestamp": time.time()
            }
        }}
    )
    return {"status": "Location updated"}

@router.post("/sos")
def trigger_sos(body: TriggerSOSBody):
    """Broadcast SOS alerts with live location."""
    db = get_db()
    try:
        oid = ObjectId(body.userId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = db["users"].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    contacts = user.get("emergencyContacts", [])
    if not contacts:
        return {"status": "No emergency contacts found", "alerted": 0}
    
    # Broadcast simulation (Twilio removed per user request)
    print(f"--- SOS BROADCAST for {user.get('name')} ---")
    print(f"Message: {body.message}")
    if body.latitude and body.longitude:
        print(f"Location: https://www.google.com/maps?q={body.latitude},{body.longitude}")
        
    for contact in contacts:
        print(f"ALERT PREPARED FOR: {contact['name']} ({contact['mobile']})")
    
    # Returning twilio_success: False forces the mobile app to use Native Fallback
    return {
        "status": "SOS broadcast processed (Twilio Disabled)",
        "alerted": 0,
        "twilio_success": False,
        "contacts": contacts
    }

@router.post("/upload")
async def upload_safety_recording(
    userId: str = Form(...),
    type: str = Form(...), # audio/video
    file: UploadFile = File(...)
):
    """Upload a recording file and return its URL."""
    try:
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1] or (".mp3" if type == "audio" else ".mp4")
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
        # Return relative URL (matching the static mount)
        return {
            "url": f"/uploads/{filename}",
            "filename": filename,
            "status": "File uploaded successfully"
        }
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recordings")
def save_safety_recording(body: SafetyRecordingBody):
    """Save metadata for an SOS recording."""
    db = get_db()
    doc = {
        "userId": body.userId,
        "type": body.type, # audio/video
        "url": body.url,
        "timestamp": time.time(),
        "location": body.location
    }
    r = db["safety_recordings"].insert_one(doc)
    return {"id": str(r.inserted_id), "status": "Recording saved"}

@router.get("/recordings/{userId}")
def get_recordings(userId: str):
    """Retrieve SOS recordings for a user."""
    db = get_db()
    recs = list(db["safety_recordings"].find({"userId": userId}).sort("timestamp", -1).limit(10))
    for r in recs:
        r["_id"] = str(r["_id"])
    return recs

@router.get("/admin/all")
def get_all_recordings():
    """Retrieve all SOS recordings (Admin only)."""
    db = get_db()
    recs = list(db["safety_recordings"].find().sort("timestamp", -1).limit(50))
    for r in recs:
        r["_id"] = str(r["_id"])
        # Fetch user name if possible
        user = db["users"].find_one({"_id": ObjectId(r["userId"])})
        if user:
            r["userName"] = user.get("name", "Unknown")
    return recs
