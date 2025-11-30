"""
API v1 Router
"""
from fastapi import APIRouter
from api.v1.endpoints import (
    health, example, posts, users, reports, votes, comments,
    roles, permissions, code_types, codes
)

api_router = APIRouter()

# Include routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(example.router, prefix="/example", tags=["example"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(votes.router, prefix="/votes", tags=["votes"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(permissions.router, prefix="/permissions", tags=["permissions"])
api_router.include_router(code_types.router, prefix="/code-types", tags=["code-types"])
api_router.include_router(codes.router, prefix="/codes", tags=["codes"])

