"""
Admin endpoints for topic modeling
"""
from fastapi import APIRouter, HTTPException
from models_admin import SentimentRequestBody
from api.admin.helpers import get_data, PAGES_CONST
from api.admin.models import load_topic_model, analyze_topic
from untils import load_sentiment_model
import random

router = APIRouter()


@router.post("/topic-modeling")
def post_topics(body: SentimentRequestBody):
    """Classify posts by topic"""
    try:
        if not body.data:
            body.data = get_data(PAGES_CONST[body.selectedPage] if body.selectedPage is not None else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])

        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        if not sentiment_classifier or not tokenizer:
            raise Exception("Failed to load sentiment model")
        
        body.data.sort(key=lambda post: post.time)
        relevant_posts = body.data
        
        filtered_posts_facility = []
        filtered_posts_lecture = []
        filtered_posts_student = []
        filtered_posts_program = []
        
        try:
            topic_model, topic_tokenizer, device = load_topic_model()
            if topic_model and topic_tokenizer:
                for post in relevant_posts:
                    result = analyze_topic(post.text, topic_model, topic_tokenizer, device)
                    if result and result["topic"] == "LABEL_0":
                        filtered_posts_facility.append(post)
                    elif result and result["topic"] == "LABEL_1":
                        filtered_posts_lecture.append(post)
                    elif result and result["topic"] == "LABEL_2":
                        filtered_posts_student.append(post)
                    elif result and result["topic"] == "LABEL_3":
                        filtered_posts_program.append(post)
        except Exception as e:
            print(f"Error in topic filtering: {e}")
        
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

