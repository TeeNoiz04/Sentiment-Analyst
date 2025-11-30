"""
Report CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from models.database import Report, Post, PostStatus, ReportStatus
from models.schemas import (
    ReportCreate, ReportUpdate, ReportResponse, ReportListResponse
)
from utils.post_trigger import check_and_hide_post

router = APIRouter()


@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    """Create a new report"""
    try:
        # Check if post exists
        post = db.query(Post).filter(Post.PostID == report.PostID).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Check if user already reported this post
        existing_report = db.query(Report).filter(
            Report.PostID == report.PostID,
            Report.UserID == report.UserID
        ).first()
        if existing_report:
            raise HTTPException(status_code=400, detail="User has already reported this post")
        
        # Create report
        db_report = Report(
            PostID=report.PostID,
            UserID=report.UserID,
            Reason=report.Reason,
            Status=ReportStatus.OPEN.value
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        # Check if post should be hidden (trigger: >= 10 reports)
        check_and_hide_post(db, post.PostID)
        
        return db_report
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating report: {str(e)}")


@router.get("", response_model=ReportListResponse)
async def get_reports(
    skip: int = Query(0, ge=0, description="Number of reports to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of reports to return"),
    post_id: Optional[int] = Query(None, description="Filter by post ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status: open, closed"),
    db: Session = Depends(get_db)
):
    """Get list of reports with pagination"""
    query = db.query(Report)
    
    # Apply filters
    if post_id:
        query = query.filter(Report.PostID == post_id)
    if user_id:
        query = query.filter(Report.UserID == user_id)
    if status:
        query = query.filter(Report.Status == status)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    reports = query.order_by(Report.CreatedAt.desc()).offset(skip).limit(limit).all()
    
    return ReportListResponse(total=total, reports=reports)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a specific report by ID"""
    report = db.query(Report).filter(Report.ReportID == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db)
):
    """Update a report"""
    report = db.query(Report).filter(Report.ReportID == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        if report_update.Reason is not None:
            report.Reason = report_update.Reason
        if report_update.Status is not None:
            report.Status = report_update.Status
        
        db.commit()
        db.refresh(report)
        return report
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating report: {str(e)}")


@router.delete("/{report_id}", status_code=204)
async def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a report"""
    report = db.query(Report).filter(Report.ReportID == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        db.delete(report)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting report: {str(e)}")
