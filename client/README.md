# OAuth2 Demo Client

Demo client application để test OAuth2 Authorization Code flow với OAuth2 Server.

## Cài đặt

```bash
cd demo_client
npm install
```

## Cấu hình

Sửa file `.env` nếu cần:

```env
CLIENT_ID=demo-client
CLIENT_SECRET=demo-client-secret
CALLBACK_URL=http://localhost:4000/callback
OAUTH_SERVER_URL=http://localhost:3000
PORT=4000
```

## Chạy

```bash
npm start
# hoặc
npm run dev
```

Mở browser: http://localhost:4000

## Hướng dẫn test OAuth2 Flow

### Bước 1: Khởi động OAuth2 Server
```bash
# Trong thư mục gốc demo_oauth
docker-compose up -d
# hoặc
npm start
```

### Bước 2: Khởi động Demo Client
```bash
cd demo_client
npm install
npm start
```

### Bước 3: Đăng ký Client
1. Mở http://localhost:4000
2. Click "Register Client" để đăng ký client trên OAuth2 Server

### Bước 4: Tạo User Account
Gọi API đăng ký user:
```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fullName=Test User&username=testuser&password=Test@123&confirmPassword=Test@123"
```

### Bước 5: Test OAuth2 Login
1. Click "Login with OAuth2"
2. Sẽ redirect đến OAuth2 Server
3. Nhập username/password đã tạo
4. Sau khi login thành công, sẽ redirect về với access token

### Bước 6: Test các tính năng
- **Get User Info**: Lấy thông tin user bằng access token
- **Refresh Token**: Làm mới access token
- **Revoke Token**: Thu hồi token

## OAuth2 Flow

```
┌─────────────────┐          ┌────────────────────┐
│   Demo Client   │          │   OAuth2 Server    │
│  (port 4000)    │          │   (port 3000)      │
└────────┬────────┘          └─────────┬──────────┘
         │                             │
         │  1. User clicks Login       │
         │─────────────────────────────>
         │                             │
         │  2. Redirect to /authorize  │
         │<─────────────────────────────
         │                             │
         │  3. User logs in            │
         │─────────────────────────────>
         │                             │
         │  4. Redirect with code      │
         │<─────────────────────────────
         │                             │
         │  5. Exchange code for token │
         │─────────────────────────────>
         │                             │
         │  6. Return tokens           │
         │<─────────────────────────────
         │                             │
         │  7. Access protected APIs   │
         │─────────────────────────────>
         │                             │
```

## API Endpoints (Demo Client)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Trang chủ |
| `/login` | GET | Bắt đầu OAuth2 flow |
| `/callback` | GET | OAuth2 callback |
| `/userinfo` | GET | Lấy user info |
| `/refresh` | POST | Refresh token |
| `/revoke` | POST | Revoke token |
| `/logout` | GET | Logout |
| `/register-client` | POST | Đăng ký client |
