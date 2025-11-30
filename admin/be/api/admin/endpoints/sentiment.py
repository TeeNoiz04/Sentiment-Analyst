"""
Admin endpoints for sentiment analysis
"""
from fastapi import APIRouter, Body
from typing import Union, List, Optional, Any
from models_admin import PostRequest, SentimentRequestBody
from api.admin.helpers import get_data, PAGES_CONST
from untils import load_sentiment_model, preprocess_text, extract_sentiment_words, load_stopwords
import random

router = APIRouter()


@router.post("/sentiment")
def sentiment_post(body: Any = Body(...)):
    """
    Analyze sentiment of posts
    Accepts multiple formats:
    1. { "data": [...], "selectedPage": 0 } - SentimentRequestBody
    2. [...] - Array of PostRequest directly
    3. { "data": null, "selectedPage": 0 } - Load from CSV
    """
    try:
        posts_data = []
        selected_page = 0
        
        # Handle different request formats
        if isinstance(body, list):
            # Format 2: Array of PostRequest directly
            posts_data = body
        elif isinstance(body, dict):
            # Format 1 or 3: Dict with data and selectedPage
            posts_data = body.get("data", []) or []
            selected_page = body.get("selectedPage", 0)
        elif hasattr(body, 'data'):
            # Format 1: SentimentRequestBody object
            posts_data = body.data if body.data else []
            selected_page = getattr(body, 'selectedPage', 0)
        
        # If no data provided or empty, load from CSV
        if not posts_data:
            posts_data = get_data(
                PAGES_CONST[selected_page] 
                if selected_page is not None and 0 <= selected_page < len(PAGES_CONST)
                else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)]
            )

        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        stopwords_path = "data/vietnamese-stopwords.txt"
        stopwords = load_stopwords(stopwords_path)

        positive_sentences = []
        negative_sentences = []
        neutral_sentences = []

        for post in posts_data:
            # Handle both PostRequest objects and dicts
            if isinstance(post, dict):
                text = post.get("text", "")
            else:
                text = post.text if hasattr(post, 'text') else str(post)

            if not text:
                continue

            processed_text = preprocess_text(
                text, remove_emoji=True, lowercase=True,
                remove_stopwords=True, stopwords=stopwords, remove_special=True
            )

            try:
                result = sentiment_classifier(processed_text, truncation=True, max_length=100)
                label = result[0]["label"]
                sentiment = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}[label]

                # Use original text for output
                original_text = text
                if sentiment == "positive":
                    positive_sentences.append(original_text)
                elif sentiment == "negative":
                    negative_sentences.append(original_text)
                else:
                    neutral_sentences.append(original_text)
            except Exception as e:
                print(f"⚠️ Error analyzing sentence '{processed_text}': {e}")
                continue

        return {
            "positive": positive_sentences,
            "negative": negative_sentences,
            "neutral": neutral_sentences
        }
    except Exception as e:
        print(f"Error in sentiment_post: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


@router.post("/word-analysis")
def word_analysis(request: PostRequest):
    """Analyze sentiment words in text"""
    try:
        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        stopwords_path = "data/vietnamese-stopwords.txt"
        stopwords = load_stopwords(stopwords_path)

        processed_text = preprocess_text(
            request.text, remove_emoji=True, lowercase=True,
            remove_stopwords=True, stopwords=stopwords, remove_special=True
        )

        sentiment_words = extract_sentiment_words(processed_text, sentiment_classifier)

        return {
            "positive": dict(sorted(sentiment_words["positive"].items(), key=lambda x: x[1]["confidence"], reverse=True)),
            "negative": dict(sorted(sentiment_words["negative"].items(), key=lambda x: x[1]["confidence"], reverse=True)),
            "neutral": dict(sorted(sentiment_words["neutral"].items(), key=lambda x: x[1]["confidence"], reverse=True)),
        }
    except Exception as e:
        return {"error": str(e)}

