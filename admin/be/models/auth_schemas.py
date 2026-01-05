"""
Authentication schemas for login/register
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Schema for login request"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., min_length=6, description="Password")
    device_id: Optional[str] = Field(None, description="Device ID for anonymous users")


class RegisterRequest(BaseModel):
    """Schema for register request"""
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    password: str = Field(..., min_length=6, description="Password")
    email: Optional[EmailStr] = Field(None, description="Email address")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")
    device_id: Optional[str] = Field(None, description="Device ID")

class RegisterRequest1(BaseModel):
    """Schema for register request aligned with client payload"""
    Username: str = Field(..., min_length=3, max_length=100, description="Username")
    PasswordHash: str = Field(..., min_length=6, description="Plain password to hash")
    ConfirmPassword: str = Field(..., min_length=6, description="Password confirmation")
    FullName: Optional[str] = Field("", max_length=100, description="Full name")
    Email: Optional[str] = Field("", description="Email address (can be empty)")
    Status: Optional[str] = Field("active", description="User status")
    DeviceID: Optional[str] = Field(None, description="Device ID")

class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str = Field(..., description="Refresh token")


class PasswordChangeRequest(BaseModel):
    """Schema for password change"""
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")
