from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.database import Database
import os
import json
import google.generativeai as genai

from app.database import get_db
from app.schemas import CompetitionSubmitBody, UpdateEntryStatusBody

router = APIRouter()

@router.get("")
async def get_competitions(lang: str = Query("en"), db: Database = Depends(get_db)):
    """Get current competitions (daily/monthly)."""
    try:
        comps = list(db.competitions.find({"lang": lang, "active": True}))
        if not comps and lang != "en":
            comps = list(db.competitions.find({"lang": "en", "active": True}))
            
        for comp in comps:
            comp["_id"] = str(comp["_id"])
        return comps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{compId}/submit")
async def submit_competition_entry(compId: str, body: CompetitionSubmitBody, db: Database = Depends(get_db)):
    """Submit an entry for a competition and compute AI grade."""
    try:
        comp = db.competitions.find_one({"_id": ObjectId(compId)})
        if not comp:
            raise HTTPException(status_code=404, detail="Competition not found")
            
        entry = {
            "competitionId": compId,
            "userId": body.userId,
            "username": body.username,
            "essayContent": body.essayContent,
            "status": "pending",
            "submittedAt": datetime.utcnow()
        }
        
        earned_points = 50
        
        try:
            GEMINI_API_KEY = os.environ.get("GOOGLE_AI_API_KEY")
            GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
            if GEMINI_API_KEY:
                genai.configure(api_key=GEMINI_API_KEY)
                model = genai.GenerativeModel(GEMINI_MODEL)
                
                prompt = f"""
                You are an expert evaluator grading a competition essay for 'LearnRights', an educational platform for women's rights in India.
                Topic: {comp.get('title', '')}
                Prompt: {comp.get('prompt', '')}
                Rules: {comp.get('rules', [])}
                
                Essay to evaluate:
                "{body.essayContent}"
                
                Evaluate the essay strictly on the following criteria out of 100 points total:
                1. Legal Accuracy (30 pts): Correct usage of laws, sections, and legal concepts.
                2. Originality (20 pts): Unique perspective and personal voice.
                3. Clarity & Coherence (20 pts): Clear structure and easy-to-follow arguments.
                4. Impact & Depth (30 pts): Depth of analysis and potential to inspire or inform.

                Respond ONLY with a valid JSON object in the exact format:
                {{
                  "score": total_score_integer,
                  "feedback": "Overall brief feedback",
                  "breakdown": {{
                    "Legal Accuracy": score_out_of_30,
                    "Originality": score_out_of_20,
                    "Clarity": score_out_of_20,
                    "Depth": score_out_of_30
                  }}
                }}
                Do not include markdown tags or any other text, just the raw JSON.
                """
                
                response = model.generate_content(prompt)
                raw_json = response.text.strip()
                if raw_json.startswith("```json"):
                    raw_json = raw_json.replace("```json", "").replace("```", "").strip()
                elif "```" in raw_json:
                    # Generic markdown block removal
                    import re
                    raw_json = re.sub(r'```[a-z]*\n|```', '', raw_json).strip()
                
                ai_result = json.loads(raw_json)
                
                score = int(ai_result.get("score", 50))
                feedback = ai_result.get("feedback", "No feedback provided.")
                breakdown = ai_result.get("breakdown", {})
                
                entry["status"] = "reviewed"
                entry["score"] = score
                entry["feedback"] = feedback
                entry["breakdown"] = breakdown
                entry["reviewedAt"] = datetime.utcnow()
                earned_points = score
        except Exception as e:
            err_msg = str(e)
            print(f"AI Grading failed: {err_msg}")
            if "quota" in err_msg.lower():
                entry["feedback"] = "AI Evaluation Pending: Quota reached. Admin will review manually."
            else:
                entry["feedback"] = "Pending manual review."
            
        result = db.competition_entries.insert_one(entry)
        
        db.users.update_one(
            {"_id": ObjectId(body.userId)},
            {"$inc": {"points": earned_points}} 
        )
        
        if entry.get("status") == "reviewed":
            msg = f"Entry submitted and AI Graded! You scored {earned_points}/100 and earned {earned_points} points."
        else:
            msg = f"Entry submitted for manual review. Participation points granted."
            
        return {
            "id": str(result.inserted_id), 
            "message": msg,
            "score": entry.get("score"),
            "feedback": entry.get("feedback"),
            "breakdown": entry.get("breakdown")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/entries")
async def get_entries(db: Database = Depends(get_db)):
    """Get all competition entries (Admin only)."""
    try:
        entries = list(db.competition_entries.find().sort("submittedAt", -1))
        for entry in entries:
            entry["_id"] = str(entry["_id"])
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/entries/{entryId}/ai-evaluate")
async def manual_ai_evaluate(entryId: str, db: Database = Depends(get_db)):
    """Trigger AI evaluation for an existing entry."""
    entry = db.competition_entries.find_one({"_id": ObjectId(entryId)})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
        
    comp = db.competitions.find_one({"_id": ObjectId(entry["competitionId"])})
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")

    try:
        GEMINI_API_KEY = os.environ.get("GOOGLE_AI_API_KEY")
        GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="AI Key not configured")

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        prompt = f"""
        Evaluate this essay for 'LearnRights'. Topic: {comp.get('title', '')}
        Essay: "{entry["essayContent"]}"
        Rules: {comp.get('rules', [])}
        Respond ONLY with a JSON object: {{"score": int, "feedback": str, "breakdown": {{"Legal Accuracy": int, "Originality": int, "Clarity": int, "Depth": int}}}}
        """
        response = model.generate_content(prompt)
        import json, re
        raw_json = re.sub(r'```[a-z]*\n|```', '', response.text.strip()).strip()
        ai_result = json.loads(raw_json)
        
        db.competition_entries.update_one(
            {"_id": ObjectId(entryId)},
            {"$set": {
                "score": ai_result["score"],
                "feedback": ai_result["feedback"],
                "breakdown": ai_result["breakdown"],
                "status": "reviewed"
            }}
        )
        return ai_result
    except Exception as e:
        err_msg = str(e)
        if "quota" in err_msg.lower():
            raise HTTPException(status_code=429, detail="AI Quota exceeded. Please try again later or review manually.")
        raise HTTPException(status_code=500, detail=f"AI Evaluation failed: {err_msg}")

@router.post("/entries/{entryId}/status")
async def update_entry_status(entryId: str, body: UpdateEntryStatusBody, db: Database = Depends(get_db)):
    """Approve or reject a competition entry."""
    try:
        result = db.competition_entries.update_one(
            {"_id": ObjectId(entryId)},
            {"$set": {
                "status": body.status,
                "feedback": body.feedback,
                "reviewedAt": datetime.utcnow()
            }}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        return {"message": f"Entry {body.status} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
