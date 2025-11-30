"""
CodeType CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import CodeType
from models.schemas import (
    CodeTypeCreate, CodeTypeUpdate, CodeTypeResponse, CodeTypeListResponse
)

router = APIRouter()


@router.post("", response_model=CodeTypeResponse, status_code=201)
async def create_code_type(code_type: CodeTypeCreate, db: Session = Depends(get_db)):
    """Create a new code type"""
    try:
        db_code_type = CodeType(
            CodeTypeName=code_type.CodeTypeName,
            Description=code_type.Description,
            IsActive=code_type.IsActive
        )
        db.add(db_code_type)
        db.commit()
        db.refresh(db_code_type)
        return db_code_type
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating code type: {str(e)}")


@router.get("", response_model=CodeTypeListResponse)
async def get_code_types(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get list of code types"""
    query = db.query(CodeType)
    if is_active is not None:
        query = query.filter(CodeType.IsActive == is_active)
    
    total = query.count()
    code_types = query.offset(skip).limit(limit).all()
    return CodeTypeListResponse(total=total, code_types=code_types)


@router.get("/{code_type_id}", response_model=CodeTypeResponse)
async def get_code_type(code_type_id: int, db: Session = Depends(get_db)):
    """Get code type by ID"""
    code_type = db.query(CodeType).filter(CodeType.Id == code_type_id).first()
    if not code_type:
        raise HTTPException(status_code=404, detail="Code type not found")
    return code_type


@router.put("/{code_type_id}", response_model=CodeTypeResponse)
async def update_code_type(
    code_type_id: int,
    code_type_update: CodeTypeUpdate,
    db: Session = Depends(get_db)
):
    """Update a code type"""
    code_type = db.query(CodeType).filter(CodeType.Id == code_type_id).first()
    if not code_type:
        raise HTTPException(status_code=404, detail="Code type not found")
    
    try:
        if code_type_update.CodeTypeName is not None:
            code_type.CodeTypeName = code_type_update.CodeTypeName
        if code_type_update.Description is not None:
            code_type.Description = code_type_update.Description
        if code_type_update.IsActive is not None:
            code_type.IsActive = code_type_update.IsActive
        db.commit()
        db.refresh(code_type)
        return code_type
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating code type: {str(e)}")

