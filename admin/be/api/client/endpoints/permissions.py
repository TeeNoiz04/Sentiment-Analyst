"""
Permission CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Permission, RolePermission
from models.schemas import PermissionCreate, PermissionResponse, PermissionListResponse, RolePermissionCreate, RolePermissionResponse

router = APIRouter()


@router.post("", response_model=PermissionResponse, status_code=201)
async def create_permission(permission: PermissionCreate, db: Session = Depends(get_db)):
    """Create a new permission"""
    try:
        db_permission = Permission(
            Code=permission.Code, Name=permission.Name, Description=permission.Description,
            Category=permission.Category, HasMenu=permission.HasMenu, PId=permission.PId,
            Level=permission.Level, Status=permission.Status
        )
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating permission: {str(e)}")


@router.get("", response_model=PermissionListResponse)
async def get_permissions(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), category: Optional[str] = None, db: Session = Depends(get_db)):
    """Get list of permissions"""
    query = db.query(Permission)
    if category:
        query = query.filter(Permission.Category == category)
    
    total = query.count()
    permissions = query.offset(skip).limit(limit).all()
    return PermissionListResponse(total=total, permissions=permissions)


@router.get("/{permission_id}", response_model=PermissionResponse)
async def get_permission(permission_id: int, db: Session = Depends(get_db)):
    """Get permission by ID"""
    permission = db.query(Permission).filter(Permission.PermissionID == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.post("/assign", response_model=RolePermissionResponse, status_code=201)
async def assign_permission_to_role(role_permission: RolePermissionCreate, db: Session = Depends(get_db)):
    """Assign a permission to a role"""
    try:
        db_role_permission = RolePermission(
            RoleID=role_permission.RoleID, PermissionID=role_permission.PermissionID,
            TableName=role_permission.TableName, Create=role_permission.Create,
            Read=role_permission.Read, Update=role_permission.Update,
            Delete=role_permission.Delete, Status=role_permission.Status
        )
        db.add(db_role_permission)
        db.commit()
        db.refresh(db_role_permission)
        return db_role_permission
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error assigning permission: {str(e)}")
