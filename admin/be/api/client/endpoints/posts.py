"""
Post CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Post, PostStatus
from models.schemas import (
    PostCreate, PostUpdate, PostResponse, PostListResponse, CommentListResponse
)

router = APIRouter()


@router.post("", response_model=PostResponse, status_code=201)
async def create_post(post: PostCreate, db: Session = Depends(get_db)):
    """Create a new post"""
    try:
        print("Creating post:", post)
        db_post = Post(
            UserID=post.UserID,
            Title=post.Title,
            Content=post.Content,
            Category=post.Category if post.Category else "",
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
    start_date: Optional[str] = Query(None, description="Filter by start date"),
    end_date: Optional[str] = Query(None, description="Filter by end date"),
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
    if start_date:
        from datetime import datetime, timezone
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
        )
        query = query.filter(Post.CreatedOn >= start_dt)
    if end_date:
        from datetime import datetime, timezone
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
        )
        query = query.filter(Post.CreatedOn <= end_dt)

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
    
    from models.database import Comment
    comment_count = db.query(Comment).filter(Comment.PostID == post_id).count()
    
    return {
        "postId": post.PostID,
        "likes": post.UpVotes,
        "comments": comment_count
    }




@router.get("/{post_id}/comments/count", response_model=dict)
async def get_comments_count(post_id: int, db: Session = Depends(get_db)):
    """Get comment count for a post"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    from models.database import Comment
    comment_count = db.query(Comment).filter(Comment.PostID == post_id).count()
    
    return {
        "postId": post.PostID,
        "comments": comment_count
    }


@router.get("/{post_id}/comments", response_model=dict)
async def get_comments_by_post(
    post_id: int,
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of comments to return"),
    db: Session = Depends(get_db)
):
    """Get list of comments for a specific post (with pagination) including user info"""
    # ensure post exists
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    from models.database import Comment, User

    query = db.query(Comment).filter(Comment.PostID == post_id)
    total = query.count()
    comments_data = query.order_by(Comment.CreatedAt.desc()).offset(skip).limit(limit).all()

    # Build response with user info
    comments_list = []
    for comment in comments_data:
        user = db.query(User).filter(User.UserID == comment.UserID).first()
        comments_list.append({
            "commentId": comment.CommentID,
            "content": comment.Content,
            "CreatedAt": comment.CreatedAt,
            "PostID": comment.PostID,
            "UserId": comment.UserID,
            "UserAvatarURL": user.AvatarURL if user else None,
            "Username": user.Username if user else None
        })

    return {
        "total": total,
        "comments": comments_list
    }


@router.post("/{post_id}/like", response_model=dict)
async def like_post(
    post_id: int,
    user_id: int = Query(..., description="User ID who is liking the post"),
    db: Session = Depends(get_db)
):
    """Like/unlike a post (toggle)"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    from models.database import Vote, VoteType
    
    # Check if user already liked this post
    existing_vote = db.query(Vote).filter(
        Vote.PostID == post_id,
        Vote.UserID == user_id,
        Vote.VoteType == VoteType.UP.value
    ).first()
    
    if existing_vote:
        # Unlike: remove vote and decrement
        db.delete(existing_vote)
        post.UpVotes = max(0, post.UpVotes - 1)
        liked = False
    else:
        # Like: add vote and increment
        new_vote = Vote(
            PostID=post_id,
            UserID=user_id,
            VoteType=VoteType.UP.value
        )
        db.add(new_vote)
        post.UpVotes += 1
        liked = True
    
    db.commit()
    db.refresh(post)
    
    return {
        "postId": post.PostID,
        "liked": liked,
        "likes": post.UpVotes
    }
