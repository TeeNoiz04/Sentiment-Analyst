# FastAPI Backend

Backend API được xây dựng bằng FastAPI.

## Cấu trúc thư mục

```
client/be/
├── main.py                 # Entry point của ứng dụng
├── api/                    # API routes
│   ├── __init__.py
│   └── v1/
│       ├── __init__.py
│       └── endpoints/      # Các endpoint handlers
│           ├── __init__.py
│           ├── health.py
│           └── example.py
├── core/                   # Core configuration
│   ├── __init__.py
│   └── config.py           # Settings và configuration
├── models/                 # Pydantic models
│   ├── __init__.py
│   └── schemas.py          # Request/Response schemas
├── utils/                  # Utility functions
│   ├── __init__.py
│   └── helpers.py
├── requirements.txt        # Python dependencies
├── .env.example           # Example environment variables
├── run.bat / run.sh       # Scripts để chạy server
└── README.md              # Documentation
```

## Cài đặt

### 1. Tạo môi trường ảo

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình môi trường

```bash
# Copy file .env.example thành .env
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Chỉnh sửa file .env với các giá trị phù hợp
```

### 4. Chạy ứng dụng

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Sau khi chạy server, truy cập:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Endpoints

### Health Check
- `GET /health` - Health check đơn giản
- `GET /api/v1/health` - Health check với thông tin chi tiết

### Example
- `GET /api/v1/example` - Lấy danh sách examples
- `GET /api/v1/example/{id}` - Lấy example theo ID
- `POST /api/v1/example` - Tạo example mới

## Development

### Thêm endpoint mới

1. Tạo file mới trong `api/v1/endpoints/`
2. Import router vào `api/v1/__init__.py`
3. Thêm schemas vào `models/schemas.py` nếu cần

### Testing

```bash
pytest
```

## Notes

- Đảm bảo Python version >= 3.8
- Sử dụng `.env` file để quản lý biến môi trường
- CORS đã được cấu hình sẵn cho các origin phổ biến

