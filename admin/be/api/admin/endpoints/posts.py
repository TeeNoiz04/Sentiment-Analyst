"""
Admin endpoints for posts (from Database or CSV)
"""
from unicodedata import category
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import random
from sqlalchemy.orm import Session
from models_admin import PostRequest
from core.database import get_db
from models.database import Post
from api.admin.helpers import convert_post_to_postrequest
from api.admin.models import load_topic_model, analyze_topic

router = APIRouter()


@router.get("/posts")
async def get_posts(
    page: Optional[int] = 1,
    limit: Optional[int] = 30,
    topic: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get posts from Database and analyze topics
    """
    try:
        from datetime import datetime, timezone
        
        # ================================
        # 1️⃣ LOAD POST TỪ DATABASE
        # ================================
        query = db.query(Post).filter(Post.Status == "approved")

        # Filter by date
        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
            )
            query = query.filter(Post.CreatedOn >= start_dt)

        if end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
            )
            query = query.filter(Post.CreatedOn <= end_dt)

        if topic:
            query = query.filter(Post.Category == topic)
        # Get total count before topic filter
        posts_db = query.order_by(Post.CreatedOn.desc()).all()
        
        # Convert Post (DB) to PostRequest for topic analysis
        posts = []
        for post_db in posts_db:
            comment_count = len(post_db.comments) if post_db.comments else 0
            post_request = convert_post_to_postrequest(post_db, comment_count)
            posts.append(post_request)

        # ====================================
        # 4️⃣ PHÂN TRANG
        # ====================================
        total = len(posts)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_posts = posts[start_idx:end_idx]

        return {
            "message": "Get posts successfully",
            "total": total,
            "page": page,
            "limit": limit,
            "posts": paginated_posts
        }

    except Exception as e:
        print(f"Error loading posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading posts: {str(e)}")


@router.get("/post/{post_id}")
def get_post_by_id(
    post_id: int,
    db: Session = Depends(get_db)
):
    """
    Get post by ID from Database
    """
    try:
        post_db = db.query(Post).filter(Post.PostID == post_id).first()
        if not post_db:
            raise HTTPException(status_code=404, detail="Post not found")
        
        comment_count = len(post_db.comments) if post_db.comments else 0
        return convert_post_to_postrequest(post_db, comment_count)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/posts/category")
async def get_posts_by_category(
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get posts by category from Database and return grouped by topic
    Categories: Cơ sở vật chất, Giảng viên, Sinh viên, Chương trình đào tạo
    """
    try:
        from datetime import datetime, timezone

        # Query posts by category
        query = db.query(Post).filter(Post.Status == "approved")

        if category not in [None, ""]:
            query = query.filter(Post.Category == category)

        # Filter by date
        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
            )
            query = query.filter(Post.CreatedOn >= start_dt)

        if end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
            )
            query = query.filter(Post.CreatedOn <= end_dt)

        # Get all posts (no pagination here, we'll paginate after grouping if needed)
        posts_db = query.order_by(Post.CreatedOn.desc()).all()

        if not posts_db:
            return {
                "message": "No posts found",
                "data": {
                    "facility": [],
                    "lecturer": [],
                    "student": [],
                    "program": []
                }
            }

        # Initialize arrays for each topic
        filtered_posts_facility = []
        filtered_posts_lecture = []
        filtered_posts_student = []
        filtered_posts_program = []

        # Load topic model
        topic_model, topic_tokenizer, device = load_topic_model()
        if not topic_model or not topic_tokenizer:
            raise Exception("Failed to load topic model")

        # Analyze topic for each post
        for post_db in posts_db:
            try:
                # Analyze topic using post title and content
                text_to_analyze = f"{post_db.Title} {post_db.Content}"
                result = analyze_topic(text_to_analyze, topic_model, topic_tokenizer, device)
                
                # Create post dict with analyzed topic
                post_data = {
                    "postId": post_db.PostID,
                    "title": post_db.Title,
                    "content": post_db.Content,
                    "category": post_db.Category,
                    "createdOn": post_db.CreatedOn.isoformat() if post_db.CreatedOn else None,
                    "upVotes": post_db.UpVotes,
                    "downVotes": post_db.DownVotes,
                    "topic": result.get("topic", "LABEL_2") if result else "LABEL_2",
                    "confidence": result.get("confidence", 0.0) if result else 0.0
                }
                
                # Categorize by topic
                if result and result["topic"] == "LABEL_0":
                    filtered_posts_facility.append(post_data)
                elif result and result["topic"] == "LABEL_1":
                    filtered_posts_lecture.append(post_data)
                elif result and result["topic"] == "LABEL_2":
                    filtered_posts_student.append(post_data)
                elif result and result["topic"] == "LABEL_3":
                    filtered_posts_program.append(post_data)
                else:
                    filtered_posts_student.append(post_data)  # Default to student
                    
            except Exception as e:
                print(f"Error analyzing post {post_db.PostID}: {e}")
                continue

        return {
            "message": "Get posts by category successfully",
            "data": {
                "facility": filtered_posts_facility,
                "lecturer": filtered_posts_lecture,
                "student": filtered_posts_student,
                "program": filtered_posts_program
            }
        }

    except Exception as e:
        print(f"Error loading posts by category: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading posts by category: {str(e)}")
