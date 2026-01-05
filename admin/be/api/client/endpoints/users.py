"""
User endpoints - Create and find by device_id
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from pydantic import BaseModel
from core.database import get_db
from models.database import User, Post, UserSession, SessionStatus
from models.schemas import UserUpdate, UserResponse, UserListResponse
from models.auth_schemas import RegisterRequest, RegisterRequest1
from utils.auth import (
    get_current_user,
    get_password_hash,
    create_access_token,
    create_refresh_token,
)

router = APIRouter()


class ProfileUpdate(BaseModel):
    """Schema for profile update"""
    UserID: int
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None


@router.post("", response_model=dict, status_code=201)
async def register(request: RegisterRequest1, req: Request, db: Session = Depends(get_db)):
    """Register a new user with password hashing and initial session"""
    try:
        # Confirm password match
        if request.PasswordHash != request.ConfirmPassword:
            return {"status": 400, "message": "Mật khẩu xác nhận không khớp"}

        # Check username
        existing_user = db.query(User).filter(User.Username == request.Username).first()
        if existing_user:
            return {"status": 400, "message": "Tên đăng nhập đã được đăng ký"}

        # Check email
        if request.Email:
            existing_email = db.query(User).filter(User.Email == request.Email).first()
            if existing_email:
                return {"status": 400, "message": "Email đã được đăng ký"}

        # Check device
        if request.DeviceID:
            existing_device = db.query(User).filter(User.DeviceID == request.DeviceID).first()
            if existing_device:
                return {"status": 400, "message": "Thiết bị đã được đăng ký"}

        # Create user with hashed password
        hashed_password = get_password_hash(request.PasswordHash)
        new_user = User(
            Username=request.Username,
            PasswordHash=hashed_password,
            Email=request.Email or None,
            FullName=request.FullName or None,
            DeviceID=request.DeviceID,
            Status=request.Status or "active",
            IsEmailConfirmed=False,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate tokens
        access_token = create_access_token(data={"sub": new_user.UserID})
        refresh_token = create_refresh_token(data={"sub": new_user.UserID})

        # Save session
        session = UserSession(
            UserID=new_user.UserID,
            AccessToken=access_token,
            RefreshToken=refresh_token,
            DeviceInfo=request.DeviceID,
            IpAddress=req.client.host if req.client else None,
            UserAgent=req.headers.get("user-agent"),
            ExpiresAt=datetime.utcnow() + timedelta(days=30),
            Status=SessionStatus.ACTIVE.value,
        )
        db.add(session)
        db.commit()

        return {
            "status": 201,
            "message": "Đăng ký thành công",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "user_id": new_user.UserID,
                "username": new_user.Username,
                "email": new_user.Email,
                "full_name": new_user.FullName,
                "avatar_url": new_user.AvatarURL,
            },
        }
    except Exception as e:
        db.rollback()
        return {"status": 500, "message": f"Lỗi tạo tài khoản: {str(e)}"}


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
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of users with pagination"""
    print(f"Fetching users with skip={skip}, limit={limit}, status={status}")
    query = db.query(User).filter(User.Status != "deleted")
    if status:
        query = query.filter(User.Status == status)
    
    total = query.count()
    users = query.order_by(User.CreatedAt.desc()).offset(skip).limit(limit).all()
    return UserListResponse(total=total, users=users)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    print("Fetching user with ID:", user_id)
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update a user"""
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        if user_update.Username is not None:
            existing = db.query(User).filter(User.Username == user_update.Username, User.UserID != user_id).first()
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
            hashed_password = get_password_hash(user_update.PasswordHash)
            user.PasswordHash = hashed_password
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


@router.delete("/{user_id}", status_code=200)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.Status = "deleted"
        db.commit()
        return {"message": "User deleted successfully", "userId": user_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting user: {str(e)}")

    
@router.put("/{user_id}/status", response_model=dict)
async def update_user_status(user_id: int, status: str = Query(..., description="New status for the user"), db: Session = Depends(get_db)):
    """Update user status"""
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        user.Status = status
        db.commit()
        db.refresh(user)
        return {"message": "User status updated successfully", "userId": user_id, "newStatus": status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating user status: {str(e)}")
    

@router.get("/{user_id}/activity")
async def get_user_activity(user_id: int, db: Session = Depends(get_db)):
    """Get user activity statistics - posts count and total likes received"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.UserID == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Count user's posts
        posts_count = db.query(func.count(Post.PostID)).filter(Post.UserID == user_id).scalar()
        
        # Count total likes (upvotes) received on user's posts
        likes_count = db.query(func.sum(Post.UpVotes)).filter(Post.UserID == user_id).scalar()
        
        return {
            "status": 200,
            "data": {
                "posts": posts_count or 0,
                "likes": likes_count or 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching user activity: {str(e)}")


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update current user profile (name, email, avatar)"""
    try:
        user = db.query(User).filter(User.UserID == profile_update.UserID ).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update name (FullName)
        if profile_update.name is not None:
            user.FullName = profile_update.name
        
        # Update email
        if profile_update.email is not None:
            # Check if email is already taken by another user
            existing = db.query(User).filter(
                User.Email == profile_update.email,
                User.UserID != profile_update.UserID
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken")
            user.Email = profile_update.email
        
        # Update avatar
        if profile_update.avatar_url is not None:
            user.AvatarURL = profile_update.avatar_url
        
        db.commit()
        db.refresh(user)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating profile: {str(e)}")