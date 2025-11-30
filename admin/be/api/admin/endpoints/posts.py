"""
Admin endpoints for posts (from Database or CSV)
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import random
from sqlalchemy.orm import Session
from models_admin import PostRequest
from core.database import get_db
from models.database import Post
from api.admin.helpers import get_data, PAGES_CONST, convert_post_to_postrequest
from api.admin.models import load_topic_model, analyze_topic

router = APIRouter()


@router.get("/posts")
async def get_posts(
    page: Optional[int] = 1,
    limit: Optional[int] = 30,
    selected_page: Optional[int] = 0,
    topic: Optional[str] = None,
    tag: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get posts from Database (selected_page=0) or CSV (selected_page>=1)
    Returns same format for both sources to avoid conflicts with FE
    """
    try:
        # ================================
        # 1️⃣ LOAD POST TỪ DB HOẶC CSV
        # ================================
        if selected_page == 0:
            # ---- Load từ DATABASE ----
            query = db.query(Post).filter(Post.Status == "approved")  # Only approved posts

            # Filter by topic (Category in DB)
            if topic:
                query = query.filter(Post.Category == topic)

            # Filter by tag (not available in DB, skip)

            # Filter by date
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
            
            # Get posts with pagination
            posts_db = (
                query.order_by(Post.CreatedOn.desc())
                .offset((page - 1) * limit)
                .limit(limit)
                .all()
            )

            # Convert Post (DB) to PostRequest (CSV format) for consistency
            posts = []
            for post_db in posts_db:
                # Get comment count from relationship
                comment_count = len(post_db.comments) if post_db.comments else 0
                post_request = convert_post_to_postrequest(post_db, comment_count)
                posts.append(post_request)

            return {
                "message": "Get posts successfully",
                "total": total,
                "page": page,
                "limit": limit,
                "posts": posts
            }

        # ---- Load từ CSV (selected_page >= 1) ----
        else:
            # Validate selected_page index
            if selected_page >= len(PAGES_CONST):
                raise HTTPException(
                    status_code=400,
                    detail=f"selected_page must be between 1 and {len(PAGES_CONST) - 1}"
                )
            
            all_posts = get_data(PAGES_CONST[selected_page])

    except Exception as e:
        print(f"Error loading posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading posts: {str(e)}")

    # ====================================
    # 2️⃣ PHÂN TÍCH TOPIC (CSV ONLY)
    # ====================================
    topic_model, topic_tokenizer, device = load_topic_model()

    if topic_model and topic_tokenizer:
        for i, post in enumerate(all_posts):
            res = analyze_topic(post.text, topic_model, topic_tokenizer, device)
            post_dict = post.dict()
            post_dict["topic"] = res["topic"] if res else "LABEL_2"
            all_posts[i] = PostRequest(**post_dict)

    # ====================================
    # 3️⃣ LỌC THEO TOPIC (CSV ONLY)
    # ====================================
    if topic:
        all_posts = [p for p in all_posts if p.topic == topic]

    # ====================================
    # 4️⃣ LỌC NGÀY (CSV ONLY)
    # ====================================
    from datetime import datetime, timezone
    
    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
        )
        all_posts = [p for p in all_posts if p.time >= start_dt]

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
        )
        all_posts = [p for p in all_posts if p.time <= end_dt]

    # ====================================
    # 5️⃣ PHÂN TRANG (CSV ONLY)
    # ====================================
    total = len(all_posts)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_posts = all_posts[start_idx:end_idx]

    return {
        "message": "Get posts successfully",
        "total": total,
        "page": page,
        "limit": limit,
        "posts": paginated_posts
    }


@router.get("/post/{post_id}")
def get_post_by_id(
    post_id: int,
    selected_page: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get post by ID from Database (if selected_page=0) or CSV (if >=1)
    """
    try:
        # If selected_page is 0 or None, try to get from database first
        if selected_page == 0 or selected_page is None:
            post_db = db.query(Post).filter(Post.PostID == post_id).first()
            if post_db:
                comment_count = len(post_db.comments) if post_db.comments else 0
                return convert_post_to_postrequest(post_db, comment_count)
        
        # Fallback to CSV if not found in DB or selected_page >= 1
        if selected_page is None or selected_page >= 1:
            csv_index = selected_page if selected_page and selected_page < len(PAGES_CONST) else random.randint(0, len(PAGES_CONST) - 1)
            all_posts = get_data(PAGES_CONST[csv_index])
            
            if post_id < 0 or post_id >= len(all_posts):
                raise HTTPException(status_code=404, detail="Post not found")
            
            return all_posts[post_id]
        
        raise HTTPException(status_code=404, detail="Post not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
