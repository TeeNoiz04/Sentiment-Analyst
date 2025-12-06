"""
Vote CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from core.database import get_db
from models.database import Vote, Post
from models.schemas import VoteCreate, VoteResponse, VoteListResponse

router = APIRouter()


@router.post("", response_model=VoteResponse, status_code=201)
async def create_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    """Create or update a vote"""
    try:
        post = db.query(Post).filter(Post.PostID == vote.PostID).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        existing_vote = db.query(Vote).filter(Vote.PostID == vote.PostID, Vote.UserID == vote.UserID).first()
        
        if existing_vote:
            old_vote_type = existing_vote.VoteType
            if existing_vote.VoteType == vote.VoteType:
                if old_vote_type == "up":
                    post.UpVotes = max(0, post.UpVotes - 1)
                else:
                    post.DownVotes = max(0, post.DownVotes - 1)
                db.delete(existing_vote)
                db.commit()
                raise HTTPException(status_code=200, detail="Vote removed")
            
            if old_vote_type == "up":
                post.UpVotes = max(0, post.UpVotes - 1)
                post.DownVotes += 1
            else:
                post.DownVotes = max(0, post.DownVotes - 1)
                post.UpVotes += 1
            
            existing_vote.VoteType = vote.VoteType
            db.commit()
            db.refresh(existing_vote)
            return existing_vote
        else:
            db_vote = Vote(PostID=vote.PostID, UserID=vote.UserID, VoteType=vote.VoteType)
            db.add(db_vote)
            
            if vote.VoteType == "up":
                post.UpVotes += 1
            else:
                post.DownVotes += 1
            
            db.commit()
            db.refresh(db_vote)
            return db_vote
    except HTTPException:
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User has already voted on this post")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating vote: {str(e)}")


@router.get("", response_model=VoteListResponse)
async def get_votes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    post_id: Optional[int] = None,
    user_id: Optional[int] = None,
    vote_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of votes with pagination"""
    query = db.query(Vote)
    if post_id:
        query = query.filter(Vote.PostID == post_id)
    if user_id:
        query = query.filter(Vote.UserID == user_id)
    if vote_type:
        query = query.filter(Vote.VoteType == vote_type)
    
    total = query.count()
    votes = query.order_by(Vote.CreatedAt.desc()).offset(skip).limit(limit).all()
    return VoteListResponse(total=total, votes=votes)


@router.get("/{vote_id}", response_model=VoteResponse)
async def get_vote(vote_id: int, db: Session = Depends(get_db)):
    """Get a specific vote by ID"""
    vote = db.query(Vote).filter(Vote.VoteID == vote_id).first()
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    return vote


@router.delete("/{vote_id}", status_code=204)
async def delete_vote(vote_id: int, db: Session = Depends(get_db)):
    """Delete a vote"""
    vote = db.query(Vote).filter(Vote.VoteID == vote_id).first()
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    
    try:
        post = db.query(Post).filter(Post.PostID == vote.PostID).first()
        if post:
            if vote.VoteType == "up":
                post.UpVotes = max(0, post.UpVotes - 1)
            else:
                post.DownVotes = max(0, post.DownVotes - 1)
        
        db.delete(vote)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting vote: {str(e)}")


@router.get("/post/{post_id}/summary", response_model=dict)
async def get_post_vote_summary(post_id: int, db: Session = Depends(get_db)):
    """Get vote summary for a post"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    up_votes = db.query(Vote).filter(Vote.PostID == post_id, Vote.VoteType == "up").count()
    down_votes = db.query(Vote).filter(Vote.PostID == post_id, Vote.VoteType == "down").count()
    
    return {
        "post_id": post_id,
        "up_votes": up_votes,
        "down_votes": down_votes,
        "total_votes": up_votes + down_votes,
        "net_votes": up_votes - down_votes
    }


@router.get("/post/{post_id}/check-upvote", response_model=dict)
async def check_user_upvote(
    post_id: int,
    user_id: int = Query(..., description="User ID to check"),
    db: Session = Depends(get_db)
):
    """Check if user has upvoted a post"""
    post = db.query(Post).filter(Post.PostID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    upvote = db.query(Vote).filter(
        Vote.PostID == post_id,
        Vote.UserID == user_id,
        Vote.VoteType == "up"
    ).first()
    
    return {
        "upvoted": upvote is not None
    }
