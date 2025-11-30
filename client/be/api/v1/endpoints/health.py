"""
Health check endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}


@router.get("/detailed")
async def health_detailed():
    """Detailed health check"""
    return {
        "status": "ok",
        "service": "FastAPI Backend",
        "version": "1.0.0"
    }

