# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Endpoints

### Posts (CRUD)

#### Create Post
```http
POST /posts
Content-Type: application/json

{
  "user_id": 1,
  "title": "Post Title",
  "content": "Post content here..."
}
```

#### Get Posts (with pagination and filters)
```http
GET /posts?skip=0&limit=10&state=active&user_id=1
```

#### Get Post by ID
```http
GET /posts/{post_id}
```

#### Update Post
```http
PUT /posts/{post_id}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "state": "hidden"
}
```

#### Delete Post (soft delete)
```http
DELETE /posts/{post_id}
```

---

### Users

#### Create User by Device ID
```http
POST /users
Content-Type: application/json

{
  "device_id": "unique-device-id-123",
  "username": "optional-username"
}
```
**Note:** If user with device_id already exists, returns existing user.

#### Find User by Device ID
```http
GET /users/device/{device_id}
```

#### Get User by ID
```http
GET /users/{user_id}
```

---

### Reports (CRUD)

#### Create Report
```http
POST /reports
Content-Type: application/json

{
  "post_id": 1,
  "user_id": 1,
  "report_type": "spam",
  "reason": "This is spam content"
}
```
**Report Types:** `spam`, `inappropriate`, `fake`, `harassment`, `other`

**Note:** 
- Automatically increments post's report_count
- Automatically hides post if report_count >= 10 (trigger)

#### Get Reports (with pagination and filters)
```http
GET /reports?skip=0&limit=10&post_id=1&user_id=1
```

#### Get Report by ID
```http
GET /reports/{report_id}
```

#### Update Report
```http
PUT /reports/{report_id}
Content-Type: application/json

{
  "report_type": "inappropriate",
  "reason": "Updated reason"
}
```

#### Delete Report
```http
DELETE /reports/{report_id}
```
**Note:** Automatically decrements post's report_count

---

### Interactions (CRUD)

#### Create Interaction
```http
POST /interactions
Content-Type: application/json

{
  "post_id": 1,
  "user_id": 1,
  "interaction_type": "like"
}
```
**Interaction Types:** `like`, `dislike`, `comment`, `share`

**Note:** Prevents duplicate interactions of the same type from the same user

#### Get Interactions (with pagination and filters)
```http
GET /interactions?skip=0&limit=10&post_id=1&user_id=1&interaction_type=like
```

#### Get Interaction by ID
```http
GET /interactions/{interaction_id}
```

#### Delete Interaction (e.g., unlike)
```http
DELETE /interactions/{interaction_id}
```

#### Get Post Interaction Statistics
```http
GET /interactions/post/{post_id}/stats
```

Returns:
```json
{
  "likes": 10,
  "dislikes": 2,
  "comments": 5,
  "shares": 3,
  "total": 20
}
```

---

## Trigger Logic

### Auto-Hide Post Trigger
When a post receives **10 or more reports**, it is automatically hidden:
- Post state changes from `active` to `hidden`
- Trigger is executed after each new report is created
- Implemented in `utils/post_trigger.py`

---

## Post States

- `active`: Post is visible and active
- `hidden`: Post is hidden (automatically set when report_count >= 10)
- `deleted`: Post is soft-deleted

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Error message here"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

---

## Database Schema

### Posts
- `id`: Integer (Primary Key)
- `user_id`: Integer (Foreign Key → users.id)
- `title`: String(255)
- `content`: Text
- `state`: String (active, hidden, deleted)
- `report_count`: Integer (default: 0)
- `created_at`: DateTime
- `updated_at`: DateTime

### Users
- `id`: Integer (Primary Key)
- `device_id`: String(255) (Unique, Indexed)
- `username`: String(100) (Optional)
- `created_at`: DateTime
- `updated_at`: DateTime

### Reports
- `id`: Integer (Primary Key)
- `post_id`: Integer (Foreign Key → posts.id)
- `user_id`: Integer (Foreign Key → users.id)
- `report_type`: String(50)
- `reason`: Text (Optional)
- `created_at`: DateTime

### Interactions
- `id`: Integer (Primary Key)
- `post_id`: Integer (Foreign Key → posts.id)
- `user_id`: Integer (Foreign Key → users.id)
- `interaction_type`: String(50)
- `created_at`: DateTime

---

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize database (automatically on first run):
```bash
# Database will be created automatically when you start the server
```

3. Run server:
```bash
uvicorn main:app --reload
```

4. Access API docs:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

