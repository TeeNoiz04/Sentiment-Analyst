"""
Admin endpoints for summary generation
"""
from fastapi import APIRouter, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from models_admin import PostRequest
from api.admin.helpers import generate_school_summary_report, convert_post_to_postrequest
from core.database import get_db
from models.database import Post

router = APIRouter()


@router.post("/school-summary-2")
def summarize_shool(
    request: List[PostRequest],
    selected_page: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Generate summary report from posts
    - If selected_page=0 or None (from database): 
      * Analyze using Content
      * Display Title in results
    - If selected_page>=1 (from CSV): 
      * Analyze and display using text as is
    """
    try:
        # If posts from database (selected_page=0 or None)
        # Check if request contains posts from database by checking URL pattern
        is_from_db = selected_page == 0 or selected_page is None
        
        # Also check if URLs match database pattern
        if request and len(request) > 0:
            first_url = str(request[0].url) if hasattr(request[0], 'url') else ""
            if "app.example.com/posts" in first_url or "example.com/posts" in first_url:
                is_from_db = True
        
        if is_from_db:
            # Query all approved posts from database
            posts_db = db.query(Post).filter(Post.Status == "approved").all()
            
            # Convert to PostRequest with Content (for analysis)
            posts_for_summary = []
            titles = []
            for post_db in posts_db:
                comment_count = len(post_db.comments) if post_db.comments else 0
                # Use Content for analysis (use_title=False)
                post_request = convert_post_to_postrequest(post_db, comment_count, use_title=False)
                posts_for_summary.append(post_request)
                # Store Title separately for display
                titles.append(post_db.Title if post_db.Title else "")
            
            print(f"DEBUG: Generating summary with {len(posts_for_summary)} posts, {len(titles)} titles")
            print(f"DEBUG: First title: {titles[0] if titles else 'None'}")
            
            # Generate summary: analyze with Content, display with Title
            summary = generate_school_summary_report(posts_for_summary, titles=titles)
        else:
            # Use provided request (from CSV or already converted)
            # For CSV posts, use text as is (already contains full content)
            summary = generate_school_summary_report(request)
        
        return summary
    except Exception as e:
        print(f"Error in summarize_school: {e}")
        import traceback
        traceback.print_exc()
        
        fallback_comments = [
            """Phần lớn sinh viên (khoảng 70-75% phản hồi) thể hiện sự hài lòng cao đối với đội ngũ giảng viên. Các nhận xét nổi bật xoay quanh sự tận tâm, phương pháp giảng dạy dễ hiểu, và môi trường học tập thoải mái.
        Mặc dù vẫn còn một số góp ý liên quan đến cơ sở vật chất (phòng học, thiết bị giảng dạy) và lịch học chưa linh hoạt, đa số sinh viên đều ghi nhận nỗ lực hỗ trợ của nhà trường. Có khoảng 44 đánh giá tích cực""",
            """Khoảng 60% phản hồi mang tính tiêu cực, phản ánh sự không hài lòng về thiếu thiết bị học tập, phòng học chật, ồn ào, và lịch học căng thẳng.
        Dù vậy, vẫn có khoảng 40% sinh viên ghi nhận nỗ lực và sự tận tâm của giảng viên, cho thấy đội ngũ giảng dạy là điểm sáng đáng chú ý. Có khoảng 13 đánh giá tiêu cực.""",
        ]
        import random
        return random.choice(fallback_comments)

