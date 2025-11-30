"""
Role CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Role, UserRole
from models.schemas import RoleCreate, RoleUpdate, RoleResponse, RoleListResponse, UserRoleCreate, UserRoleResponse

router = APIRouter()


@router.post("", response_model=RoleResponse, status_code=201)
async def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    """Create a new role"""
    try:
        db_role = Role(RoleName=role.RoleName, Description=role.Description, IsSystemRole=role.IsSystemRole, Status=role.Status)
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating role: {str(e)}")


@router.get("", response_model=RoleListResponse)
async def get_roles(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), status: Optional[str] = None, db: Session = Depends(get_db)):
    """Get list of roles"""
    query = db.query(Role)
    if status:
        query = query.filter(Role.Status == status)
    
    total = query.count()
    roles = query.offset(skip).limit(limit).all()
    return RoleListResponse(total=total, roles=roles)


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(role_id: int, db: Session = Depends(get_db)):
    """Get role by ID"""
    role = db.query(Role).filter(Role.RoleID == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(role_id: int, role_update: RoleUpdate, db: Session = Depends(get_db)):
    """Update a role"""
    role = db.query(Role).filter(Role.RoleID == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    try:
        if role_update.RoleName is not None:
            role.RoleName = role_update.RoleName
        if role_update.Description is not None:
            role.Description = role_update.Description
        if role_update.Status is not None:
            role.Status = role_update.Status
        db.commit()
        db.refresh(role)
        return role
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating role: {str(e)}")


@router.post("/assign", response_model=UserRoleResponse, status_code=201)
async def assign_role_to_user(user_role: UserRoleCreate, db: Session = Depends(get_db)):
    """Assign a role to a user"""
    try:
        db_user_role = UserRole(UserID=user_role.UserID, RoleID=user_role.RoleID, ExpiresAt=user_role.ExpiresAt, Status=user_role.Status)
        db.add(db_user_role)
        db.commit()
        db.refresh(db_user_role)
        return db_user_role
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error assigning role: {str(e)}")
