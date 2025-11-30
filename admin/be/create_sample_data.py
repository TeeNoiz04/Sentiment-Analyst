"""
Script to create sample data for testing
"""
from core.database import SessionLocal, init_db
from models.database import (
    User, Role, Permission, UserRole, RolePermission,
    Post, Vote, Report, Comment, CodeType, Code
)
from datetime import datetime

# Initialize database
init_db()

db = SessionLocal()

try:
    print("Creating sample data...")
    
    # 1. Create Users
    print("Creating users...")
    users = []
    for i in range(1, 6):
        user = User(
            DeviceID=f"device_{i:03d}" if i <= 3 else None,
            Username=f"user{i}" if i > 3 else None,
            FullName=f"User {i}" if i > 3 else None,
            Email=f"user{i}@example.com" if i > 3 else None,
            Status="active"
        )
        db.add(user)
        users.append(user)
    db.commit()
    print(f"✓ Created {len(users)} users")
    
    # 2. Create Roles
    print("Creating roles...")
    roles = []
    role_names = ["admin", "moderator", "student", "anonymous"]
    for role_name in role_names:
        role = Role(
            RoleName=role_name,
            Description=f"{role_name.capitalize()} role",
            IsSystemRole=True,
            Status="active"
        )
        db.add(role)
        roles.append(role)
    db.commit()
    print(f"✓ Created {len(roles)} roles")
    
    # 3. Assign roles to users
    print("Assigning roles to users...")
    # User 4 = admin, User 5 = moderator, Users 1-3 = anonymous
    db.add(UserRole(UserID=users[3].UserID, RoleID=roles[0].RoleID, Status="active"))
    db.add(UserRole(UserID=users[4].UserID, RoleID=roles[1].RoleID, Status="active"))
    for i in range(3):
        db.add(UserRole(UserID=users[i].UserID, RoleID=roles[3].RoleID, Status="active"))
    db.commit()
    print("✓ Assigned roles to users")
    
    # 4. Create Posts
    print("Creating posts...")
    posts = []
    post_titles = [
        "Khảo sát về chất lượng giảng dạy",
        "Ý kiến về cơ sở vật chất",
        "Đề xuất cải thiện chương trình học",
        "Phản hồi về đội ngũ giảng viên",
        "Góp ý về thư viện"
    ]
    post_contents = [
        "Tôi muốn chia sẻ một số ý kiến về chất lượng giảng dạy tại trường...",
        "Cơ sở vật chất cần được cải thiện nhiều hơn...",
        "Chương trình học nên được cập nhật thường xuyên...",
        "Đội ngũ giảng viên rất tận tâm và nhiệt tình...",
        "Thư viện cần thêm nhiều sách và tài liệu tham khảo..."
    ]
    categories = ["education", "facility", "program", "lecturer", "facility"]
    
    for i, (title, content, category) in enumerate(zip(post_titles, post_contents, categories)):
        post = Post(
            UserID=users[i % len(users)].UserID,
            Title=title,
            Content=content,
            Category=category,
            Status="approved",
            UpVotes=0,
            DownVotes=0
        )
        db.add(post)
        posts.append(post)
    db.commit()
    print(f"✓ Created {len(posts)} posts")
    
    # 5. Create Votes
    print("Creating votes...")
    vote_count = 0
    for post in posts:
        # Each post gets some upvotes and downvotes
        for i in range(min(3, len(users))):
            vote_type = "up" if i % 2 == 0 else "down"
            vote = Vote(
                PostID=post.PostID,
                UserID=users[i].UserID,
                VoteType=vote_type
            )
            db.add(vote)
            vote_count += 1
            # Update post vote counts
            if vote_type == "up":
                post.UpVotes += 1
            else:
                post.DownVotes += 1
    db.commit()
    print(f"✓ Created {vote_count} votes")
    
    # 6. Create Comments
    print("Creating comments...")
    comments_data = [
        "Tôi đồng ý với ý kiến này!",
        "Cần xem xét kỹ hơn",
        "Rất hữu ích, cảm ơn bạn",
        "Tôi có ý kiến khác...",
        "Hoàn toàn đồng ý"
    ]
    for i, comment_text in enumerate(comments_data):
        comment = Comment(
            PostID=posts[i % len(posts)].PostID,
            UserID=users[i % len(users)].UserID,
            Content=comment_text
        )
        db.add(comment)
    db.commit()
    print(f"✓ Created {len(comments_data)} comments")
    
    # 7. Create Reports (some posts with reports)
    print("Creating reports...")
    report_reasons = [
        "Nội dung không phù hợp",
        "Thông tin sai lệch",
        "Spam",
        "Lý do khác"
    ]
    # Add some reports to first 2 posts
    for i in range(2):
        for j in range(min(2, len(users))):
            report = Report(
                PostID=posts[i].PostID,
                UserID=users[j].UserID,
                Reason=report_reasons[j % len(report_reasons)],
                Status="open"
            )
            db.add(report)
    db.commit()
    print("✓ Created reports")
    
    # 8. Create CodeType and Codes
    print("Creating code types and codes...")
    code_type = CodeType(
        CodeTypeName="ReportReason",
        Description="Lý do báo cáo bài viết",
        IsActive=True
    )
    db.add(code_type)
    db.commit()
    db.refresh(code_type)
    
    reason_codes = [
        ("SPAM", "Nội dung spam", "Bài viết chứa nội dung spam hoặc quảng cáo"),
        ("INAPPROPRIATE", "Nội dung không phù hợp", "Chứa ngôn từ thô tục, phản cảm"),
        ("FALSE_INFO", "Thông tin sai lệch", "Cung cấp thông tin không chính xác"),
        ("DUPLICATE", "Bài viết trùng lặp", "Nội dung trùng với bài khác"),
        ("OTHER", "Lý do khác", "Lý do không thuộc các mục trên")
    ]
    
    for seq, (code, value, desc) in enumerate(reason_codes, 1):
        code_obj = Code(
            Code=code,
            CodeTypeId=code_type.Id,
            Value=value,
            Description=desc,
            Status="A",
            CanDelete=False if code != "OTHER" else True,
            CanEdit=True,
            Sequence=seq
        )
        db.add(code_obj)
    db.commit()
    print("✓ Created code types and codes")
    
    print("\n✅ Sample data created successfully!")
    print(f"   - Users: {len(users)}")
    print(f"   - Roles: {len(roles)}")
    print(f"   - Posts: {len(posts)}")
    print(f"   - Votes: {vote_count}")
    print(f"   - Comments: {len(comments_data)}")
    print(f"   - Reports: 4")
    print(f"   - CodeTypes: 1")
    print(f"   - Codes: {len(reason_codes)}")
    
except Exception as e:
    db.rollback()
    print(f"❌ Error creating sample data: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

