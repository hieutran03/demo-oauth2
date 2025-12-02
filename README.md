# Demo OAuth2 Server

Đây là project demo OAuth2 Server được xây dựng bằng Node.js, Express, TypeScript và PostgreSQL.

## 📁 Cấu trúc Project

```
demo_oauth/
├── oauth2-server/    # OAuth2 Authorization Server
├── client/           # Demo Client Application
```

## 🛠️ Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- Docker & Docker Compose (nếu chạy với Docker)
- PostgreSQL (nếu chạy không dùng Docker)

---

## 🚀 Cách chạy Demo

### Cách 1: Sử dụng Docker (Khuyến nghị)

#### Bước 1: Tạo file `.env` trong thư mục `oauth2-server`

```bash
cd oauth2-server
```

Tạo file `.env` với nội dung:

```env
NODE_ENV=dev

# App config
DEV_APP_KEY=your-secret-key
DEV_PORT=3000

# Database config
DEV_DB_HOST=db
DEV_DB_PORT=5432
DEV_DB_USER=postgres
DEV_DB_PASSWORD=postgres123
DEV_DB_DATABASE=oauth2_db

# Token config
TOKEN_TIMEOUT=3600
TOKEN_TIMEOUT_REDIS=3600
```

#### Bước 2: Chạy Docker Compose

```bash
docker-compose up -d
```

OAuth2 Server sẽ chạy tại: `http://localhost:3000`

---

### Cách 2: Chạy thủ công (Không dùng Docker)

#### Bước 1: Cài đặt PostgreSQL

Đảm bảo PostgreSQL đang chạy và tạo database:

```sql
CREATE DATABASE oauth2_db;
```

#### Bước 2: Cấu hình OAuth2 Server

```bash
cd oauth2-server
```

Tạo file `.env`:

```env
NODE_ENV=dev

# App config
DEV_APP_KEY=your-secret-key
DEV_PORT=3000

# Database config
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_USER=postgres
DEV_DB_PASSWORD=your-password
DEV_DB_DATABASE=oauth2_db

# Token config
TOKEN_TIMEOUT=3600
TOKEN_TIMEOUT_REDIS=3600
```

Cài đặt dependencies và chạy:

```bash
npm install
npm run dev
```

OAuth2 Server sẽ chạy tại: `http://localhost:3000`

#### Bước 3: Cấu hình Client

Mở terminal mới:

```bash
cd client
```

Tạo file `.env`:

```env
CLIENT_ID=demo-client
CLIENT_SECRET=demo-client-secret
CALLBACK_URL=http://localhost:4000/callback
OAUTH_SERVER_URL=http://localhost:3000
PORT=4000
```

Cài đặt dependencies và chạy:

```bash
npm install
npm run dev
```

Client sẽ chạy tại: `http://localhost:4000`

---

## 🔑 Luồng OAuth2 Demo

### 1. Đăng ký tài khoản

Gửi request đăng ký user mới:

```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fullName=Nguyen Van A&username=user001&password=T@123456&confirmPassword=T@123456"
```

### 2. Đăng ký OAuth Client

```bash
curl -X POST http://localhost:3000/api/v1/oauth/clients \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "demo-client",
    "clientSecret": "demo-client-secret",
    "redirectUris": ["http://localhost:4000/callback"],
    "grants": ["authorization_code", "refresh_token"]
  }'
```

### 3. Test OAuth2 Flow

1. Truy cập Client App: `http://localhost:4000`
2. Click "Login with OAuth2"
3. Bạn sẽ được redirect đến trang đăng nhập của OAuth2 Server
4. Đăng nhập với tài khoản đã tạo
5. Sau khi authorize, bạn sẽ được redirect về Client với access token

---

## 📚 API Documentation

Xem chi tiết API tại: [`oauth2-server/API_DOCUMENTATION.md`](./oauth2-server/API_DOCUMENTATION.md)

### Swagger UI

Truy cập Swagger UI tại: `http://localhost:3000/api-docs`

---

## 🔧 Scripts

### OAuth2 Server

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development mode với hot reload |
| `npm run build` | Build TypeScript sang JavaScript |
| `npm start` | Chạy production mode |

### Client

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development mode với hot reload |
| `npm run build` | Build TypeScript sang JavaScript |
| `npm start` | Chạy production mode |

---

## 📝 Ghi chú

- OAuth2 Server chạy mặc định tại port `3000`
- Client chạy mặc định tại port `4000`
- Đảm bảo cả hai server đều đang chạy để test OAuth2 flow

---

## 🐛 Troubleshooting

### Lỗi kết nối Database

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra thông tin kết nối trong file `.env`
- Nếu dùng Docker, đảm bảo container `demo_postgres` đang chạy

### Lỗi CORS

- Đảm bảo `CALLBACK_URL` trong Client khớp với `redirectUris` đã đăng ký

### Port đã được sử dụng

- Thay đổi port trong file `.env` nếu port mặc định đã được sử dụng
