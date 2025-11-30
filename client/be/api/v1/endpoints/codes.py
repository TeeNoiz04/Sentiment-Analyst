"""
Code CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Code
from models.schemas import (
    CodeCreate, CodeUpdate, CodeResponse, CodeListResponse
)

router = APIRouter()


@router.post("", response_model=CodeResponse, status_code=201)
async def create_code(code: CodeCreate, db: Session = Depends(get_db)):
    """Create a new code"""
    try:
        db_code = Code(
            Code=code.Code,
            CodeTypeId=code.CodeTypeId,
            Value=code.Value,
            Description=code.Description,
            Status=code.Status,
            CanDelete=code.CanDelete,
            CanEdit=code.CanEdit,
            DisplayAs=code.DisplayAs,
            PId=code.PId,
            ValueType=code.ValueType,
            Sequence=code.Sequence
        )
        db.add(db_code)
        db.commit()
        db.refresh(db_code)
        return db_code
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating code: {str(e)}")


@router.get("", response_model=CodeListResponse)
async def get_codes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    code_type_id: Optional[int] = Query(None, description="Filter by code type ID"),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of codes"""
    query = db.query(Code)
    if code_type_id:
        query = query.filter(Code.CodeTypeId == code_type_id)
    if status:
        query = query.filter(Code.Status == status)
    
    total = query.count()
    codes = query.order_by(Code.Sequence.asc(), Code.Id.asc()).offset(skip).limit(limit).all()
    return CodeListResponse(total=total, codes=codes)


@router.get("/{code_id}", response_model=CodeResponse)
async def get_code(code_id: int, db: Session = Depends(get_db)):
    """Get code by ID"""
    code = db.query(Code).filter(Code.Id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    return code


@router.put("/{code_id}", response_model=CodeResponse)
async def update_code(
    code_id: int,
    code_update: CodeUpdate,
    db: Session = Depends(get_db)
):
    """Update a code"""
    code = db.query(Code).filter(Code.Id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    
    try:
        if code_update.Code is not None:
            code.Code = code_update.Code
        if code_update.Value is not None:
            code.Value = code_update.Value
        if code_update.Description is not None:
            code.Description = code_update.Description
        if code_update.Status is not None:
            code.Status = code_update.Status
        if code_update.DisplayAs is not None:
            code.DisplayAs = code_update.DisplayAs
        if code_update.Sequence is not None:
            code.Sequence = code_update.Sequence
        db.commit()
        db.refresh(code)
        return code
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating code: {str(e)}")


@router.delete("/{code_id}", status_code=204)
async def delete_code(code_id: int, db: Session = Depends(get_db)):
    """Delete a code"""
    code = db.query(Code).filter(Code.Id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    
    if code.CanDelete is False:
        raise HTTPException(status_code=400, detail="This code cannot be deleted")
    
    try:
        db.delete(code)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting code: {str(e)}")

