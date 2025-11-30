"""
Admin endpoints for sentiment trend analysis
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timedelta, timezone
from dateutil.parser import isoparse
import logging
from models_admin import PostRequest
from api.admin.helpers import get_data, PAGES_CONST
from untils import load_sentiment_model, preprocess_text, load_stopwords
from api.admin.models import load_topic_model, analyze_topic
import random

router = APIRouter()


@router.get("/sentiment-trend")
async def get_sentiment_trend(
    selectedPage: Optional[int] = 0,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    topic: Optional[str] = None
):
    """Get sentiment trend over time"""
    try:
        all_posts = get_data(PAGES_CONST[selectedPage] if selectedPage is not None else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])

        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        if not sentiment_classifier or not tokenizer:
            raise Exception("Failed to load sentiment model")

        stopwords_path = "data/vietnamese-stopwords.txt"
        stopwords = load_stopwords(stopwords_path)

        all_posts.sort(key=lambda post: post.time)

        if start_date:
            try:
                start_datetime = isoparse(start_date)
                if start_datetime.tzinfo is None:
                    start_datetime = start_datetime.replace(tzinfo=timezone.utc)
            except Exception as e:
                logging.error(f"Invalid start date format: {e} for input: {start_date}")
                start_datetime = datetime.now(timezone.utc) - timedelta(days=365*5)
        else:
            start_datetime = datetime.now(timezone.utc) - timedelta(days=365*5)

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

        relevant_posts = [post for post in all_posts if start_datetime <= post.time <= end_datetime]

        # Filter by topic if provided
        if topic:
            try:
                topic_model, topic_tokenizer, device = load_topic_model()
                if topic_model and topic_tokenizer:
                    filtered_posts = []
                    for post in relevant_posts:
                        result = analyze_topic(post.text, topic_model, topic_tokenizer, device)
                        if result and result["topic"] == topic:
                            filtered_posts.append(post)
                    relevant_posts = filtered_posts
            except Exception as e:
                print(f"Error in topic filtering: {e}")

        # Group posts by month
        monthly_data = {}
        for post in relevant_posts:
            try:
                month_key = post.time.strftime("%m/%Y")
                
                if month_key not in monthly_data:
                    monthly_data[month_key] = {"Positive": 0, "Negative": 0, "Neutral": 0}

                processed_text = preprocess_text(
                    post.text, remove_emoji=True, lowercase=True,
                    remove_stopwords=True, stopwords=stopwords, remove_special=True
                )

                result = sentiment_classifier(processed_text, truncation=True, max_length=100)
                label = result[0]["label"]
                sentiment = {"LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive"}[label]

                monthly_data[month_key][sentiment] += 1
            except Exception as e:
                print(f"Error processing post: {e}")
                continue

        # Convert to required format
        result = []
        for month, counts in monthly_data.items():
            try:
                month_date = datetime.strptime(month, "%m/%Y")
                display_month = month_date.strftime("%m/%Y")
                
                result.append({
                    "day": display_month,
                    "Positive": counts["Positive"],
                    "Negative": counts["Negative"],
                    "Neutral": counts["Neutral"]
                })
            except Exception as e:
                print(f"Error formatting month data: {e}")
                continue

        result.sort(key=lambda x: datetime.strptime(x["day"], "%m/%Y"))
        
        return {
            "message": "Sentiment trend data retrieved successfully",
            "data": result
        }
    except Exception as e:
        print(f"Error in sentiment trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

