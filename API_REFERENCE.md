# Infinigram API Reference

## Base URL
```
http://localhost:5000
```

## Authentication
All endpoints require the user's email as a path parameter or in the request body.

---

## Endpoints

### 1. Signup
**POST** `/api/infinigram/signup`

**Requirements**:
- Main account with same email must exist

**Request**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "dob": "2000-01-01",
  "userType": "consumer"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Infinigram signup successful",
  "user": {
    "id": "1769833216888",
    "email": "user@example.com",
    "username": "username",
    "dob": "2000-01-01",
    "profilePhoto": "",
    "followers": 0,
    "following": 0,
    "userType": "consumer"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": "Main account not found with this email. Please create a main account first."
}
```

---

### 2. Login
**POST** `/api/infinigram/login`

**Requirements**:
- Main account with email must exist
- Infinigram profile must exist under that email

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "1769833216888",
    "email": "user@example.com",
    "username": "username",
    "dob": "2000-01-01",
    "profilePhoto": "",
    "followers": 0,
    "following": 0,
    "userType": "consumer"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": "Main account not found with this email. Please create a main account first."
}
```

---

### 3. Get Profile
**GET** `/api/infinigram/profile/:email`

**Example**: `/api/infinigram/profile/user@example.com`

**Success Response** (200):
```json
{
  "success": true,
  "profile": {
    "id": "1769833216888",
    "email": "user@example.com",
    "username": "username",
    "dob": "2000-01-01",
    "userType": "consumer",
    "profilePhoto": "",
    "bio": "",
    "followers": 0,
    "following": 0,
    "createdAt": "2026-01-31T04:20:16.888Z",
    "lastLogin": "2026-02-04T13:48:00.754Z"
  }
}
```

---

### 4. Update Profile
**POST** `/api/infinigram/profile/update`

**Request**:
```json
{
  "email": "user@example.com",
  "username": "newusername",
  "bio": "My bio here",
  "profilePhoto": "base64string or path"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "1769833216888",
    "email": "user@example.com",
    "username": "newusername",
    "bio": "My bio here",
    "profilePhoto": "base64string or path"
  }
}
```

**Activity Logged**: 
- Type: `profile_updated`
- Changes: `{username: true, bio: true, profilePhoto: false}`

---

### 5. Get All Posts
**GET** `/api/infinigram/posts/:email`

**Example**: `/api/infinigram/posts/user@example.com`

**Success Response** (200):
```json
{
  "success": true,
  "posts": [
    {
      "id": "17698332168881234567890",
      "userId": "1769833216888",
      "username": "username",
      "userPhoto": "",
      "caption": "My first post!",
      "description": "",
      "content": "",
      "mediaType": "video",
      "mediaPath": "video.mp4",
      "timestamp": "2026-02-04T13:48:00.754Z",
      "likes": 5,
      "comments": 2,
      "liked": false,
      "saved": false,
      "likedBy": ["userId1", "userId2"],
      "savedBy": [],
      "commentsList": []
    }
  ]
}
```

---

### 6. Create Post
**POST** `/api/infinigram/posts/create`

**Request**:
```json
{
  "email": "user@example.com",
  "caption": "Great moment!",
  "description": "Full description here",
  "content": "Text content",
  "mediaType": "image",
  "mediaPath": "image.jpg"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "17698332168881234567890",
    "userId": "1769833216888",
    "username": "username",
    "userPhoto": "",
    "caption": "Great moment!",
    "description": "Full description here",
    "content": "Text content",
    "mediaType": "image",
    "mediaPath": "image.jpg",
    "timestamp": "2026-02-04T13:48:00.754Z",
    "likes": 0,
    "comments": 0,
    "liked": false,
    "saved": false,
    "likedBy": [],
    "savedBy": [],
    "commentsList": []
  }
}
```

**Activity Logged**:
- Type: `post_created`
- PostId: post ID
- MediaType: `image` or `video`

---

### 7. Get Single Post
**GET** `/api/infinigram/posts/:email/:postId`

**Example**: `/api/infinigram/posts/user@example.com/17698332168881234567890`

**Success Response** (200):
```json
{
  "success": true,
  "post": { /* same structure as create response */ }
}
```

---

### 8. Delete Post
**DELETE** `/api/infinigram/posts/:email/:postId`

**Example**: `/api/infinigram/posts/user@example.com/17698332168881234567890`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Activity Logged**:
- Type: `post_deleted`
- PostId: deleted post ID

---

### 9. Like/Unlike Post
**POST** `/api/infinigram/posts/:email/:postId/like`

**Example**: `/api/infinigram/posts/user@example.com/17698332168881234567890/like`

**Request**:
```json
{
  "userId": "currentUserId",
  "action": "like"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Post liked",
  "likes": 6
}
```

**Activity Logged**:
- Type: `post_liked`
- PostId: post ID
- Action: `like` or `unlike`

**Actions**:
- `"like"` - Add userId to likedBy array
- `"unlike"` - Remove userId from likedBy array

---

### 10. Get Activities
**GET** `/api/infinigram/activities/:email`

**Example**: `/api/infinigram/activities/user@example.com`

**Success Response** (200):
```json
{
  "success": true,
  "activities": [
    {
      "type": "infinigram_signup",
      "timestamp": "2026-01-31T04:20:16.888Z",
      "details": "Created Infinigram account as consumer"
    },
    {
      "type": "infinigram_login",
      "timestamp": "2026-02-04T13:48:00.754Z"
    },
    {
      "type": "profile_updated",
      "timestamp": "2026-02-04T13:50:00.000Z",
      "changes": {
        "username": true,
        "bio": true,
        "profilePhoto": false
      }
    },
    {
      "type": "post_created",
      "timestamp": "2026-02-04T13:52:00.000Z",
      "postId": "17698332168881234567890",
      "mediaType": "image"
    }
  ]
}
```

---

## Activity Types

| Type | Triggered | Details |
|------|-----------|---------|
| `infinigram_signup` | Account creation | User type included |
| `infinigram_login` | User login | Timestamp only |
| `profile_updated` | Profile change | What changed listed |
| `post_created` | New post | Post ID and media type |
| `post_deleted` | Post deletion | Deleted post ID |
| `post_liked` | Like/unlike | Post ID and action |

---

## Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Main account not found |
| 404 | Not Found | Profile/post doesn't exist |
| 500 | Server Error | Internal server error |

---

## Data Types

### Post Object
```json
{
  "id": "string (timestamp + random)",
  "userId": "string (user ID)",
  "username": "string",
  "userPhoto": "string (path or empty)",
  "caption": "string",
  "description": "string",
  "content": "string",
  "mediaType": "string (image|video|document|text)",
  "mediaPath": "string (path to file)",
  "timestamp": "ISO 8601 string",
  "likes": "number",
  "comments": "number",
  "liked": "boolean",
  "saved": "boolean",
  "likedBy": "string[] (user IDs)",
  "savedBy": "string[] (user IDs)",
  "commentsList": "object[]"
}
```

### Profile Object
```json
{
  "id": "string (user ID)",
  "email": "string",
  "username": "string",
  "dob": "string (YYYY-MM-DD)",
  "userType": "string (consumer|producer)",
  "profilePhoto": "string (path or empty)",
  "bio": "string",
  "followers": "number",
  "following": "number",
  "createdAt": "ISO 8601 string",
  "lastLogin": "ISO 8601 string"
}
```

### Activity Object
```json
{
  "type": "string (activity type)",
  "timestamp": "ISO 8601 string",
  "details": "string (optional)",
  "postId": "string (optional)",
  "mediaType": "string (optional)",
  "action": "string (optional)",
  "changes": "object (optional)"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## Example Flow: Complete Post Creation

### Step 1: Login
```bash
curl -X POST http://localhost:5000/api/infinigram/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Step 2: Create Post
```bash
curl -X POST http://localhost:5000/api/infinigram/posts/create \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "caption":"Great moment!",
    "mediaType":"image",
    "mediaPath":"image.jpg"
  }'
```

### Step 3: Get All Posts
```bash
curl http://localhost:5000/api/infinigram/posts/user@example.com
```

### Step 4: View Activities
```bash
curl http://localhost:5000/api/infinigram/activities/user@example.com
```

---

## Testing with cURL

All examples use basic cURL for easy testing. For production, use:
- Python requests
- JavaScript fetch/axios
- Postman
- Thunder Client
- Other API clients

---

## Performance Notes

- POST requests create activity logs automatically
- GET requests return data in arrays
- DELETE requests verify post exists before deletion
- All timestamps are in ISO 8601 format (UTC)
- Database saves happen synchronously

---

## Version

- API Version: 1.0
- Last Updated: February 4, 2026
- Status: ✅ Production Ready

---

## Support

For issues or questions about the API:
1. Check console logs for detailed error messages
2. Review INFINIGRAM_IMPLEMENTATION.md for technical details
3. Check VERIFICATION_CHECKLIST.md for testing scenarios
