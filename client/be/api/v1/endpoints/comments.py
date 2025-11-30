"""
Comment CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Comment, Post
from models.schemas import (
    CommentCreate, CommentUpdate, CommentResponse, CommentListResponse
)

router = APIRouter()


@router.post("", response_model=CommentResponse, status_code=201)
async def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    """Create a new comment"""
    try:
        # Check if post exists
        post = db.query(Post).filter(Post.PostID == comment.PostID).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        db_comment = Comment(
            PostID=comment.PostID,
            UserID=comment.UserID,
            Content=comment.Content
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating comment: {str(e)}")


@router.get("", response_model=CommentListResponse)
async def get_comments(
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of comments to return"),
    post_id: Optional[int] = Query(None, description="Filter by post ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    """Get list of comments with pagination"""
    query = db.query(Comment)
    
    # Apply filters
    if post_id:
        query = query.filter(Comment.PostID == post_id)
    if user_id:
        query = query.filter(Comment.UserID == user_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    comments = query.order_by(Comment.CreatedAt.asc()).offset(skip).limit(limit).all()
    
    return CommentListResponse(total=total, comments=comments)


@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(comment_id: int, db: Session = Depends(get_db)):
    """Get a specific comment by ID"""
    comment = db.query(Comment).filter(Comment.CommentID == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db)
):
    """Update a comment"""
    comment = db.query(Comment).filter(Comment.CommentID == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    try:
        if comment_update.Content is not None:
            comment.Content = comment_update.Content
        
        db.commit()
        db.refresh(comment)
        return comment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating comment: {str(e)}")


@router.delete("/{comment_id}", status_code=204)
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    """Delete a comment"""
    comment = db.query(Comment).filter(Comment.CommentID == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    try:
        db.delete(comment)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting comment: {str(e)}")

