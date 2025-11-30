"""
Admin API Router
"""
from fastapi import APIRouter
from api.admin.endpoints import posts, sentiment, topic, summary, trend

admin_api_router = APIRouter()

# Include admin routers (no prefix to keep original endpoints)
admin_api_router.include_router(posts.router, tags=["Admin - Posts"])
admin_api_router.include_router(sentiment.router, tags=["Admin - Sentiment"])
admin_api_router.include_router(topic.router, tags=["Admin - Topic"])
admin_api_router.include_router(summary.router, tags=["Admin - Summary"])
admin_api_router.include_router(trend.router, tags=["Admin - Trend"])
