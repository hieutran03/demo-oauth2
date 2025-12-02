# API Documentation - Demo OAuth2 Server

## Tổng quan

Đây là tài liệu API cho hệ thống OAuth2 Server được xây dựng bằng Node.js, Express và PostgreSQL.

### Base URL
```
http://localhost:3000
```

### API Version
```
/api/v1
```

---

## Mục lục

1. [User APIs](#user-apis)
   - [Register](#1-register---đăng-ký-tài-khoản)
   - [Login](#2-login---đăng-nhập-oauth2)
2. [OAuth2 APIs](#oauth2-apis)
   - [Authorize](#1-authorize---yêu-cầu-ủy-quyền)
   - [Token](#2-token---lấy-access-token)
   - [Authenticate](#3-authenticate---xác-thực-token)
   - [Revoke](#4-revoke---thu-hồi-token)
   - [Login Page](#5-login-page---trang-đăng-nhập)
   - [Register Client](#6-register-client---đăng-ký-oauth-client)
   - [Get Client List](#7-get-client-list---lấy-danh-sách-client)
   - [Delete Client](#8-delete-client---xóa-client)

---

## User APIs

### 1. Register - Đăng ký tài khoản

Đăng ký tài khoản người dùng mới.

**Endpoint:**
```
POST /api/v1/user/register
```

**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ✅ | Họ và tên người dùng |
| `username` | string | ✅ | Tên đăng nhập (unique) |
| `password` | string | ✅ | Mật khẩu |
| `confirmPassword` | string | ✅ | Xác nhận mật khẩu |

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fullName=Nguyen Van A&username=user001&password=T@123456&confirmPassword=T@123456"
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user001",
    "fullName": "Nguyen Van A",
    "status": "active",
    "email": null,
    "phone": null,
    "updatedAt": "2025-12-02T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 | Validation error (thiếu field, mật khẩu không khớp) |
| 409 | Username đã tồn tại |

---

### 2. Login - Đăng nhập (OAuth2)

Đăng nhập để hoàn tất flow OAuth2 authorization.

**Endpoint:**
```
POST /api/v1/user/login
```

**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Tên đăng nhập |
| `password` | string | ✅ | Mật khẩu |
| `client_id` | string | ❌ | Client ID (OAuth2) |
| `redirect_uri` | string | ❌ | Redirect URI (OAuth2) |
| `state` | string | ❌ | State parameter (OAuth2) |

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user001&password=T@123456&client_id=test-client-id&redirect_uri=http://localhost:3000/callback&state=112233"
```

**Success Response:**
- Redirect đến `/api/v1/oauth/authorize` với authorization code

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 | Missing OAuth2 query parameters |
| 401 | Invalid username or password |

---

## OAuth2 APIs

### 1. Authorize - Yêu cầu ủy quyền

Authorization endpoint - bước đầu tiên trong OAuth2 Authorization Code flow.

**Endpoint:**
```
GET /api/v1/oauth/authorize
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | ✅ | Client ID đã đăng ký |
| `response_type` | string | ✅ | Phải là `code` |
| `redirect_uri` | string | ✅ | URI để redirect sau khi authorize |
| `scope` | string | ❌ | Scope yêu cầu |
| `state` | string | ✅ | State để bảo vệ CSRF |

**Request Example:**
```
GET /api/v1/oauth/authorize?client_id=test-client-id&response_type=code&redirect_uri=http://localhost:3000/callback&state=112233
```

**Response:**
- Nếu chưa đăng nhập: Redirect đến trang login
- Nếu đã đăng nhập: Redirect đến `redirect_uri` với authorization code

**Success Redirect:**
```
http://localhost:3000/callback?code=AUTHORIZATION_CODE&state=112233
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 | Missing client_id hoặc state |
| 400 | Client not found |
| 401 | User chưa đăng nhập |

---

### 2. Token - Lấy Access Token

Token endpoint - đổi authorization code lấy access token.

**Endpoint:**
```
POST /api/v1/oauth/token
```

**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `grant_type` | string | ✅ | `authorization_code` hoặc `refresh_token` |
| `code` | string | ✅* | Authorization code (khi grant_type=authorization_code) |
| `redirect_uri` | string | ✅* | Phải khớp với redirect_uri khi authorize |
| `client_id` | string | ✅ | Client ID |
| `client_secret` | string | ✅ | Client Secret |
| `refresh_token` | string | ✅* | Refresh token (khi grant_type=refresh_token) |

*Required tùy thuộc vào grant_type

**Request Example (Authorization Code):**
```bash
curl -X POST http://localhost:3000/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=AUTH_CODE&redirect_uri=http://localhost:3000/callback&client_id=test-client-id&client_secret=test-client-secret"
```

**Request Example (Refresh Token):**
```bash
curl -X POST http://localhost:3000/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=REFRESH_TOKEN&client_id=test-client-id&client_secret=test-client-secret"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token issued",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessTokenExpiresAt": "2025-12-02T11:00:00.000Z",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenExpiresAt": "2025-12-09T10:00:00.000Z",
    "scope": "read write",
    "client": {
      "id": "test-client-id"
    },
    "user": {
      "id": "507f1f77bcf86cd799439011"
    }
  }
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid grant_type |
| 400 | Authorization code not found hoặc expired |
| 401 | Invalid client credentials |

---

### 3. Authenticate - Xác thực Token

Xác thực access token và lấy thông tin user.

**Endpoint:**
```
GET /api/v1/oauth/authenticate
```

**Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | ✅ | Bearer token |

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/v1/oauth/authenticate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User authenticated",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user001"
  }
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid access token |
| 401 | Access token expired |
| 404 | User not found |

---

### 4. Revoke - Thu hồi Token

Thu hồi (vô hiệu hóa) access token hoặc refresh token.

**Endpoint:**
```
POST /api/v1/oauth/revoke
```

**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | ✅ | Token cần thu hồi |
| `token_type_hint` | string | ❌ | `access_token` hoặc `refresh_token` |

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&token_type_hint=access_token"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token revoked"
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 | Missing token |
| 400 | Token not found or already revoked |

---

### 5. Login Page - Trang đăng nhập

Hiển thị trang đăng nhập cho OAuth2 flow.

**Endpoint:**
```
GET /api/v1/oauth/login
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | ✅ | Client ID |
| `redirect_uri` | string | ✅ | Redirect URI |
| `state` | string | ✅ | State parameter |

**Request Example:**
```
GET /api/v1/oauth/login?client_id=test-client-id&redirect_uri=http://localhost:3000/callback&state=112233
```

**Response:**
- Render trang HTML login (`login.ejs`)

---

### 6. Register Client - Đăng ký OAuth Client

Đăng ký một OAuth client mới để sử dụng OAuth2 flow.

**Endpoint:**
```
POST /api/v1/oauth/client
```

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | ✅ | Client ID (unique) |
| `clientSecret` | string | ✅ | Client Secret |
| `callbackUrl` | string | ✅ | Redirect URI sau khi authorize |
| `grants` | array | ❌ | Các grant types được phép (default: `["authorization_code", "refresh_token"]`) |

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/oauth/client \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "my-app-client",
    "clientSecret": "my-secret-key",
    "callbackUrl": "http://localhost:4000/callback",
    "grants": ["authorization_code", "refresh_token"]
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "clientId": "my-app-client",
    "clientSecret": "my-secret-key",
    "callbackUrl": "http://localhost:4000/callback",
    "grants": ["authorization_code", "refresh_token"],
    "createdAt": "2025-12-02T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 | Missing required fields |
| 409 | Client ID already exists |

---

### 7. Get Client List - Lấy danh sách Client

Lấy danh sách tất cả OAuth clients đã đăng ký.

**Endpoint:**
```
GET /api/v1/oauth/client
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/v1/oauth/client
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client list retrieved",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "clientId": "my-app-client",
      "callbackUrl": "http://localhost:4000/callback",
      "grants": ["authorization_code", "refresh_token"],
      "userId": null,
      "createdAt": "2025-12-02T10:00:00.000Z"
    }
  ]
}
```

---

### 8. Delete Client - Xóa Client

Xóa một OAuth client.

**Endpoint:**
```
DELETE /api/v1/oauth/client/{clientId}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | ✅ | Client ID cần xóa |

**Request Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/oauth/client/my-app-client
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 404 | Client not found |

---

## OAuth2 Flow Diagram

```
┌──────────┐                                           ┌──────────────┐
│  Client  │                                           │  OAuth2      │
│  App     │                                           │  Server      │
└────┬─────┘                                           └──────┬───────┘
     │                                                        │
     │  1. GET /oauth/authorize?client_id=...&state=...      │
     │ ─────────────────────────────────────────────────────>│
     │                                                        │
     │  2. Redirect to /oauth/login (if not logged in)       │
     │ <─────────────────────────────────────────────────────│
     │                                                        │
     │  3. User submits credentials                          │
     │ ─────────────────────────────────────────────────────>│
     │                                                        │
     │  4. Redirect to callback?code=AUTH_CODE&state=...     │
     │ <─────────────────────────────────────────────────────│
     │                                                        │
     │  5. POST /oauth/token (exchange code for token)       │
     │ ─────────────────────────────────────────────────────>│
     │                                                        │
     │  6. Return access_token, refresh_token                │
     │ <─────────────────────────────────────────────────────│
     │                                                        │
     │  7. GET /oauth/authenticate (with Bearer token)       │
     │ ─────────────────────────────────────────────────────>│
     │                                                        │
     │  8. Return user info                                  │
     │ <─────────────────────────────────────────────────────│
     │                                                        │
```

---

## Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `id` | string(24) | ObjectId, Primary Key |
| `username` | string | Tên đăng nhập (unique) |
| `fullName` | string | Họ và tên |
| `password` | string | Mật khẩu (bcrypt hashed) |
| `status` | enum | `active` / `inactive` |
| `verify` | boolean | Trạng thái xác thực |
| `createdAt` | datetime | Thời gian tạo |
| `updatedAt` | datetime | Thời gian cập nhật |

### OAuth Client
| Field | Type | Description |
|-------|------|-------------|
| `id` | string(36) | UUID, Primary Key |
| `clientId` | string | Client ID |
| `clientSecret` | string | Client Secret |
| `grants` | array | Các grant types được phép |
| `callbackUrl` | string | Redirect URI |
| `userId` | string | User sở hữu client |

### OAuth Access Token
| Field | Type | Description |
|-------|------|-------------|
| `id` | string(36) | UUID, Primary Key |
| `accessToken` | string | Access token |
| `accessTokenExpiresAt` | datetime | Thời gian hết hạn |
| `scope` | string | Scope |
| `clientId` | string | Client ID |
| `userId` | string | User ID |

### OAuth Refresh Token
| Field | Type | Description |
|-------|------|-------------|
| `id` | string(36) | UUID, Primary Key |
| `refreshToken` | string | Refresh token |
| `refreshTokenExpiresAt` | datetime | Thời gian hết hạn |
| `scope` | string | Scope |
| `clientId` | string | Client ID |
| `userId` | string | User ID |

### OAuth Authorization Code
| Field | Type | Description |
|-------|------|-------------|
| `id` | string(36) | UUID, Primary Key |
| `authorizationCode` | string | Authorization code |
| `expiresAt` | datetime | Thời gian hết hạn |
| `redirectUri` | string | Redirect URI |
| `scope` | string | Scope |
| `clientId` | string | Client ID |
| `userId` | string | User ID |

---

## Error Response Format

Tất cả các error response đều có format:

```json
{
  "error": "Error message description"
}
```

hoặc

```json
{
  "success": false,
  "message": "Error message description",
  "status": 400
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `dev` |
| `DEV_PORT` | Server port | `3000` |
| `DEV_APP_KEY` | Secret key | - |
| `DEV_DB_HOST` | PostgreSQL host | `db` |
| `DEV_DB_PORT` | PostgreSQL port | `5432` |
| `DEV_DB_USER` | PostgreSQL user | `postgres` |
| `DEV_DB_PASSWORD` | PostgreSQL password | - |
| `DEV_DB_DATABASE` | Database name | `demo_oauth` |
| `TOKEN_TIMEOUT` | Token timeout (seconds) | `3600` |
| `TOKEN_TIMEOUT_REDIS` | Redis cache timeout | `7200` |

---

## Swagger Documentation

API documentation có thể truy cập qua Swagger UI:

```
http://localhost:3000/api-docs
```

---

## Chạy Project

### Với Docker Compose:
```bash
docker-compose up -d
```

### Không dùng Docker:
```bash
# Install dependencies
npm install

# Run development
npm run start
```

---

## Security Considerations

1. **Password Hashing**: Mật khẩu được hash bằng bcrypt với salt rounds = 11
2. **Token Expiration**: Access token và authorization code có thời hạn giới hạn
3. **CSRF Protection**: Sử dụng state parameter trong OAuth2 flow
4. **Client Secret**: Yêu cầu client secret khi exchange token

---

*Tài liệu được tạo tự động - Cập nhật: December 2025*
