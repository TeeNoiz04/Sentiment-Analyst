"""
Helper functions for admin API
"""
import csv
import random
from datetime import datetime, timedelta, timezone
from dateutil.parser import isoparse
from typing import List, Optional
from models_admin import PostRequest
from untils import *
from underthesea import sent_tokenize
from collections import Counter

# Constants
PAGES_CONST = ["Utc2Confessions.csv", "Utc2Zone.csv", "Utc2NoiChiaSeCamXuc.csv", "DienDanNgheSVNoi.csv"]
POS = "Tích cực"
NEG = "Tiêu cực"
NEU = "Trung lập"

# Global models (loaded in server.py)
SENTIMENT_CLASSIFIER_SUMMARY = None
SENTIMENT_TOKENIZER_SUMMARY = None
summary_model_global = None
summary_tokenizer_global = None
stopwords_global = None
device = None


def set_global_models(sentiment_classifier, sentiment_tokenizer, summary_model, summary_tokenizer, stopwords, device_obj):
    """Set global models"""
    global SENTIMENT_CLASSIFIER_SUMMARY, SENTIMENT_TOKENIZER_SUMMARY
    global summary_model_global, summary_tokenizer_global, stopwords_global, device
    SENTIMENT_CLASSIFIER_SUMMARY = sentiment_classifier
    SENTIMENT_TOKENIZER_SUMMARY = sentiment_tokenizer
    summary_model_global = summary_model
    summary_tokenizer_global = summary_tokenizer
    stopwords_global = stopwords
    device = device_obj


def convert_post_to_postrequest(post_db, comment_count: int = 0, use_title: bool = False):
    """
    Convert Post (database) to PostRequest (CSV format)
    
    Args:
        post_db: Post model from database
        comment_count: Number of comments (from relationship)
        use_title: If True, use Title instead of Content (for summary)
    
    Returns:
        PostRequest object
    """
    # Use Title for summary, Content for display
    if use_title:
        text = post_db.Title if post_db.Title else ""
    else:
        text = post_db.Content if post_db.Content else ""
    
    # Create a valid URL (since database doesn't have URL)
    # Use PostID to create a unique URL - must be valid HttpUrl
    url = f"https://app.example.com/posts/{post_db.PostID}"
    
    # Map database fields to PostRequest
    # Note: topic uses Category from DB, or None if not set
    return PostRequest(
        text=text,
        url=url,
        likes=post_db.UpVotes,  # Use UpVotes as likes
        comments=comment_count,  # Use comment count
        shares=0,  # Database doesn't have shares, default to 0
        time=post_db.CreatedOn,
        topic=post_db.Category if post_db.Category else None  # Use Category as topic
    )


def get_data(path):
    """Load data from CSV file"""
    posts = []
    with open(f"data/{path}", mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                row['text'] = row.pop('Text')
                row['likes'] = int(row['Likes'])
                row['comments'] = int(row['Comments'])
                row['shares'] = int(row['Shares'])
                row['time'] = datetime.fromisoformat(row['Time'].replace("Z", "+00:00"))
                row['url'] = row['URL']
                post = PostRequest(**row)
                posts.append(post)
            except Exception as e:
                continue
    return posts


def format_to_iso_string(dt_obj: datetime) -> str:
    """Chuyển đổi đối tượng datetime có tzinfo thành chuỗi ISO 8601"""
    dt_utc = dt_obj.astimezone(timezone.utc)
    iso_str = dt_utc.isoformat(timespec='milliseconds')
    return iso_str.replace('+00:00', 'Z')


def analyze_sentiment_for_summary(text: str) -> str:
    """Phân tích cảm xúc văn bản cho tóm tắt"""
    try:
        processed_text = preprocess_text(
            text, remove_emoji=True, lowercase=True,
            remove_stopwords=True, stopwords=stopwords_global, remove_special=True
        )
        result = SENTIMENT_CLASSIFIER_SUMMARY(processed_text, truncation=True, max_length=100)
        label = result[0]["label"]
        sentiment = {"LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive"}[label]
        return sentiment
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return "Neutral"


def score_sentence_importance(sentence: str) -> float:
    """Đánh giá độ quan trọng của câu"""
    try:
        import torch
        if summary_model_global is None or summary_tokenizer_global is None:
            return 0.5
        
        inputs = summary_tokenizer_global(sentence, return_tensors="pt", truncation=True, padding=True, max_length=256)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            logits = summary_model_global(**inputs).logits
        
        probs = torch.softmax(logits, dim=-1)[0]
        return float(probs[1])
    except Exception as e:
        print(f"Error scoring sentence: {e}")
        return 0.5


def extractive_summary_simple(text: str, top_k: int = 2, min_score: float = 0.5) -> str:
    """Tóm tắt extractive đơn giản"""
    try:
        sentences = sent_tokenize(text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if not sentences:
            return text[:100] + "..." if len(text) > 100 else text
        
        ranked = []
        for s in sentences:
            score = score_sentence_importance(s)
            ranked.append((s, score))
        
        high_score = [(s, sc) for s, sc in ranked if sc >= min_score]
        
        if len(high_score) < top_k:
            ranked = sorted(ranked, key=lambda x: x[1], reverse=True)
            selected = [s for s, _ in ranked[:top_k]]
        else:
            high_score = sorted(high_score, key=lambda x: x[1], reverse=True)
            selected = [s for s, _ in high_score[:top_k]]
        
        return " ".join(selected)
    except Exception as e:
        print(f"Error in extractive summary: {e}")
        return text[:100] + "..."


def generate_school_summary_report(posts: List[PostRequest], titles: Optional[List[str]] = None) -> str:
    """
    Tạo báo cáo tổng hợp từ danh sách phản hồi
    Args:
        posts: List of PostRequest (text field contains Content for analysis)
        titles: Optional list of titles to display (if provided, use titles instead of text for display)
    """
    try:
        if not posts:
            return "Chưa có phản hồi nào để phân tích."
        
        sentiment_counts = Counter()
        positive_examples = []
        negative_examples = []
        
        for idx, post in enumerate(posts):
            # Analyze sentiment using Content (post.text)
            sentiment = analyze_sentiment_for_summary(post.text)
            sentiment_counts[sentiment] += 1
            
            # Get display text: use Title if available, otherwise use Content
            if titles and idx < len(titles) and titles[idx] and titles[idx].strip():
                display_text = titles[idx].strip()  # Use Title for display
                print(f"DEBUG: Using Title for post {idx}: {display_text[:50]}...")
            else:
                display_text = post.text  # Fallback to Content
                print(f"DEBUG: Using Content for post {idx} (no title available)")
            
            if sentiment == "Positive" and len(positive_examples) < 3:
                # Analyze using Content, but display Title
                summary = extractive_summary_simple(post.text, top_k=1, min_score=0.6)
                if len(summary) > 20:
                    # Use Title for display if available
                    positive_examples.append(display_text)
            elif sentiment == "Negative" and len(negative_examples) < 3:
                # Analyze using Content, but display Title
                summary = extractive_summary_simple(post.text, top_k=1, min_score=0.6)
                if len(summary) > 20:
                    # Use Title for display if available
                    negative_examples.append(display_text)
        
        total = len(posts)
        positive_count = sentiment_counts.get("Positive", 0)
        neutral_count = sentiment_counts.get("Neutral", 0)
        negative_count = sentiment_counts.get("Negative", 0)
        
        positive_ratio = (positive_count / total) * 100 if total > 0 else 0
        negative_ratio = (negative_count / total) * 100 if total > 0 else 0
        neutral_ratio = (neutral_count / total) * 100 if total > 0 else 0
        
        # Tạo báo cáo
        if positive_ratio >= 60:
            opening = f"Phần lớn sinh viên (khoảng {positive_ratio:.0f}% phản hồi) thể hiện sự hài lòng cao đối với đội ngũ giảng viên và trải nghiệm học tập."
        elif negative_ratio >= 50:
            opening = f"Khoảng {negative_ratio:.0f}% phản hồi mang tính tiêu cực, phản ánh sự không hài lòng về các khía cạnh của nhà trường."
        elif neutral_ratio >= 50:
            opening = f"Phần lớn sinh viên có quan điểm trung lập (khoảng {neutral_ratio:.0f}%), không thể hiện rõ ràng sự hài lòng hay không hài lòng."
        else:
            opening = f"Ý kiến sinh viên khá đa dạng với {positive_ratio:.0f}% tích cực, {negative_ratio:.0f}% tiêu cực, và {neutral_ratio:.0f}% trung lập."
        
        details = []
        if positive_count > 0:
            if positive_examples:
                pos_text = " ".join(positive_examples[:2])
                details.append(f"Các nhận xét tích cực tập trung vào: {pos_text}")
            else:
                details.append(f"Có {positive_count} đánh giá tích cực về giảng viên và môi trường học tập.")
        
        if negative_count > 0:
            if negative_examples:
                neg_text = " ".join(negative_examples[:2])
                details.append(f"Một số góp ý cần cải thiện: {neg_text}")
            else:
                details.append(f"Có {negative_count} đánh giá tiêu cực liên quan đến cơ sở vật chất và quy trình học tập.")
        
        if positive_ratio >= 60:
            closing = f"Nhìn chung, sinh viên đánh giá cao trải nghiệm học tập tại trường với {positive_count} đánh giá tích cực."
        elif negative_ratio >= 50:
            closing = f"Nhà trường cần chú ý cải thiện các vấn đề được phản ánh trong {negative_count} đánh giá tiêu cực."
        else:
            closing = f"Dữ liệu cho thấy có {positive_count} đánh giá tích cực, {negative_count} tiêu cực, và {neutral_count} trung lập."
        
        report_parts = [opening]
        if details:
            report_parts.extend(details)
        report_parts.append(closing)
        
        return " ".join(report_parts)
    except Exception as e:
        print(f"Error in generate_school_summary_report: {e}")
        total = len(posts)
        return f"Hệ thống đã phân tích {total} phản hồi từ sinh viên. Vui lòng thử lại để xem báo cáo chi tiết."
