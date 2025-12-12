"""
Admin endpoints for topic modeling
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models_admin import SentimentRequestBody
from api.admin.helpers import get_data, PAGES_CONST
from api.admin.models import load_topic_model, analyze_topic
from untils import load_sentiment_model
from core.database import get_db
from models.database import Post
import random

router = APIRouter()


@router.post("/topic-modeling")
def post_topics(db: Session = Depends(get_db)):
    """Classify posts by topic from database"""
    try:
        # Get all approved posts from database
        posts_db = db.query(Post).filter(Post.Status == "approved").order_by(Post.CreatedOn.desc()).all()
        
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
            "message": "Sentiment topic data retrieved successfully",
            "data": {
                "facility": filtered_posts_facility,
                "lecturer": filtered_posts_lecture,
                "student": filtered_posts_student,
                "program": filtered_posts_program
            }
        }
    except Exception as e:
        print(f"Error in sentiment topic: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-post-topic/{post_id}")
def analyze_and_update_post_topic(
    post_id: int,
    db: Session = Depends(get_db)
):
    """
    Analyze topic for a specific post and update its Category field
    Maps: LABEL_0 -> Cơ sở vật chất, LABEL_1 -> Giảng viên, LABEL_2 -> Sinh viên, LABEL_3 -> Chương trình đào tạo
    """
    try:
        # Get post from database
        post = db.query(Post).filter(Post.PostID == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Load topic model
        topic_model, topic_tokenizer, device = load_topic_model()
        if not topic_model or not topic_tokenizer:
            raise HTTPException(status_code=500, detail="Failed to load topic model")
        
        # Analyze topic using post content
        text_to_analyze = f"{post.Title} {post.Content}"
        result = analyze_topic(text_to_analyze, topic_model, topic_tokenizer, device)
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to analyze topic")
        
        # Map topic label to category
        topic_mapping = {
            "LABEL_0": "Cơ sở vật chất",
            "LABEL_1": "Giảng viên",
            "LABEL_2": "Sinh viên",
            "LABEL_3": "Chương trình đào tạo"
        }
        
        topic_label = result.get("topic", "LABEL_2")
        category = topic_mapping.get(topic_label, "Sinh viên")
        
        # Update post category
        post.Category = topic_label
        db.commit()
        db.refresh(post)
        
        return {
            "message": "Post topic analyzed and updated successfully",
            "postId": post_id,
            "topic": topic_label,
            "category": category,
            "confidence": result.get("confidence", 0.0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error analyzing post topic: {e}")
        raise HTTPException(status_code=500, detail=str(e))

