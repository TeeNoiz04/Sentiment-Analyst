"""
Client API v1 Router - Prefix: /api/v1/client
"""
from fastapi import APIRouter

# Import endpoints
try:
    from api.client.endpoints import (
        health, posts, users, reports, votes, comments,
        roles, permissions, code_types, codes, auth
    )
    
    client_api_router = APIRouter()
    
    # Include routers with client prefix
    client_api_router.include_router(health.router, prefix="/health", tags=["client-health"])
    client_api_router.include_router(auth.router, prefix="/auth", tags=["client-auth"])
    client_api_router.include_router(posts.router, prefix="/posts", tags=["client-posts"])
    client_api_router.include_router(users.router, prefix="/users", tags=["client-users"])
    client_api_router.include_router(reports.router, prefix="/reports", tags=["client-reports"])
    client_api_router.include_router(votes.router, prefix="/votes", tags=["client-votes"])
    client_api_router.include_router(comments.router, prefix="/comments", tags=["client-comments"])
    client_api_router.include_router(roles.router, prefix="/roles", tags=["client-roles"])
    client_api_router.include_router(permissions.router, prefix="/permissions", tags=["client-permissions"])
    client_api_router.include_router(code_types.router, prefix="/code-types", tags=["client-code-types"])
    client_api_router.include_router(codes.router, prefix="/codes", tags=["client-codes"])
except ImportError as e:
    # If endpoints not available, create empty router
    print(f"Warning: Client API endpoints not available: {e}")
    client_api_router = APIRouter()
