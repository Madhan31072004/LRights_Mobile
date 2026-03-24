from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from app.database import get_db
from app.schemas import CommentCreateBody, PostCreateBody, ReportPostBody

router = APIRouter()

@router.get("/posts")
async def get_posts(db: Database = Depends(get_db)):
    """Get all community posts, sorted by newest."""
    try:
        posts = list(db.community_posts.find().sort("createdAt", -1))
        for post in posts:
            post["_id"] = str(post["_id"])
            post["likesCount"] = len(post.get("likes", []))
            post["commentsCount"] = len(post.get("comments", []))
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/posts")
async def create_post(body: PostCreateBody, db: Database = Depends(get_db)):
    """Create a new post."""
    try:
        new_post = {
            "userId": body.userId,
            "username": body.username,
            "content": body.content,
            "imageUrl": body.imageUrl,
            "likes": [],
            "comments": [],
            "createdAt": datetime.utcnow()
        }
        result = db.community_posts.insert_one(new_post)
        return {"id": str(result.inserted_id), "message": "Post created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/posts/{postId}/like")
async def toggle_like(postId: str, userId: str, db: Database = Depends(get_db)):
    """Toggle like on a post."""
    try:
        post = db.community_posts.find_one({"_id": ObjectId(postId)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        likes = post.get("likes", [])
        if userId in likes:
            # Unlike
            db.community_posts.update_one(
                {"_id": ObjectId(postId)},
                {"$pull": {"likes": userId}}
            )
            return {"liked": False}
        else:
            # Like
            db.community_posts.update_one(
                {"_id": ObjectId(postId)},
                {"$push": {"likes": userId}}
            )
            return {"liked": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/posts/{postId}/comments")
async def add_comment(postId: str, body: CommentCreateBody, db: Database = Depends(get_db)):
    """Add a comment to a post."""
    try:
        comment = {
            "id": str(ObjectId()),
            "userId": body.userId,
            "username": body.username,
            "text": body.text,
            "createdAt": datetime.utcnow()
        }
        result = db.community_posts.update_one(
            {"_id": ObjectId(postId)},
            {"$push": {"comments": comment}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        return {"id": comment["id"], "message": "Comment added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/posts/{postId}")
async def delete_post(postId: str, userId: str, db: Database = Depends(get_db)):
    """Delete a post (must be owner or admin)."""
    try:
        # Check if user is admin
        user = db.users.find_one({"_id": ObjectId(userId)})
        is_admin = user and user.get("role") == "admin"
        
        query = {"_id": ObjectId(postId)}
        if not is_admin:
            query["userId"] = userId
            
        result = db.community_posts.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=403, detail="Not authorized or post not found")
        return {"message": "Post deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/posts/{postId}/report")
async def report_post(postId: str, body: ReportPostBody, db: Database = Depends(get_db)):
    """Report a post for review."""
    try:
        report = {
            "postId": postId,
            "userId": body.userId,
            "reason": body.reason,
            "createdAt": datetime.utcnow()
        }
        db.reports.insert_one(report)
        # Mark post as reported
        db.community_posts.update_one(
            {"_id": ObjectId(postId)},
            {"$set": {"reported": True}}
        )
        return {"message": "Report submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
