"""
Pydantic schemas for request/response models
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# ========== User Schemas ==========
class UserBase(BaseModel):
    """Base schema for user"""
    DeviceID: Optional[str] = Field(None, max_length=255, description="Device ID for anonymous users")
    Username: Optional[str] = Field(None, max_length=100, description="Username for admin/students")
    FullName: Optional[str] = Field(None, max_length=100, description="Full name")
    Email: Optional[EmailStr] = Field(None, description="Email address")
    AvatarURL: Optional[str] = Field(None, max_length=255, description="Avatar URL")


class UserCreate(UserBase):
    """Schema for creating a user"""
    PasswordHash: Optional[str] = Field(None, max_length=255, description="Password hash (for admin)")


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    Username: Optional[str] = None
    FullName: Optional[str] = None
    Email: Optional[EmailStr] = None
    AvatarURL: Optional[str] = None
    PasswordHash: Optional[str] = None
    Status: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response"""
    UserID: int
    FailedLoginAttempts: Optional[int] = None
    IsEmailConfirmed: Optional[bool] = None
    CreatedAt: datetime
    LastActive: Optional[datetime] = None
    Status: str
    
    class Config:
        from_attributes = True


# ========== Role Schemas ==========
class RoleBase(BaseModel):
    """Base schema for role"""
    RoleName: str = Field(..., max_length=100, description="Role name")
    Description: Optional[str] = Field(None, description="Role description")


class RoleCreate(RoleBase):
    """Schema for creating a role"""
    IsSystemRole: Optional[bool] = Field(False, description="Is system role")
    Status: Optional[str] = Field(None, description="Status")


class RoleUpdate(BaseModel):
    """Schema for updating a role"""
    RoleName: Optional[str] = None
    Description: Optional[str] = None
    Status: Optional[str] = None


class RoleResponse(RoleBase):
    """Schema for role response"""
    RoleID: int
    IsSystemRole: Optional[bool] = None
    Status: Optional[str] = None
    CreatedOn: Optional[str] = None
    CreatedBy: Optional[str] = None
    
    class Config:
        from_attributes = True


# ========== UserRole Schemas ==========
class UserRoleCreate(BaseModel):
    """Schema for creating user-role relationship"""
    UserID: int = Field(..., description="User ID")
    RoleID: int = Field(..., description="Role ID")
    ExpiresAt: Optional[datetime] = Field(None, description="Expiration date")
    Status: Optional[str] = Field(None, description="Status")


class UserRoleResponse(BaseModel):
    """Schema for user-role response"""
    UserID: int
    RoleID: int
    ExpiresAt: Optional[datetime] = None
    Status: Optional[str] = None
    CreatedOn: Optional[datetime] = None
    CreatedBy: Optional[str] = None
    
    class Config:
        from_attributes = True


# ========== Permission Schemas ==========
class PermissionBase(BaseModel):
    """Base schema for permission"""
    Code: str = Field(..., max_length=100, description="Permission code")
    Name: Optional[str] = Field(None, max_length=255, description="Permission name")
    Description: Optional[str] = Field(None, description="Permission description")


class PermissionCreate(PermissionBase):
    """Schema for creating a permission"""
    Category: Optional[str] = Field(None, max_length=255)
    HasMenu: Optional[bool] = Field(False)
    PId: Optional[int] = None
    Level: Optional[int] = None
    Status: Optional[str] = None


class PermissionResponse(PermissionBase):
    """Schema for permission response"""
    PermissionID: int
    Category: Optional[str] = None
    HasMenu: Optional[bool] = None
    PId: Optional[int] = None
    Level: Optional[int] = None
    Status: Optional[str] = None
    
    class Config:
        from_attributes = True


# ========== RolePermission Schemas ==========
class RolePermissionCreate(BaseModel):
    """Schema for creating role-permission relationship"""
    RoleID: int = Field(..., description="Role ID")
    PermissionID: int = Field(..., description="Permission ID")
    TableName: Optional[str] = Field(None, max_length=255)
    Create: Optional[bool] = Field(False)
    Read: Optional[bool] = Field(False)
    Update: Optional[bool] = Field(False)
    Delete: Optional[bool] = Field(False)
    Status: Optional[str] = None


class RolePermissionResponse(BaseModel):
    """Schema for role-permission response"""
    RoleID: int
    PermissionID: int
    TableName: Optional[str] = None
    Create: Optional[bool] = None
    Read: Optional[bool] = None
    Update: Optional[bool] = None
    Delete: Optional[bool] = None
    Status: Optional[str] = None
    
    class Config:
        from_attributes = True


# ========== Post Schemas ==========
class PostBase(BaseModel):
    """Base schema for post"""
    Title: str = Field(..., min_length=1, max_length=255, description="Post title")
    Content: str = Field(..., min_length=1, description="Post content")
    Category: Optional[str] = Field(None, max_length=100, description="Post category")


class PostCreate(PostBase):
    """Schema for creating a post"""
    UserID: int = Field(..., description="User ID who creates the post")


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    Title: Optional[str] = Field(None, min_length=1, max_length=255)
    Content: Optional[str] = Field(None, min_length=1)
    Category: Optional[str] = None
    Status: Optional[str] = Field(None, description="Post status: approved, hidden")


class PostResponse(PostBase):
    """Schema for post response"""
    PostID: int
    UserID: int
    Status: str
    UpVotes: int
    DownVotes: int
    CreatedOn: datetime
    
    class Config:
        from_attributes = True


# ========== Vote Schemas ==========
class VoteBase(BaseModel):
    """Base schema for vote"""
    PostID: int = Field(..., description="Post ID")
    VoteType: str = Field(..., description="Vote type: up or down")


class VoteCreate(VoteBase):
    """Schema for creating a vote"""
    UserID: int = Field(..., description="User ID who votes")


class VoteResponse(VoteBase):
    """Schema for vote response"""
    VoteID: int
    UserID: int
    CreatedAt: datetime
    
    class Config:
        from_attributes = True


# ========== Report Schemas ==========
class ReportBase(BaseModel):
    """Base schema for report"""
    PostID: int = Field(..., description="Post ID to report")
    Reason: str = Field(..., max_length=255, description="Reason for reporting")


class ReportCreate(ReportBase):
    """Schema for creating a report"""
    UserID: int = Field(..., description="User ID who creates the report")


class ReportUpdate(BaseModel):
    """Schema for updating a report"""
    Reason: Optional[str] = None
    Status: Optional[str] = Field(None, description="Report status: open, closed")


class ReportResponse(ReportBase):
    """Schema for report response"""
    ReportID: int
    UserID: int
    Status: str
    CreatedAt: datetime
    
    class Config:
        from_attributes = True


# ========== Comment Schemas ==========
class CommentBase(BaseModel):
    """Base schema for comment"""
    PostID: int = Field(..., description="Post ID")
    Content: str = Field(..., min_length=1, description="Comment content")


class CommentCreate(CommentBase):
    """Schema for creating a comment"""
    UserID: int = Field(..., description="User ID who creates the comment")


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    Content: Optional[str] = Field(None, min_length=1)


class CommentResponse(CommentBase):
    """Schema for comment response"""
    CommentID: int
    UserID: int
    CreatedAt: datetime
    
    class Config:
        from_attributes = True


# ========== CodeType Schemas ==========
class CodeTypeBase(BaseModel):
    """Base schema for code type"""
    CodeTypeName: str = Field(..., max_length=100, description="Code type name")
    Description: Optional[str] = Field(None, max_length=255, description="Description")


class CodeTypeCreate(CodeTypeBase):
    """Schema for creating a code type"""
    IsActive: Optional[bool] = Field(True, description="Is active")


class CodeTypeUpdate(BaseModel):
    """Schema for updating a code type"""
    CodeTypeName: Optional[str] = None
    Description: Optional[str] = None
    IsActive: Optional[bool] = None


class CodeTypeResponse(CodeTypeBase):
    """Schema for code type response"""
    Id: int
    IsActive: bool
    CreatedOn: datetime
    CreatedBy: Optional[str] = None
    
    class Config:
        from_attributes = True


# ========== Code Schemas ==========
class CodeBase(BaseModel):
    """Base schema for code"""
    Code: str = Field(..., max_length=100, description="Code value")
    CodeTypeId: int = Field(..., description="Code type ID")
    Value: Optional[str] = Field(None, max_length=255, description="Display value")
    Description: Optional[str] = Field(None, max_length=255, description="Description")


class CodeCreate(CodeBase):
    """Schema for creating a code"""
    Status: Optional[str] = Field(None, max_length=5)
    CanDelete: Optional[bool] = Field(True)
    CanEdit: Optional[bool] = Field(True)
    DisplayAs: Optional[str] = None
    PId: Optional[int] = None
    ValueType: Optional[str] = None
    Sequence: Optional[int] = None


class CodeUpdate(BaseModel):
    """Schema for updating a code"""
    Code: Optional[str] = None
    Value: Optional[str] = None
    Description: Optional[str] = None
    Status: Optional[str] = None
    DisplayAs: Optional[str] = None
    Sequence: Optional[int] = None


class CodeResponse(CodeBase):
    """Schema for code response"""
    Id: int
    Status: Optional[str] = None
    CanDelete: Optional[bool] = None
    CanEdit: Optional[bool] = None
    DisplayAs: Optional[str] = None
    PId: Optional[int] = None
    ValueType: Optional[str] = None
    Sequence: Optional[int] = None
    CreatedOn: datetime
    CreatedBy: Optional[str] = None
    
    class Config:
        from_attributes = True


# ========== List Response Schemas ==========
class PostListResponse(BaseModel):
    """Schema for post list response"""
    total: int
    posts: List[PostResponse]


class VoteListResponse(BaseModel):
    """Schema for vote list response"""
    total: int
    votes: List[VoteResponse]


class ReportListResponse(BaseModel):
    """Schema for report list response"""
    total: int
    reports: List[ReportResponse]


class CommentListResponse(BaseModel):
    """Schema for comment list response"""
    total: int
    comments: List[CommentResponse]


class UserListResponse(BaseModel):
    """Schema for user list response"""
    total: int
    users: List[UserResponse]


class RoleListResponse(BaseModel):
    """Schema for role list response"""
    total: int
    roles: List[RoleResponse]


class PermissionListResponse(BaseModel):
    """Schema for permission list response"""
    total: int
    permissions: List[PermissionResponse]


class CodeTypeListResponse(BaseModel):
    """Schema for code type list response"""
    total: int
    code_types: List[CodeTypeResponse]


class CodeListResponse(BaseModel):
    """Schema for code list response"""
    total: int
    codes: List[CodeResponse]
