# Hướng dẫn tích hợp Client API vào Admin BE

## Cấu trúc

- **Admin APIs**: Các routes hiện tại (không thay đổi)
  - `/posts` - Lấy posts từ CSV
  - `/sentiment` - Phân tích sentiment
  - `/word-analysis` - Phân tích từ
  - `/topic-modeling` - Phân loại topic
  - `/sentiment-trend` - Xu hướng sentiment
  - `/school-summary-2` - Tóm tắt

- **Client APIs**: Các routes mới với prefix `/api/v1/client`
  - `/api/v1/client/posts` - CRUD posts từ database
  - `/api/v1/client/users` - CRUD users
  - `/api/v1/client/votes` - CRUD votes
  - `/api/v1/client/comments` - CRUD comments
  - `/api/v1/client/reports` - CRUD reports
  - `/api/v1/client/roles` - CRUD roles
  - `/api/v1/client/permissions` - CRUD permissions
  - `/api/v1/client/code-types` - CRUD code types
  - `/api/v1/client/codes` - CRUD codes

## Database

Cả 2 hệ thống dùng chung 1 database SQLite: `app.db`

## Cài đặt

1. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

2. Tạo data mẫu:
```bash
python create_sample_data.py
```

3. Chạy server:
```bash
uvicorn server:app --reload
```

## Test APIs

### Admin APIs (giữ nguyên)
- `GET /posts` - Lấy posts từ CSV
- `POST /sentiment` - Phân tích sentiment

### Client APIs (mới)
- `GET /api/v1/client/posts` - Lấy posts từ database
- `POST /api/v1/client/posts` - Tạo post mới
- `GET /api/v1/client/users` - Lấy danh sách users
- `POST /api/v1/client/users` - Tạo user mới

## Lưu ý

- Admin FE vẫn hoạt động bình thường với các routes cũ
- Client FE sử dụng các routes mới với prefix `/api/v1/client`
- Database được tự động tạo khi server khởi động
- Cả 2 hệ thống đồng bộ dữ liệu từ cùng 1 database

