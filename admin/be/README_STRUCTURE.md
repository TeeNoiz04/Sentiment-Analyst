# Cấu trúc Backend Admin

## Tổ chức thư mục

```
admin/be/
├── server.py              # Main FastAPI app - Admin APIs (NLP/ML)
├── models.py              # Admin models (PostRequest, SentimentRequestBody)
├── untils.py              # Admin utilities (NLP functions)
│
├── api/                   # Client API endpoints
│   └── v1/
│       └── endpoints/     # CRUD endpoints cho client
│
├── core/                  # Core configuration
│   ├── config.py         # Settings
│   └── database.py       # Database connection
│
├── models/                # Client database models & schemas
│   ├── database.py       # SQLAlchemy models
│   └── schemas.py        # Pydantic schemas
│
├── utils/                 # Client utilities
│   ├── helpers.py
│   └── post_trigger.py   # Auto-hide posts với >= 10 reports
│
├── data/                  # CSV data files
├── fine_tuned_model/      # ML models
├── topic_model/           # Topic classification model
└── summary_model_final/   # Summarization model
```

## Phân biệt Models

### Admin Models (`models.py` ở root)
- `PostRequest` - Model cho admin API (đọc từ CSV)
- `SentimentRequestBody` - Request body cho sentiment analysis
- **Import:** `from models import PostRequest, SentimentRequestBody`

### Client Models (`models/` folder)
- `models/database.py` - SQLAlchemy ORM models (User, Post, Vote, etc.)
- `models/schemas.py` - Pydantic schemas cho API requests/responses
- **Import:** `from models.database import Post, User, ...`
- **Import:** `from models.schemas import PostCreate, PostResponse, ...`

## API Endpoints

### Admin APIs (giữ nguyên - không thay đổi)
- `GET /posts` - Lấy posts từ CSV
- `POST /sentiment` - Phân tích sentiment
- `POST /word-analysis` - Phân tích từ
- `POST /topic-modeling` - Phân loại topic
- `GET /sentiment-trend` - Xu hướng sentiment
- `POST /school-summary-2` - Tóm tắt
- `GET /post/{post_id}` - Lấy post theo ID

### Client APIs (mới - prefix `/api/v1/client`)
- `GET /api/v1/client/posts` - CRUD posts từ database
- `GET /api/v1/client/users` - CRUD users
- `GET /api/v1/client/votes` - CRUD votes
- `GET /api/v1/client/comments` - CRUD comments
- `GET /api/v1/client/reports` - CRUD reports
- `GET /api/v1/client/roles` - CRUD roles
- `GET /api/v1/client/permissions` - CRUD permissions
- `GET /api/v1/client/code-types` - CRUD code types
- `GET /api/v1/client/codes` - CRUD codes

## Database

- **File:** `app.db` (SQLite)
- **Location:** `admin/be/app.db`
- **Shared:** Cả admin và client dùng chung 1 database
- **Auto-init:** Database tự động tạo khi server start

## Lưu ý

1. **Không đổi tên endpoints admin** - FE admin phụ thuộc vào các routes hiện tại
2. **Client APIs có prefix riêng** - `/api/v1/client/*` để tránh conflict
3. **Models tách biệt** - Admin dùng `models.py`, Client dùng `models/` folder
4. **Database chung** - Cả 2 hệ thống đồng bộ từ cùng 1 database

