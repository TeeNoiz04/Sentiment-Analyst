"""
Admin endpoints for sentiment trend analysis
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta, timezone
from dateutil.parser import isoparse
import logging
from sqlalchemy.orm import Session
from untils import load_sentiment_model, preprocess_text, load_stopwords
from api.admin.models import load_topic_model, analyze_topic
from core.database import get_db
from models.database import Post

router = APIRouter()


@router.get("/sentiment-trend")
async def get_sentiment_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    topic: Optional[str] = None,
    db: Session = Depends(get_db)
):
    
    """Get sentiment trend over time from database posts"""
    try:
        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        if not sentiment_classifier or not tokenizer:
            raise Exception("Failed to load sentiment model")

        stopwords_path = "data/vietnamese-stopwords.txt"
        stopwords = load_stopwords(stopwords_path)

        # Parse date range
        if start_date:
            try:
                start_datetime = isoparse(start_date)
                if start_datetime.tzinfo is None:
                    start_datetime = start_datetime.replace(tzinfo=timezone.utc)
            except Exception as e:
                logging.error(f"Invalid start date format: {e} for input: {start_date}")
                start_datetime = datetime.now(timezone.utc) - timedelta(days=365 * 5)
        else:
            start_datetime = datetime.now(timezone.utc) - timedelta(days=365 * 5)

        if end_date:
            try:
                end_datetime = isoparse(end_date)
                if end_datetime.tzinfo is None:
                    end_datetime = end_datetime.replace(tzinfo=timezone.utc)
            except Exception as e:
                logging.error(f"Invalid end date format: {e} for input: {end_date}")
                end_datetime = datetime.now(timezone.utc)
        else:
            end_datetime = datetime.now(timezone.utc)

        # Load posts from DB within date range
        query = db.query(Post).filter(
        Post.Status == "approved",
        Post.CreatedOn >= start_datetime,
        Post.CreatedOn <= end_datetime,
        )

        if topic:
            query = query.filter(Post.Category == topic)

        posts_db = query.order_by(Post.CreatedOn).all()

        if not posts_db:
            return {"message": "Sentiment trend data retrieved successfully", "data": []}

    
        # Group posts by month
        monthly_data = {}
        for post in posts_db:
            try:
                print(f"Processing post ID: {post.PostID}, CreatedOn: {post.CreatedOn}, Title: {post.Title}")
                if not post.CreatedOn:
                    continue
                month_key = post.CreatedOn.strftime("%m/%Y")

                if month_key not in monthly_data:
                    monthly_data[month_key] = {"Positive": 0, "Negative": 0, "Neutral": 0}

                text_to_classify = f"{post.Title} {post.Content}" if post.Title else post.Content
                processed_text = preprocess_text(
                    text_to_classify,
                    remove_emoji=True,
                    lowercase=True,
                    remove_stopwords=True,
                    stopwords=stopwords,
                    remove_special=True,
                )

                result = sentiment_classifier(processed_text, truncation=True, max_length=100)
                label = result[0]["label"]
                sentiment = {"LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive"}[label]

                monthly_data[month_key][sentiment] += 1
            except Exception as e:
                print(f"Error processing post: {e}")
                continue

        # Convert to required format
        trend_data = []
        for month, counts in monthly_data.items():
            try:
                month_date = datetime.strptime(month, "%m/%Y")
                display_month = month_date.strftime("%m/%Y")

                trend_data.append(
                    {
                        "day": display_month,
                        "Positive": counts["Positive"],
                        "Negative": counts["Negative"],
                        "Neutral": counts["Neutral"],
                    }
                )
            except Exception as e:
                print(f"Error formatting month data: {e}")
                continue

        trend_data.sort(key=lambda x: datetime.strptime(x["day"], "%m/%Y"))

        return {"message": "Sentiment trend data retrieved successfully", "data": trend_data}
    except Exception as e:
        print(f"Error in sentiment trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

