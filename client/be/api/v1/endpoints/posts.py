"""
Post CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Post, PostStatus
from models.schemas import (
    PostCreate, PostUpdate, PostResponse, PostListResponse
)

router = APIRouter()


@router.post("", response_model=PostResponse, status_code=201)
async def create_post(post: PostCreate, db: Session = Depends(get_db)):
    """Create a new post"""
    try:
        db_post = Post(
            UserID=post.UserID,
            Title=post.Title,
            Content=post.Content,
            Category=post.Category,
            Status=PostStatus.APPROVED.value,
            UpVotes=0,
            DownVotes=0
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating post: {str(e)}")


@router.get("", response_model=PostListResponse)
async def get_posts(
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of posts to return"),
    status: Optional[str] = Query(None, description="Filter by status: approved, hidden"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get list of posts with pagination"""
    query = db.query(Post)
    
    # Apply filters
    if status:
        query = query.filter(Post.Status == status)
    if user_id:
        query = query.filter(Post.UserID == user_id)
    if category:
        query = query.filter(Post.Category == category)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    posts = query.order_by(Post.CreatedOn.desc()).offset(skip).limit(limit).all()
    
    return PostListResponse(total=total, posts=posts)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a specific post by ID"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: Session = Depends(get_db)
):
    """Update a post"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    try:
        # Update fields
        if post_update.Title is not None:
            post.Title = post_update.Title
        if post_update.Content is not None:
            post.Content = post_update.Content
        if post_update.Category is not None:
            post.Category = post_update.Category
        if post_update.Status is not None:
            post.Status = post_update.Status
        
        db.commit()
        db.refresh(post)
        return post
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating post: {str(e)}")


@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post (soft delete by setting status to hidden)"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    try:
        post.Status = PostStatus.HIDDEN.value
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting post: {str(e)}")


@router.get("/{post_id}/stats", response_model=dict)
async def get_post_stats(post_id: int, db: Session = Depends(get_db)):
    """Get statistics for a post"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Count reports
    from models.database import Report
    report_count = db.query(Report).filter(Report.PostID == post_id).count()
    
    # Count comments
    from models.database import Comment
    comment_count = db.query(Comment).filter(Comment.PostID == post_id).count()
    
    return {
        "post_id": post.PostID,
        "up_votes": post.UpVotes,
        "down_votes": post.DownVotes,
        "total_votes": post.UpVotes + post.DownVotes,
        "reports": report_count,
        "comments": comment_count,
        "status": post.Status
    }
