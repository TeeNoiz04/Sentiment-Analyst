"""
User endpoints - Create and find by device_id
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from core.database import get_db
from models.database import User, Post, Vote
from models.schemas import UserCreate, UserUpdate, UserResponse, UserListResponse

router = APIRouter()


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user by device_id or username"""
    try:
        # Check if user with device_id already exists
        if user.DeviceID:
            existing_user = db.query(User).filter(User.DeviceID == user.DeviceID).first()
            if existing_user:
                return existing_user
        
        # Check if user with username already exists
        if user.Username:
            existing_user = db.query(User).filter(User.Username == user.Username).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already exists")
        
        # Create new user
        db_user = User(
            DeviceID=user.DeviceID,
            Username=user.Username,
            PasswordHash=user.PasswordHash,
            FullName=user.FullName,
            Email=user.Email,
            AvatarURL=user.AvatarURL,
            Status="active"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating user: {str(e)}")


@router.get("/device/{device_id}", response_model=UserResponse)
async def get_user_by_device_id(device_id: str, db: Session = Depends(get_db)):
    """Find user by device_id"""
    user = db.query(User).filter(User.DeviceID == device_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/username/{username}", response_model=UserResponse)
async def get_user_by_username(username: str, db: Session = Depends(get_db)):
    """Find user by username"""
    user = db.query(User).filter(User.Username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("", response_model=UserListResponse)
async def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of users to return"),
    status: Optional[str] = Query(None, description="Filter by status: active, banned"),
    db: Session = Depends(get_db)
):
    """Get list of users with pagination"""
    query = db.query(User)
    
    # Apply filters
    if status:
        query = query.filter(User.Status == status)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    users = query.order_by(User.CreatedAt.desc()).offset(skip).limit(limit).all()
    
    return UserListResponse(total=total, users=users)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update a user"""
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        if user_update.Username is not None:
            # Check if username is already taken by another user
            existing = db.query(User).filter(
                User.Username == user_update.Username,
                User.UserID != user_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            user.Username = user_update.Username
        if user_update.FullName is not None:
            user.FullName = user_update.FullName
        if user_update.Email is not None:
            user.Email = user_update.Email
        if user_update.AvatarURL is not None:
            user.AvatarURL = user_update.AvatarURL
        if user_update.PasswordHash is not None:
            user.PasswordHash = user_update.PasswordHash
        if user_update.Status is not None:
            user.Status = user_update.Status
        
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating user: {str(e)}")

