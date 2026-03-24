from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.database import Database

from app.database import get_db

router = APIRouter()

@router.get("")
async def get_stories(lang: str = Query("en"), db: Database = Depends(get_db)):
    """Get all inspiring stories in selected language."""
    try:
        # If no stories exist, seeding some defaults might be nice, but for now just fetch
        stories = list(db.stories.find({"lang": lang}))
        
        # If database is empty or we have few stories, we could call AI here, 
        # but let's just return what we have for now and let the frontend handle "Discover More"
        
        if not stories and lang != "en":
            # Fallback to English if not found
            stories = list(db.stories.find({"lang": "en"}))
            
        for story in stories:
            story["_id"] = str(story["_id"])
        return stories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_stories_endpoint(body: dict, db: Database = Depends(get_db)):
    """Generate and store AI stories."""
    from app.routers.ai import generate_inspiring_stories
    from app.schemas import AIQuizBody
    
    lang = body.get("lang", "en")
    ai_body = AIQuizBody(lang=lang, moduleId="general", userProgress={})
    
    try:
        new_stories = generate_inspiring_stories(ai_body)
        if new_stories:
            # We don't necessarily want to save EVERY AI story to DB to avoid clutter,
            # but we can save them if they are good. For now, just return them.
            return new_stories
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{storyId}")
async def get_story_detail(storyId: str, db: Database = Depends(get_db)):
    """Get detail for a specific story."""
    try:
        story = db.stories.find_one({"_id": ObjectId(storyId)})
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        story["_id"] = str(story["_id"])
        return story
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
