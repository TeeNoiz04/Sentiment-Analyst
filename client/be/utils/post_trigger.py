"""
Trigger logic for posts - automatically hide posts with 10+ reports
"""
from sqlalchemy.orm import Session
from models.database import Post, PostStatus, Report


def check_and_hide_post(db: Session, post_id: int):
    """
    Check if post has 10 or more reports and automatically hide it
    This is called after creating a new report
    """
    try:
        post = db.query(Post).filter(Post.PostID == post_id).first()
        if not post:
            return
        
        # Count total reports for this post
        report_count = db.query(Report).filter(Report.PostID == post_id).count()
        
        # If post has 10 or more reports and is still approved, hide it
        if report_count >= 10 and post.Status == PostStatus.APPROVED.value:
            post.Status = PostStatus.HIDDEN.value
            db.commit()
            print(f"Post {post_id} has been automatically hidden due to {report_count} reports")
    except Exception as e:
        print(f"Error in check_and_hide_post: {str(e)}")
        db.rollback()

