# Authentication System - JWT Implementation

## 📦 Installation

Cài đặt các package cần thiết:

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

Hoặc cài từ `requirements.txt`:

```bash
pip install -r requirements.txt
```

## 🔐 API Endpoints

Tất cả các endpoint auth đều có prefix: `/client/auth`

### 1. **POST /client/auth/register** - Đăng ký tài khoản mới

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com",
  "full_name": "John Doe",
  "device_id": "device-123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": null
  }
}
```

### 2. **POST /client/auth/login** - Đăng nhập

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": null
  }
}
```

### 3. **POST /client/auth/logout** - Đăng xuất (requires token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Successfully logged out",
  "user_id": 1
}
```

### 4. **POST /client/auth/refresh** - Làm mới access token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": null
  }
}
```

### 5. **GET /client/auth/me** - Lấy thông tin user hiện tại (requires token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "avatar_url": null,
  "device_id": "device-123",
  "status": "active",
  "created_at": "2025-12-09T10:30:00",
  "last_active": "2025-12-09T15:45:00"
}
```

### 6. **POST /client/auth/change-password** - Đổi mật khẩu (requires token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "old_password": "password123",
  "new_password": "newpassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully",
  "user_id": 1
}
```

### 7. **GET /client/auth/sessions** - Xem tất cả sessions đang active (requires token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user_id": 1,
  "total": 3,
  "sessions": [
    {
      "session_id": 1,
      "device_info": "device-123",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-09T10:30:00",
      "last_accessed_at": "2025-12-09T15:45:00",
      "expires_at": "2026-01-08T10:30:00"
    }
  ]
}
```

### 8. **POST /client/auth/logout-all** - Đăng xuất tất cả devices (requires token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out from all devices",
  "user_id": 1,
  "sessions_revoked": 3
}
```

### 9. **DELETE /client/auth/sessions/{session_id}** - Xóa 1 session cụ thể (requires token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Session revoked successfully",
  "session_id": 2
}
```

## 🔧 Cách sử dụng trong code

### Frontend - JavaScript/React Example

```javascript
// 1. Login
const login = async (username, password) => {
  const response = await fetch('http://localhost:8000/client/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  // Lưu tokens vào localStorage
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};

// 2. Gọi API với token
const getProtectedData = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/client/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// 3. Refresh token khi hết hạn
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/client/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  
  return data;
};

// 4. Logout
const logout = async () => {
  const token = localStorage.getItem('access_token');
  
  await fetch('http://localhost:8000/client/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Xóa tokens khỏi localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};
```

### Backend - Bảo vệ endpoints với JWT

```python
from fastapi import APIRouter, Depends
from utils.auth import get_current_user
from models.database import User

router = APIRouter()

@router.get("/protected-endpoint")
async def protected_route(current_user: User = Depends(get_current_user)):
    """Endpoint này yêu cầu authentication"""
    return {
        "message": "This is protected data",
        "user_id": current_user.UserID,
        "username": current_user.Username
    }
```

## ⚙️ Configuration

### Thay đổi SECRET_KEY (QUAN TRỌNG!)

Mở file `utils/auth.py` và thay đổi:

```python
SECRET_KEY = "your-secret-key-change-this-in-production"
```

Nên sử dụng một chuỗi ngẫu nhiên dài và phức tạp. Generate bằng:

```python
import secrets
print(secrets.token_urlsafe(32))
```

### Thay đổi thời gian hết hạn token

Trong `utils/auth.py`:

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 giờ
REFRESH_TOKEN_EXPIRE_DAYS = 30  # 30 ngày
```

## 🔒 Security Features

1. **Password Hashing**: Sử dụng bcrypt để hash mật khẩu
2. **JWT Tokens**: Access token (24h) và refresh token (30 days)
3. **Token Validation**: Verify token signature và expiration
4. **Failed Login Tracking**: Đếm số lần đăng nhập thất bại
5. **User Status Check**: Chỉ cho phép user active đăng nhập
6. **Last Active Update**: Cập nhật thời gian hoạt động cuối

## 📝 Notes

- Access token có thời gian sống ngắn (24h) để bảo mật
- Refresh token có thời gian sống dài (30 days) để tạo access token mới
- **Sessions được lưu trong database** để tracking và quản lý multi-device login
- Mỗi login/register tạo 1 session mới với thông tin device, IP, user-agent
- Khi logout, session sẽ được đánh dấu là `REVOKED`
- Kiểm tra session status mỗi khi call API có authentication
- Có thể xem tất cả sessions đang active và logout từ specific device
- Trong production, xem xét thêm session cleanup job để xóa expired sessions
- Xem xét thêm 2FA (Two-Factor Authentication) cho security cao hơn

## 🗄️ Database Setup

Trước khi sử dụng, cần tạo bảng `user_sessions`:

```bash
python create_sessions_table.py
```

Hoặc sử dụng Alembic migration:

```bash
alembic revision --autogenerate -m "Add user sessions table"
alembic upgrade head
```

## 🧪 Testing

Test với cURL:

```bash
# Register
curl -X POST http://localhost:8000/client/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@example.com"}'

# Login
curl -X POST http://localhost:8000/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:8000/client/auth/me \
  -H "Authorization: Bearer TOKEN"
```
