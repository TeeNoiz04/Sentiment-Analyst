"""
Authentication endpoints - Login, Register, Logout, Token refresh
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from core.database import get_db
from models.database import User, UserSession, SessionStatus
from models.auth_schemas import (
    LoginRequest, RegisterRequest, TokenResponse, 
    RefreshTokenRequest, PasswordChangeRequest
)
from utils.auth import (
    verify_password, get_password_hash, 
    create_access_token, create_refresh_token,
    decode_token, get_current_user
)

router = APIRouter()
security = HTTPBearer()

# In-memory blacklist for tokens (in production, use Redis)
token_blacklist = set()


@router.post("/register", response_model=dict, status_code=201)
async def register(request: RegisterRequest, req: Request, db: Session = Depends(get_db)):
    """Register a new user"""
    try:

        # Check if username exists
        existing_user = db.query(User).filter(User.Username == request.username).first()
        if existing_user:
            return {
                "status": 400,
                "message": "Tên đăng nhập đã được đăng ký"
            }
        
        # Check if email exists
        if request.email:
            existing_email = db.query(User).filter(User.Email == request.email).first()
            if existing_email:
                return {
                    "status": 400,
                    "message": "Email đã được đăng ký"
                }
        
        # Check if device_id exists
        if request.device_id:
            existing_device = db.query(User).filter(User.DeviceID == request.device_id).first()
            if existing_device:
                return {
                    "status": 400,
                    "message": "Thiết bị đã được đăng ký"
                }
        # Create new user  
        hashed_password = get_password_hash(request.password)
        new_user = User(
            Username=request.username,
            PasswordHash=hashed_password,
            Email=request.email,
            FullName=request.full_name,
            DeviceID=request.device_id,
            Status="active",
            IsEmailConfirmed=False
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
            DeviceInfo=request.device_id,
            IpAddress=req.client.host if req.client else None,
            UserAgent=req.headers.get("user-agent"),
            ExpiresAt=datetime.utcnow() + timedelta(days=30),
            Status=SessionStatus.ACTIVE.value
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
                "avatar_url": new_user.AvatarURL
            }
        }
    except Exception as e:
        db.rollback()
        return {
            "status": 500,
            "message": f"Lỗi tạo tài khoản: {str(e)}"
        }


@router.post("/login", response_model=dict)
async def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Login with username/email and password"""
    try:
        # Find user by username or email
        user = db.query(User).filter(
            (User.Username == request.username) | (User.Email == request.username)
        ).first()
        
        if not user:
            return {
                "status": 401,
                "message": "Sai tài khoản hoặc mật khẩu"
            }
        
        # Verify password
        if not user.PasswordHash or not verify_password(request.password, user.PasswordHash):
            # Increment failed login attempts
            user.FailedLoginAttempts = (user.FailedLoginAttempts or 0) + 1
            db.commit()
            
            return {
                "status": 401,
                "message": "Sai tài khoản hoặc mật khẩu"
            }
        
        # Check if user is active
        if user.Status != "active":
            return {
                "status": 403,
                "message": "Tài khoản của bạn đã bị khóa"
            }
        
        # Reset failed login attempts and update last active
        user.FailedLoginAttempts = 0
        user.LastActive = datetime.utcnow()
        db.commit()
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user.UserID})
        refresh_token = create_refresh_token(data={"sub": user.UserID})
        
        # Save session
        session = UserSession(
            UserID=user.UserID,
            AccessToken=access_token,
            RefreshToken=refresh_token,
            DeviceInfo=request.device_id,
            IpAddress=req.client.host if req.client else None,
            UserAgent=req.headers.get("user-agent"),
            ExpiresAt=datetime.utcnow() + timedelta(days=30),
            Status=SessionStatus.ACTIVE.value
        )
        db.add(session)
        db.commit()
        
        return {
            "status": 200,
            "message": "Đăng nhập thành công",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "user_id": user.UserID,
                "username": user.Username,
                "email": user.Email,
                "full_name": user.FullName,
                "avatar_url": user.AvatarURL
            }
        }
    except Exception as e:
        return {
            "status": 500,
            "message": f"Lỗi đăng nhập: {str(e)}"
        }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Logout current user (revoke session)"""
    token = credentials.credentials
    
    # Revoke the session
    session = db.query(UserSession).filter(
        UserSession.UserID == current_user.UserID,
        UserSession.AccessToken == token,
        UserSession.Status == SessionStatus.ACTIVE.value
    ).first()
    
    if session:
        session.Status = SessionStatus.REVOKED.value
        db.commit()
    
    return {
        "message": "Successfully logged out",
        "user_id": current_user.UserID
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, req: Request, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        payload = decode_token(request.refresh_token)
        token_type = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user
        user = db.query(User).filter(User.UserID == user_id).first()
        if not user or user.Status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Revoke old session
        old_session = db.query(UserSession).filter(
            UserSession.RefreshToken == request.refresh_token,
            UserSession.Status == SessionStatus.ACTIVE.value
        ).first()
        if old_session:
            old_session.Status = SessionStatus.EXPIRED.value
        
        # Generate new tokens
        access_token = create_access_token(data={"sub": user.UserID})
        refresh_token = create_refresh_token(data={"sub": user.UserID})
        
        # Save new session
        new_session = UserSession(
            UserID=user.UserID,
            AccessToken=access_token,
            RefreshToken=refresh_token,
            IpAddress=req.client.host if req.client else None,
            UserAgent=req.headers.get("user-agent"),
            ExpiresAt=datetime.utcnow() + timedelta(days=30),
            Status=SessionStatus.ACTIVE.value
        )
        db.add(new_session)
        db.commit()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user={
                "user_id": user.UserID,
                "username": user.Username,
                "email": user.Email,
                "full_name": user.FullName,
                "avatar_url": user.AvatarURL
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token"
        )


@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "user_id": current_user.UserID,
        "username": current_user.Username,
        "email": current_user.Email,
        "full_name": current_user.FullName,
        "avatar_url": current_user.AvatarURL,
        "device_id": current_user.DeviceID,
        "status": current_user.Status,
        "created_at": current_user.CreatedAt,
        "last_active": current_user.LastActive
    }


@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Verify old password
    if not current_user.PasswordHash or not verify_password(request.old_password, current_user.PasswordHash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.PasswordHash = get_password_hash(request.new_password)
    db.commit()
    
    return {
        "message": "Password changed successfully",
        "user_id": current_user.UserID
    }


@router.get("/sessions", response_model=dict)
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all active sessions for current user"""
    sessions = db.query(UserSession).filter(
        UserSession.UserID == current_user.UserID,
        UserSession.Status == SessionStatus.ACTIVE.value
    ).order_by(UserSession.CreatedAt.desc()).all()
    
    return {
        "user_id": current_user.UserID,
        "total": len(sessions),
        "sessions": [
            {
                "session_id": s.SessionID,
                "device_info": s.DeviceInfo,
                "ip_address": s.IpAddress,
                "user_agent": s.UserAgent,
                "created_at": s.CreatedAt,
                "last_accessed_at": s.LastAccessedAt,
                "expires_at": s.ExpiresAt
            }
            for s in sessions
        ]
    }


@router.post("/logout-all")
async def logout_all_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout from all devices (revoke all sessions)"""
    revoked_count = db.query(UserSession).filter(
        UserSession.UserID == current_user.UserID,
        UserSession.Status == SessionStatus.ACTIVE.value
    ).update({"Status": SessionStatus.REVOKED.value})
    
    db.commit()
    
    return {
        "message": "Logged out from all devices",
        "user_id": current_user.UserID,
        "sessions_revoked": revoked_count
    }


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a specific session"""
    session = db.query(UserSession).filter(
        UserSession.SessionID == session_id,
        UserSession.UserID == current_user.UserID,
        UserSession.Status == SessionStatus.ACTIVE.value
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or already revoked"
        )
    
    session.Status = SessionStatus.REVOKED.value
    db.commit()
    
    return {
        "message": "Session revoked successfully",
        "session_id": session_id
    }
