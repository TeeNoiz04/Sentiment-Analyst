import os

db_path = "app.db"

if os.path.exists(db_path):
    os.remove(db_path)
    print("Đã xóa database cũ.")
else:
    print("Database cũ không tồn tại.")
