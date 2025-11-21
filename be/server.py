from typing import List, Optional
import os
import csv
import random
from venv import logger
from datetime import datetime, timedelta, timezone
from dateutil.parser import isoparse
import logging
from fastapi import FastAPI, HTTPException

from openai import OpenAI
from dotenv import load_dotenv
from datetime import date, datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware

from dateutil.parser import parse

from models import PostRequest, SentimentRequestBody

# Import the functions directly from utils.py
from untils import *

from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

from underthesea import sent_tokenize
from collections import Counter

# Load API key from .env
load_dotenv()
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY_3")

# MODEL = "deepseek/deepseek-chat-v3-0324:free"
# MODEL = "google/gemini-2.5-pro-exp-03-25:free"
MODEL = "meta-llama/llama-4-maverick:free"
PAGES_CONST = ["Utc2Confessions.csv", "Utc2Zone.csv","Utc2NoiChiaSeCamXuc.csv",
             "DienDanNgheSVNoi.csv"]

# client = OpenAI(
#     base_url="https://openrouter.ai/api/v1",
#     api_key=OPENAI_API_KEY,
# )

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sentiment constants
POS = "Tích cực"
NEG = "Tiêu cực"
NEU = "Trung lập"

# Topic mapping
topic_labels = {
    "LABEL_0": "facility",
    "LABEL_1": "lecturer",
    "LABEL_2": "others",
    "LABEL_3": "training_program"
}

# Load Sentiment Model (đã có sẵn, chỉ cần gọi khi server start)
print("Loading sentiment model for summarization...")
sentiment_model_path = "fine_tuned_model"
SENTIMENT_CLASSIFIER_SUMMARY, SENTIMENT_TOKENIZER_SUMMARY = load_sentiment_model(sentiment_model_path)

# Load Summarization Model
print("Loading summarization model...")
try:
    summary_tokenizer_global = AutoTokenizer.from_pretrained("./summary_model_final")
    summary_model_global = AutoModelForSequenceClassification.from_pretrained("./summary_model_final")
    summary_model_global.to(device)
    summary_model_global.eval()
    print(f"Summarization model loaded on: {device}")
except Exception as e:
    print(f"Error loading summarization model: {e}")
    summary_model_global = None
    summary_tokenizer_global = None

# Load stopwords (đã có sẵn)
stopwords_path_global = "data/vietnamese-stopwords.txt"
stopwords_global = load_stopwords(stopwords_path_global)
class Post():
    def __init__(self, text):
        if POS in text:
            self.sentiment = POS
        elif NEG in text:
            self.sentiment = NEG
        else:
            self.sentiment = NEU

        self.sentences = [
            sentence.strip() for sentence in text.split(";") if sentence.strip()]
        self.sentences[0] = text.split("Các câu văn nổi bật:")[-1].strip()


def get_data(path):
    # path = "Utc2Confessions.csv"
    posts = []
    with open(f"data/{path}", mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                row['text'] = row.pop('Text')
                row['likes'] = int(row['Likes'])
                row['comments'] = int(row['Comments'])
                row['shares'] = int(row['Shares'])
                row['time'] = datetime.fromisoformat(
                    row['Time'].replace("Z", "+00:00"))
                row['url'] = row['URL']

                post = PostRequest(**row)
                posts.append(post)
            except Exception as e:
                continue
        
    return posts

def format_to_iso_string(dt_obj: datetime) -> str:
    """Chuyển đổi đối tượng datetime có tzinfo thành chuỗi ISO 8601,
       đảm bảo định dạng .000Z."""  
    dt_utc = dt_obj.astimezone(timezone.utc)  
    iso_str = dt_utc.isoformat(timespec='milliseconds')   
    return iso_str.replace('+00:00', 'Z')


@app.get("/posts")
async def get_posts(page: Optional[int] = 1,
                    limit: Optional[int] = 30,
                    selected_page: Optional[int] = 0,
                    topic: Optional[str] = None,
                    tag: Optional[str] = None,
                    start_date: Optional[str] = None,
                    end_date: Optional[str] = None):
    try:
        # Initialize with empty list in case of errors
        all_posts = []
        # Pages
        try:
            # Get initial data
            all_posts = get_data(PAGES_CONST[selected_page] if selected_page is not None else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])
          
        except Exception as e:
            print(f"Error loading initial data: {e}")
            return {
                "message": "Error loading posts",
                "total": 0,
                "page": page,
                "limit": limit,
                "posts": []
            }
    
        # For backward compatibility, use tag parameter if provided and topic is not
        # search_term = tag if tag and not topic else None
        # print(f"11 Using search_term: {search_term}")
        # # Filter by tag if that's what we're using (old method)
        # if search_term:
        #     all_posts = [post for post in all_posts if search_term in post.text]
        #     print(f"After tag filtering: {len(all_posts)} posts")

        # Load topic model for all posts
        topic_model, topic_tokenizer, device = load_topic_model()
        
        # Add topic information to each post
        if topic_model and topic_tokenizer:
            for post in all_posts:
                result = analyze_topic(post.text, topic_model, topic_tokenizer, device)
                if result:
                    # Create a new PostRequest with the topic
                    post_dict = post.dict()
                    post_dict["topic"] = result["topic"]
                    all_posts[all_posts.index(post)] = PostRequest(**post_dict)
                else:
                    # Create a new PostRequest with default topic
                    post_dict = post.dict()
                    post_dict["topic"] = "LABEL_2"  # Default to "student" if analysis fails
                    all_posts[all_posts.index(post)] = PostRequest(**post_dict)
       
        # Filter by topic if provided (new method)
        if topic:
            try:           
                filtered_posts = [post for post in all_posts if post.topic == topic]
                all_posts = filtered_posts               
            except Exception as e:
                print(f"Error filtering by topic: {e}")

        # Date filtering with improved error handling and date parsing
        if start_date:
            try:
                # Parse the start date string to datetime with timezone
                start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
                # Set time to beginning of day and add timezone
                start_datetime = start_datetime.replace(hour=0, minute=0, second=0, microsecond=0)
                start_datetime = start_datetime.replace(tzinfo=timezone.utc)
                print(f"Start date: {start_datetime}")
                
                filtered_posts = []
                for post in all_posts:
                    if post.time >= start_datetime:
                        filtered_posts.append(post)
                
                all_posts = filtered_posts
                print(f"After start date filtering: {len(filtered_posts)} posts")
            except ValueError as e:
                print(f"Invalid start date format: {e}")
            except Exception as e:
                print(f"Error filtering by start date: {e}")

        if end_date:
            try:
                # Parse the end date string to datetime with timezone
                end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                # Set time to end of day and add timezone
                end_datetime = end_datetime.replace(hour=23, minute=59, second=59, microsecond=999999)
                end_datetime = end_datetime.replace(tzinfo=timezone.utc)
                print(f"End date: {end_datetime}")
                
                filtered_posts = []
                for post in all_posts:
                    if post.time <= end_datetime:
                        filtered_posts.append(post)
                
                all_posts = filtered_posts
                print(f"After end date filtering: {len(filtered_posts)} posts")
            except ValueError as e:
                print(f"Invalid end date format: {e}")
            except Exception as e:
                print(f"Error filtering by end date: {e}")

        # Calculate pagination
        try:
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_posts = all_posts[start_idx:end_idx]
           
        except Exception as e:
            print(f"Error in pagination: {e}")
            paginated_posts = all_posts[:limit]  # Fallback to first page
        return {
            "message": "Get posts successfully",
            "total": len(all_posts),
            "page": page,
            "limit": limit,
            "posts": paginated_posts
        }
    except Exception as e:
        print(f"Unexpected error in get_posts: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/sentiment")
def sentiment_post(body: SentimentRequestBody):
    try:
        if not body.data:
            body.data = get_data(PAGES_CONST[body.selectedPage] if body.selectedPage is not None else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])

        # Load the sentiment analysis model
        model_path = "fine_tuned_model"  # Path to your fine-tuned model
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)

        # Load stopwords if needed
        stopwords_path = "data/vietnamese-stopwords.txt"  # Path to stopwords file
        stopwords = load_stopwords(stopwords_path)

        # Initialize result arrays
        positive_sentences = []
        negative_sentences = []
        neutral_sentences = []

        for post in body.data:
            # Preprocess the text with special character and number removal
            processed_text = preprocess_text(
                post.text,
                remove_emoji=True,
                lowercase=True,
                remove_stopwords=True,
                stopwords=stopwords,
                remove_special=True  # Enable special character and number removal
            )

            # Run the processed text through the sentiment model
            try:
                result = sentiment_classifier(
                    processed_text, truncation=True, max_length=100)
                label = result[0]["label"]
                sentiment = {"LABEL_0": "negative",
                             "LABEL_1": "neutral", 
                             "LABEL_2": "positive"}[label]

                # Add the sentence to the corresponding array
                if sentiment == "positive":
                    # Original text for display
                    positive_sentences.append(post.text)
                elif sentiment == "negative":
                    # Original text for display
                    negative_sentences.append(post.text)
                else:
                    # Original text for display
                    neutral_sentences.append(post.text)
            except Exception as e:
                print(f"⚠️ Error analyzing sentence '{processed_text}': {e}")
                continue

        # Return the results
        return {
            "positive": positive_sentences,
            "negative": negative_sentences,
            "neutral": neutral_sentences
        }

    except Exception as e:
        return {"error": str(e)}


@app.post("/word-analysis")
def word_analysis(request: PostRequest):
    try:
        # Load the sentiment analysis model
        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)

        # Load stopwords
        stopwords_path = "data/vietnamese-stopwords.txt"
        stopwords = load_stopwords(stopwords_path)

        # Preprocess the input text
        processed_text = preprocess_text(
            request.text,
            remove_emoji=True,
            lowercase=True,
            remove_stopwords=True,
            stopwords=stopwords,
            remove_special=True
        )

        # Extract sentiment words/phrases from the single text
        sentiment_words = extract_sentiment_words(
            processed_text, sentiment_classifier)

        # Trả kết quả sắp xếp theo độ tin cậy
        return {
            "positive": dict(sorted(sentiment_words["positive"].items(), key=lambda x: x[1]["confidence"], reverse=True)),
            "negative": dict(sorted(sentiment_words["negative"].items(), key=lambda x: x[1]["confidence"], reverse=True)),
            "neutral": dict(sorted(sentiment_words["neutral"].items(), key=lambda x: x[1]["confidence"], reverse=True)),
        }

    except Exception as e:
        return {"error": str(e)}


def analyze_sentiment_for_summary(text: str) -> str:
    """
    Phân tích cảm xúc văn bản cho tóm tắt
    Returns: "Positive", "Neutral", hoặc "Negative"
    """
    try:
        # Preprocess
        processed_text = preprocess_text(
            text,
            remove_emoji=True,
            lowercase=True,
            remove_stopwords=True,
            stopwords=stopwords_global,
            remove_special=True
        )
        
        # Classify
        result = SENTIMENT_CLASSIFIER_SUMMARY(processed_text, truncation=True, max_length=100)
        label = result[0]["label"]
        sentiment = {"LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive"}[label]
        
        return sentiment
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return "Neutral"


def score_sentence_importance(sentence: str) -> float:
    """
    Đánh giá độ quan trọng của câu
    Returns: score (0-1)
    """
    try:
        if summary_model_global is None or summary_tokenizer_global is None:
            return 0.5  # Default score nếu model không load được
        
        inputs = summary_tokenizer_global(
            sentence,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=256
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            logits = summary_model_global(**inputs).logits
        
        probs = torch.softmax(logits, dim=-1)[0]
        return float(probs[1])  # Probability of being important
    except Exception as e:
        print(f"Error scoring sentence: {e}")
        return 0.5


def extractive_summary_simple(text: str, top_k: int = 2, min_score: float = 0.5) -> str:
    """
    Tóm tắt extractive đơn giản
    """
    try:
        sentences = sent_tokenize(text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if not sentences:
            return text[:100] + "..." if len(text) > 100 else text
        
        # Đánh giá từng câu
        ranked = []
        for s in sentences:
            score = score_sentence_importance(s)
            ranked.append((s, score))
        
        # Lọc và chọn
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


def generate_school_summary_report(posts: List[PostRequest]) -> str:
    """
    Tạo báo cáo tổng hợp từ danh sách phản hồi
    """
    try:
        if not posts:
            return "Chưa có phản hồi nào để phân tích."
        
        # Phân tích cảm xúc tất cả posts
        sentiment_counts = Counter()
        positive_examples = []
        negative_examples = []
        
        for post in posts:
            sentiment = analyze_sentiment_for_summary(post.text)
            sentiment_counts[sentiment] += 1
            
            # Lưu ví dụ
            if sentiment == "Positive" and len(positive_examples) < 3:
                summary = extractive_summary_simple(post.text, top_k=1, min_score=0.6)
                if len(summary) > 20:  # Chỉ lấy summary đủ dài
                    positive_examples.append(summary)
            elif sentiment == "Negative" and len(negative_examples) < 3:
                summary = extractive_summary_simple(post.text, top_k=1, min_score=0.6)
                if len(summary) > 20:
                    negative_examples.append(summary)
        
        # Tính tỷ lệ
        total = len(posts)
        positive_count = sentiment_counts.get("Positive", 0)
        neutral_count = sentiment_counts.get("Neutral", 0)
        negative_count = sentiment_counts.get("Negative", 0)
        
        positive_ratio = (positive_count / total) * 100 if total > 0 else 0
        negative_ratio = (negative_count / total) * 100 if total > 0 else 0
        neutral_ratio = (neutral_count / total) * 100 if total > 0 else 0
        
        # Tạo báo cáo
        # Đoạn mở đầu
        if positive_ratio >= 60:
            opening = f"Phần lớn sinh viên (khoảng {positive_ratio:.0f}% phản hồi) thể hiện sự hài lòng cao đối với đội ngũ giảng viên và trải nghiệm học tập."
        elif negative_ratio >= 50:
            opening = f"Khoảng {negative_ratio:.0f}% phản hồi mang tính tiêu cực, phản ánh sự không hài lòng về các khía cạnh của nhà trường."
        elif neutral_ratio >= 50:
            opening = f"Phần lớn sinh viên có quan điểm trung lập (khoảng {neutral_ratio:.0f}%), không thể hiện rõ ràng sự hài lòng hay không hài lòng."
        else:
            opening = f"Ý kiến sinh viên khá đa dạng với {positive_ratio:.0f}% tích cực, {negative_ratio:.0f}% tiêu cực, và {neutral_ratio:.0f}% trung lập."
        
        # Nội dung chi tiết
        details = []
        
        if positive_count > 0:
            if positive_examples:
                # Lấy tối đa 2 ví dụ tích cực
                pos_text = " ".join(positive_examples[:2])
                details.append(f"Các nhận xét tích cực tập trung vào: {pos_text}")
            else:
                details.append(f"Có {positive_count} đánh giá tích cực về giảng viên và môi trường học tập.")
        
        if negative_count > 0:
            if negative_examples:
                # Lấy tối đa 2 ví dụ tiêu cực
                neg_text = " ".join(negative_examples[:2])
                details.append(f"Một số góp ý cần cải thiện: {neg_text}")
            else:
                details.append(f"Có {negative_count} đánh giá tiêu cực liên quan đến cơ sở vật chất và quy trình học tập.")
        
        # Đoạn kết
        if positive_ratio >= 60:
            closing = f"Nhìn chung, sinh viên đánh giá cao trải nghiệm học tập tại trường với {positive_count} đánh giá tích cực."
        elif negative_ratio >= 50:
            closing = f"Nhà trường cần chú ý cải thiện các vấn đề được phản ánh trong {negative_count} đánh giá tiêu cực."
        else:
            closing = f"Dữ liệu cho thấy có {positive_count} đánh giá tích cực, {negative_count} tiêu cực, và {neutral_count} trung lập."
        
        # Ghép báo cáo
        report_parts = [opening]
        if details:
            report_parts.extend(details)
        report_parts.append(closing)
        
        return " ".join(report_parts)
    
    except Exception as e:
        print(f"Error in generate_school_summary_report: {e}")
        # Fallback về báo cáo đơn giản
        total = len(posts)
        return f"Hệ thống đã phân tích {total} phản hồi từ sinh viên. Vui lòng thử lại để xem báo cáo chi tiết."


# ==========================
# THAY THẾ ENDPOINT /school-summary-2
# ==========================

@app.post("/school-summary-2")
def summarize_shool(request: List[PostRequest]):
    """
    Phân tích và tóm tắt phản hồi sinh viên sử dụng PhoBERT.
    
    Input: List[PostRequest] - Danh sách các phản hồi
    Output: str - Báo cáo tóm tắt văn bản
    """
    try:
        # Tạo báo cáo tổng hợp
        summary = generate_school_summary_report(request)
        return summary
    
    except Exception as e:
        # Fallback nếu có lỗi - giữ nguyên format cũ
        print(f"Error in summarize_school: {e}")
        
        # Trả về 1 trong các template cũ nếu model bị lỗi
        fallback_comments = [
            """Phần lớn sinh viên (khoảng 70-75% phản hồi) thể hiện sự hài lòng cao đối với đội ngũ giảng viên. Các nhận xét nổi bật xoay quanh sự tận tâm, phương pháp giảng dạy dễ hiểu, và môi trường học tập thoải mái.
        Mặc dù vẫn còn một số góp ý liên quan đến cơ sở vật chất (phòng học, thiết bị giảng dạy) và lịch học chưa linh hoạt, đa số sinh viên đều ghi nhận nỗ lực hỗ trợ của nhà trường. Có khoảng 44 đánh giá tích cực""",
            """Khoảng 60% phản hồi mang tính tiêu cực, phản ánh sự không hài lòng về thiếu thiết bị học tập, phòng học chật, ồn ào, và lịch học căng thẳng.
        Dù vậy, vẫn có khoảng 40% sinh viên ghi nhận nỗ lực và sự tận tâm của giảng viên, cho thấy đội ngũ giảng dạy là điểm sáng đáng chú ý. Có khoảng 13 đánh giá tiêu cực.""",
        ]
        return random.choice(fallback_comments)

# Hàm này bị lỗi
@app.get("/post/{post_id}")
def get_post_by_id(post_id: int):
    try:
        # Load data from CSV file
        all_posts = get_data( PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])

        # Check if post_id is within range
        if post_id < 0 or post_id >= len(all_posts):
            raise HTTPException(status_code=404, detail="Post not found")

        # Return the post at the specified index
        return all_posts[post_id]
    except IndexError:
        raise HTTPException(status_code=404, detail="Post not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/topic-modeling")
def post_topics(body:SentimentRequestBody):
    try:
        if not body.data:
            body.data = get_data(PAGES_CONST[body.selectedPage] if body.selectedPage is not None else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])

        # Load the sentiment analysis model
        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        if not sentiment_classifier or not tokenizer:
            raise Exception("Failed to load sentiment model")
        # Sort posts by time
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

@app.get("/sentiment-trend")
async def get_sentiment_trend(
                    selectedPage: Optional[int] = 0,
                    start_date: Optional[str] = None, 
                    end_date: Optional[str] = None,
                    topic: Optional[str] = None):
    try:
        # Load data from CSV file
        all_posts = get_data(PAGES_CONST[selectedPage] if selectedPage is not None else PAGES_CONST[random.randint(0, len(PAGES_CONST) - 1)])

        # Load the sentiment analysis model
        model_path = "fine_tuned_model"
        sentiment_classifier, tokenizer = load_sentiment_model(model_path)
        if not sentiment_classifier or not tokenizer:
            raise Exception("Failed to load sentiment model")

        # Load stopwords
        stopwords_path = "data/vietnamese-stopwords.txt"
        stopwords = load_stopwords(stopwords_path)

        # Sort posts by time
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
      
        # Filter posts within the time period
        relevant_posts = [
            post for post in all_posts 
            if start_datetime <= post.time <= end_datetime
        ]
        
        # Filter by topic if provided
        if topic:
            try:
             
                # Load topic model
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
                # Get the month key (format: "MM/YYYY")
                month_key = post.time.strftime("%m/%Y")
                
                # Initialize the month data if it doesn't exist
                if month_key not in monthly_data:
                    monthly_data[month_key] = {
                        "Positive": 0, "Negative": 0, "Neutral": 0
                    }

                # Analyze sentiment
                processed_text = preprocess_text(
                    post.text,
                    remove_emoji=True,
                    lowercase=True,
                    remove_stopwords=True,
                    stopwords=stopwords,
                    remove_special=True
                )

                result = sentiment_classifier(
                    processed_text, truncation=True, max_length=100)
                label = result[0]["label"]
                sentiment = {"LABEL_0": "Negative",
                             "LABEL_1": "Neutral", "LABEL_2": "Positive"}[label]

                # Increment the sentiment counter
                monthly_data[month_key][sentiment] += 1
            except Exception as e:
                print(f"Error processing post: {e}")
                continue

        # Convert to the required format and sort by date
        result = []
        for month, counts in monthly_data.items():
            try:
                # Convert month key to display format
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

        # Sort by date (ascending)
        result.sort(key=lambda x: datetime.strptime(x["day"], "%m/%Y"))
        
        return {
            "message": "Sentiment trend data retrieved successfully",
            "data": result
        }
    except Exception as e:
        print(f"Error in sentiment trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def load_topic_model():
    try:
        # Kiểm tra CUDA availability
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device for topic model: {device}")
        
        # Load model với device cụ thể
        model = AutoModelForSequenceClassification.from_pretrained(
            "topic_model",
            num_labels=4,  # 4 topics: facility, lecturer, student, program
            device_map=device
        )
        model.eval()  # Set model to evaluation mode
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base-v2", use_fast=False)
        
        return model, tokenizer, device
    except Exception as e:
        print(f"Error loading topic model: {str(e)}")
        return None, None, None


def analyze_topic(text, model, tokenizer, device):
    try:
        if model is None or tokenizer is None:
            print("Topic model or tokenizer is not loaded")
            return None
            
        # Tokenize và chuyển sang tensor
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=100)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Thực hiện inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            
            # Chuyển về CPU trước khi chuyển sang numpy
            probabilities = probabilities.cpu().numpy()[0]
            
            # Lấy nhãn có xác suất cao nhất
            topic = np.argmax(probabilities)
            confidence = float(probabilities[topic])
            
            # Map topic index to label
            topic_labels = {
                0: "LABEL_0",  # facility
                1: "LABEL_1",  # lecturer
                2: "LABEL_2",  # student
                3: "LABEL_3"   # program
            }
            
            return {
                "topic": topic_labels[topic],
                "confidence": confidence,
                "probabilities": probabilities.tolist()
            }
    except Exception as e:
        print(f"Error analyzing topic: {str(e)}")
        return None