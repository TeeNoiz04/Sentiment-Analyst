"""
User endpoints - Create and find by device_id
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import User
from models.schemas import UserCreate, UserUpdate, UserResponse, UserListResponse

router = APIRouter()


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user by device_id or username"""
    try:
        if user.DeviceID:
            existing_user = db.query(User).filter(User.DeviceID == user.DeviceID).first()
            if existing_user:
                return existing_user
        
        if user.Username:
            existing_user = db.query(User).filter(User.Username == user.Username).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already exists")
        
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