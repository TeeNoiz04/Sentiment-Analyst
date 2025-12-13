"""
Database models using SQLAlchemy
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, BigInteger, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from core.database import Base


# ========== Enums ==========
class UserStatus(str, enum.Enum):
    """User status enum"""
    ACTIVE = "active"
    BANNED = "banned"


class PostStatus(str, enum.Enum):
    """Post status enum"""
    APPROVED = "approved"
    HIDDEN = "hidden"
    DELETED = "deleted"


class VoteType(str, enum.Enum):
    """Vote type enum"""
    UP = "up"
    DOWN = "down"


class ReportStatus(str, enum.Enum):
    """Report status enum"""
    OPEN = "open"
    CLOSED = "closed"


class SessionStatus(str, enum.Enum):
    """Session status enum"""
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"


# ========== Users Table ==========
class User(Base):
    """User model - includes anonymous users, students, and admins"""
    __tablename__ = "users"

    UserID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    DeviceID = Column(String(255), unique=True, nullable=True, index=True)
    Username = Column(String(100), unique=True, nullable=True, index=True)
    PasswordHash = Column(String(255), nullable=True)
    FailedLoginAttempts = Column(Integer, nullable=True, default=0)
    IsEmailConfirmed = Column(Boolean, nullable=True, default=False)
    AvatarURL = Column(String(255), nullable=True)
    FullName = Column(String(100), nullable=True)
    Email = Column(String(255), nullable=True)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())
    LastActive = Column(DateTime(timezone=True), nullable=True)
    Status = Column(String(20), default=UserStatus.ACTIVE.value, nullable=False)

    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(UserID={self.UserID}, Username={self.Username}, DeviceID={self.DeviceID})>"


# ========== UserSession Table ==========
class UserSession(Base):
    """User session model for JWT token management"""
    __tablename__ = "user_sessions"

    SessionID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("users.UserID"), nullable=False)
    AccessToken = Column(Text, nullable=False)
    RefreshToken = Column(Text, nullable=False)
    DeviceInfo = Column(String(255), nullable=True)
    IpAddress = Column(String(50), nullable=True)
    UserAgent = Column(String(500), nullable=True)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())
    ExpiresAt = Column(DateTime(timezone=True), nullable=False)
    LastAccessedAt = Column(DateTime(timezone=True), nullable=True)
    Status = Column(String(20), default=SessionStatus.ACTIVE.value, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<UserSession(SessionID={self.SessionID}, UserID={self.UserID}, Status={self.Status})>"


# ========== Roles Table ==========
class Role(Base):
    """Role model"""
    __tablename__ = "roles"

    RoleID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IsSystemRole = Column(Boolean, nullable=True, default=False)
    Status = Column(String(50), nullable=True)
    CreatedOn = Column(String(100), nullable=True)
    CreatedBy = Column(String(100), nullable=True)
    RoleName = Column(String(100), unique=True, nullable=False)
    Description = Column(Text, nullable=True)

    # Relationships
    user_roles = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")
    role_permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Role(RoleID={self.RoleID}, RoleName={self.RoleName})>"


# ========== UserRoles Table ==========
class UserRole(Base):
    """User-Role relationship"""
    __tablename__ = "user_roles"

    UserID = Column(Integer, ForeignKey("users.UserID"), primary_key=True)
    RoleID = Column(Integer, ForeignKey("roles.RoleID"), primary_key=True)
    ExpiresAt = Column(DateTime(timezone=True), nullable=True)
    Status = Column(String(50), nullable=True)
    CreatedOn = Column(DateTime(timezone=True), server_default=func.now())
    CreatedBy = Column(String(100), nullable=True)
    ModifiedOn = Column(DateTime(timezone=True), nullable=True)
    ModifiedBy = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")

    def __repr__(self):
        return f"<UserRole(UserID={self.UserID}, RoleID={self.RoleID})>"


# ========== Permissions Table ==========
class Permission(Base):
    """Permission model"""
    __tablename__ = "permissions"

    PermissionID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Name = Column(String(255), nullable=True)
    Category = Column(String(255), nullable=True)
    HasMenu = Column(Boolean, nullable=True, default=False)
    PId = Column(Integer, nullable=True)
    Level = Column(Integer, nullable=True)
    Status = Column(String(100), nullable=True)
    Code = Column(String(100), unique=True, nullable=False, index=True)
    Description = Column(Text, nullable=True)

    # Relationships
    role_permissions = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Permission(PermissionID={self.PermissionID}, Code={self.Code})>"


# ========== RolePermissions Table ==========
class RolePermission(Base):
    """Role-Permission relationship"""
    __tablename__ = "role_permissions"

    RoleID = Column(Integer, ForeignKey("roles.RoleID"), primary_key=True)
    PermissionID = Column(Integer, ForeignKey("permissions.PermissionID"), primary_key=True)
    TableName = Column(String(255), nullable=True)
    Create = Column(Boolean, nullable=True, default=False)
    Read = Column(Boolean, nullable=True, default=False)
    Update = Column(Boolean, nullable=True, default=False)
    Delete = Column(Boolean, nullable=True, default=False)
    Status = Column(String(150), nullable=True)
    CreatedOn = Column(TIMESTAMP, server_default=func.now())
    CreatedBy = Column(String(100), nullable=True)
    ModifiedOn = Column(TIMESTAMP, nullable=True)
    ModifiedBy = Column(String(100), nullable=True)

    # Relationships
    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")

    def __repr__(self):
        return f"<RolePermission(RoleID={self.RoleID}, PermissionID={self.PermissionID})>"


# ========== Posts Table ==========
class Post(Base):
    """Post model"""
    __tablename__ = "posts"

    PostID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("users.UserID"), nullable=False)
    Title = Column(String(255), nullable=False)
    Content = Column(Text, nullable=False)
    Category = Column(String(100), nullable=True)
    CreatedOn = Column(DateTime(timezone=True), server_default=func.now())
    Status = Column(String(20), default=PostStatus.APPROVED.value, nullable=False)
    UpVotes = Column(Integer, default=0, nullable=False)
    DownVotes = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="posts")
    votes = relationship("Vote", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Post(PostID={self.PostID}, Title={self.Title[:30]}...)>"


# ========== Votes Table ==========
class Vote(Base):
    """Vote model"""
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint('PostID', 'UserID', name='uq_vote_post_user'),
    )

    VoteID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PostID = Column(Integer, ForeignKey("posts.PostID"), nullable=False)
    UserID = Column(Integer, ForeignKey("users.UserID"), nullable=False)
    VoteType = Column(String(10), nullable=False)  # 'up' or 'down'
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="votes")
    user = relationship("User", back_populates="votes")

    def __repr__(self):
        return f"<Vote(VoteID={self.VoteID}, PostID={self.PostID}, VoteType={self.VoteType})>"


# ========== Reports Table ==========
class Report(Base):
    """Report model"""
    __tablename__ = "reports"

    ReportID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PostID = Column(Integer, ForeignKey("posts.PostID"), nullable=False)
    UserID = Column(Integer, ForeignKey("users.UserID"), nullable=False)
    Reason = Column(String(255), nullable=False)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())
    Status = Column(String(20), default=ReportStatus.OPEN.value, nullable=False)

    # Relationships
    post = relationship("Post", back_populates="reports")
    user = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<Report(ReportID={self.ReportID}, PostID={self.PostID}, Status={self.Status})>"


# ========== Comments Table ==========
class Comment(Base):
    """Comment model"""
    __tablename__ = "comments"

    CommentID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PostID = Column(Integer, ForeignKey("posts.PostID"), nullable=False)
    UserID = Column(Integer, ForeignKey("users.UserID"), nullable=False)
    Content = Column(Text, nullable=False)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")

    def __repr__(self):
        return f"<Comment(CommentID={self.CommentID}, PostID={self.PostID})>"


# ========== CodeType Table ==========
class CodeType(Base):
    """CodeType model - Parent category for codes"""
    __tablename__ = "code_types"

    Id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    CodeTypeName = Column(String(100), nullable=False, unique=True)
    Description = Column(String(255), nullable=True)
    CreatedOn = Column(TIMESTAMP, server_default=func.now())
    CreatedBy = Column(String(100), nullable=True)
    IsActive = Column(Boolean, default=True, nullable=False)

    # Relationships
    codes = relationship("Code", back_populates="code_type", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CodeType(Id={self.Id}, CodeTypeName={self.CodeTypeName})>"


# ========== Code Table ==========
class Code(Base):
    """Code model - Child codes belonging to CodeType"""
    __tablename__ = "codes"

    Id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    Code = Column(String(100), nullable=False)
    CodeTypeId = Column(BigInteger, ForeignKey("code_types.Id"), nullable=False)
    Value = Column(String(255), nullable=True)
    Description = Column(String(255), nullable=True)
    Status = Column(String(5), nullable=True)
    CreatedOn = Column(TIMESTAMP, server_default=func.now())
    CreatedBy = Column(String(100), nullable=True)
    CanDelete = Column(Boolean, default=True, nullable=True)
    CanEdit = Column(Boolean, default=True, nullable=True)
    DisplayAs = Column(String(255), nullable=True)
    PId = Column(BigInteger, nullable=True)
    ValueType = Column(String(255), nullable=True)
    Sequence = Column(Integer, nullable=True)

    # Relationships
    code_type = relationship("CodeType", back_populates="codes")

    def __repr__(self):
        return f"<Code(Id={self.Id}, Code={self.Code}, CodeTypeId={self.CodeTypeId})>"
