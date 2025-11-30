"""
Main FastAPI Application
Combines Admin APIs (NLP/ML) and Client APIs (CRUD)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from untils import load_sentiment_model, load_stopwords, device

# Import admin and client API routers
try:
    from api.admin import admin_api_router
    from api.client import client_api_router
    from core.database import init_db
    # Initialize database for client APIs
    init_db()
    print("✓ Client API modules loaded and database initialized")
except ImportError as e:
    print(f"⚠ Warning: API modules not available: {e}")
    admin_api_router = None
    client_api_router = None


# Debug: Print registered routes
if admin_api_router:
    print("✓ Admin router loaded with endpoints:")
    for r in admin_api_router.routes:
        if hasattr(r, 'path'):
            print(f"  - {r.path}")

if client_api_router:
    print("✓ Client router loaded with endpoints:")
    for r in client_api_router.routes:
        if hasattr(r, 'path'):
            print(f"  - {r.path}")

# Load API key from .env
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="NLP ML Backend API",
    description="Backend API for Admin (NLP/ML) and Client (CRUD) endpoints",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML Models for Admin API
print("Loading ML models for Admin API...")

# Load Sentiment Model
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

# Load stopwords
stopwords_path_global = "data/vietnamese-stopwords.txt"
stopwords_global = load_stopwords(stopwords_path_global)

# Set global models for admin helpers
if admin_api_router:
    from api.admin.helpers import set_global_models
    set_global_models(
        SENTIMENT_CLASSIFIER_SUMMARY,
        SENTIMENT_TOKENIZER_SUMMARY,
        summary_model_global,
        summary_tokenizer_global,
        stopwords_global,
        device
    )
    print("✓ Global models set for admin helpers")

# Include Admin API router (no prefix - keep original endpoints)
if admin_api_router:
    app.include_router(admin_api_router)
    print("✓ Admin API routes registered (original endpoints preserved)")

# Include Client API router with prefix to avoid conflicts
if client_api_router:
    app.include_router(client_api_router, prefix="/client", tags=["Client API"])
    print("✓ Client API routes registered at /client/*")

print("\n🚀 Server ready!")
print("   - Admin APIs: /posts, /sentiment, /word-analysis, /topic-modeling, /sentiment-trend, /school-summary-2")
print("   - Client APIs: /client/*")
print("   - API Docs: http://localhost:8000/docs\n")
