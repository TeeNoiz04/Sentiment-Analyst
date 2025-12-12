# Session Management System - Summary

## 🎯 Đã thực hiện

### 1. **Database Schema Updates**

Thêm bảng `user_sessions` để lưu trữ JWT sessions:

```sql
CREATE TABLE user_sessions (
    SessionID INTEGER PRIMARY KEY,
    UserID INTEGER NOT NULL,
    AccessToken TEXT NOT NULL,
    RefreshToken TEXT NOT NULL,
    DeviceInfo VARCHAR(255),
    IpAddress VARCHAR(50),
    UserAgent VARCHAR(500),
    CreatedAt TIMESTAMP,
    ExpiresAt TIMESTAMP NOT NULL,
    LastAccessedAt TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);
```

**Fields:**
- `AccessToken`: Token hiện tại của session
- `RefreshToken`: Token để refresh
- `DeviceInfo`: Device ID của user
- `IpAddress`: IP address khi login
- `UserAgent`: Browser/App info
- `LastAccessedAt`: Lần cuối access API
- `Status`: active/expired/revoked

### 2. **Updated Models**

**`models/database.py`:**
- Thêm `SessionStatus` enum (ACTIVE, EXPIRED, REVOKED)
- Thêm model `UserSession`
- Thêm relationship `sessions` trong `User` model

### 3. **Updated Auth Endpoints**

**`api/client/endpoints/auth.py`:**
- ✅ **Register**: Lưu session sau khi đăng ký
- ✅ **Login**: Lưu session mới với device/IP info
- ✅ **Logout**: Revoke session hiện tại
- ✅ **Refresh**: Revoke session cũ và tạo session mới
- ✅ **NEW: GET /sessions**: Xem tất cả sessions đang active
- ✅ **NEW: POST /logout-all**: Logout khỏi tất cả devices
- ✅ **NEW: DELETE /sessions/{id}**: Revoke session cụ thể

### 4. **Updated Auth Utils**

**`utils/auth.py`:**
- `get_current_user()` giờ kiểm tra session còn active không
- Tự động update `LastAccessedAt` mỗi khi access API
- Throw 401 nếu session bị revoked/expired

## 🔐 Security Features

1. **Multi-device tracking**: Biết được user đang login từ device nào
2. **Session revocation**: Có thể logout từ device cụ thể hoặc tất cả
3. **IP tracking**: Phát hiện suspicious login từ IP lạ
4. **Last access tracking**: Biết session nào đang active, nào idle
5. **Auto expiry**: Sessions tự động expire sau 30 days

## 📊 Use Cases

### Use Case 1: User login từ nhiều devices
```
1. Login từ Phone -> Session 1 created
2. Login từ Laptop -> Session 2 created
3. GET /sessions -> Hiện 2 sessions
4. DELETE /sessions/1 -> Logout khỏi Phone
5. GET /sessions -> Chỉ còn Laptop session
```

### Use Case 2: Security - Phát hiện login lạ
```
1. User thấy trong /sessions có IP lạ
2. User click "Logout from all devices"
3. Tất cả sessions bị revoke
4. Attacker không access được API nữa
```

### Use Case 3: Token rotation
```
1. Access token hết hạn sau 24h
2. Frontend call /refresh với refresh_token
3. Old session -> EXPIRED
4. New session -> ACTIVE với tokens mới
```

## 🚀 Setup Steps

### Step 1: Cài đặt packages
```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

### Step 2: Tạo bảng user_sessions
```bash
python create_sessions_table.py
```

Hoặc dùng Alembic:
```bash
alembic revision --autogenerate -m "Add user sessions"
alembic upgrade head
```

### Step 3: Restart server
```bash
uvicorn server:app --reload
```

### Step 4: Test
```bash
python test_auth.py
```

## 📱 Frontend Integration

### Example: React Hook cho Session Management

```javascript
// useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [sessions, setSessions] = useState([]);
  
  const getSessions = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('/client/auth/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setSessions(data.sessions);
  };
  
  const logoutDevice = async (sessionId) => {
    const token = localStorage.getItem('access_token');
    await fetch(`/client/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await getSessions(); // Refresh list
  };
  
  const logoutAll = async () => {
    const token = localStorage.getItem('access_token');
    await fetch('/client/auth/logout-all', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    localStorage.clear();
    window.location.href = '/login';
  };
  
  return { sessions, getSessions, logoutDevice, logoutAll };
};
```

### Example: Sessions Page Component

```jsx
// SessionsPage.jsx
import { useEffect } from 'react';
import { useAuth } from './useAuth';

const SessionsPage = () => {
  const { sessions, getSessions, logoutDevice, logoutAll } = useAuth();
  
  useEffect(() => {
    getSessions();
  }, []);
  
  return (
    <div>
      <h2>Active Sessions</h2>
      <button onClick={logoutAll}>Logout All Devices</button>
      
      {sessions.map(session => (
        <div key={session.session_id}>
          <p>{session.device_info || 'Unknown Device'}</p>
          <p>IP: {session.ip_address}</p>
          <p>Last active: {new Date(session.last_accessed_at).toLocaleString()}</p>
          <button onClick={() => logoutDevice(session.session_id)}>
            Logout This Device
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# JWT Secret (CHANGE THIS!)
JWT_SECRET_KEY=your-super-secret-key-here-min-32-chars

# Token Expiry
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30      # 30 days

# Session Settings
SESSION_MAX_PER_USER=5  # Optional: limit sessions per user
SESSION_CLEANUP_DAYS=90  # Auto-delete old sessions after 90 days
```

## 📈 Future Enhancements

1. **Session Limits**: Giới hạn max số sessions/user (e.g., 5 devices)
2. **Cleanup Job**: Cron job xóa expired sessions sau X ngày
3. **Suspicious Activity**: Alert khi login từ IP/location lạ
4. **Device Fingerprinting**: Track device info chi tiết hơn
5. **Session Analytics**: Dashboard xem login patterns
6. **Redis Cache**: Cache active sessions cho performance

## 🧪 Testing Checklist

- ✅ Register tạo session
- ✅ Login tạo session mới
- ✅ Logout revoke session
- ✅ Logout all revoke tất cả sessions
- ✅ Refresh token rotate sessions
- ✅ Expired session không access được API
- ✅ Revoked session không access được API
- ✅ GET /sessions trả về đúng sessions
- ✅ DELETE /sessions/{id} revoke đúng session
- ✅ LastAccessedAt được update khi call API

## 📚 API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Đăng ký + tạo session |
| `/auth/login` | POST | Đăng nhập + tạo session |
| `/auth/logout` | POST | Logout device hiện tại |
| `/auth/logout-all` | POST | Logout tất cả devices |
| `/auth/refresh` | POST | Làm mới token + rotate session |
| `/auth/sessions` | GET | Xem tất cả sessions |
| `/auth/sessions/{id}` | DELETE | Revoke session cụ thể |
| `/auth/me` | GET | Thông tin user (check session) |
| `/auth/change-password` | POST | Đổi password |

---

**Note:** Tất cả protected endpoints giờ đều verify session còn active trước khi cho phép access.
