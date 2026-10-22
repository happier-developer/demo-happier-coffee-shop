# Happier Coffee Shop

Website cho cua hang ca phe Happier.

Du an demo theo quy trinh AI-DLC Factory (Linear -> GitHub -> Vercel). Thiet ke nam trong DESIGN.md tai repo nay, kien truc nam trong ARCHITECTURE.md.

## Chạy local

Yêu cầu:

- Node.js 24 (xem `.nvmrc` — nên dùng `nvm use` để đúng bản v24.22.1)
- npm 12.2.1 (khai báo ở field `packageManager` trong `package.json`)

Các bước:

```bash
# 1. Cài dependencies đúng theo package-lock.json
npm ci

# 2. Tạo file env local từ bản mẫu rồi điền giá trị thật (DATABASE_URL...)
cp .env.example .env.local

# 3. Chạy môi trường phát triển
npm run dev
```

Mở http://localhost:3000 — trang chủ hiển thị tên quán và link kiểm tra trạng thái.

### Health-check

`GET /api/health` kiểm tra app và kết nối Neon Postgres:

- `200 {"status":"ok","db":"up"}` — đọc được database.
- `503 {"status":"error",...}` — thiếu `DATABASE_URL` hoặc không kết nối được DB.

### Lệnh thường dùng

```bash
npm run lint        # ESLint
npm run build       # Build production
npm run start       # Chạy bản build
npm run db:generate # Sinh migration từ schema Drizzle (src/lib/db/schema.ts)
npm run db:migrate  # Chạy migration lên database trong DATABASE_URL
npm run db:studio   # Mở Drizzle Studio xem dữ liệu
```

Schema database sẽ được định nghĩa ở HAP-7 trong `src/lib/db/schema.ts`; file migration sinh ra nằm trong thư mục `drizzle/` và được commit vào repo.
