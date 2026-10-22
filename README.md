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
npm run db:seed     # Nạp dữ liệu mẫu (3 nhóm món, 14 sản phẩm)
npm run db:studio   # Mở Drizzle Studio xem dữ liệu
```

## Database (Neon Postgres + Drizzle)

Schema định nghĩa trong `src/lib/db/schema.ts` (chuẩn: ARCHITECTURE.md mục 3),
gồm 4 bảng: `categories`, `products`, `orders`, `order_items`.
File migration sinh ra nằm trong thư mục `drizzle/` và được commit vào repo —
**không sửa tay file migration đã sinh, không sửa schema trực tiếp trên Neon Console**.

### Quy trình khi thay đổi schema

```bash
# 1. Sửa src/lib/db/schema.ts rồi sinh migration
npm run db:generate

# 2. Áp migration lên Neon branch PREVIEW trước để kiểm chứng
#    (đặt DATABASE_URL = connection string của target preview trong .env.local)
npm run db:migrate
npm run db:seed        # nạp dữ liệu mẫu nếu cần kiểm chứng
#    -> kiểm chứng: số categories >= 3, products >= 12, app Preview chạy đúng.

# 3. Mở PR kèm file migration trong drizzle/, chờ CI (lint + build) xanh rồi merge.

# 4. SAU KHI MERGE mới áp lên PRODUCTION
#    (đổi DATABASE_URL sang connection string production rồi chạy lại)
npm run db:migrate
npm run db:seed
```

### Seed

`npm run db:seed` chạy `src/lib/db/seed.ts` bằng Node 24 (native type-stripping,
không cần thêm công cụ). Seed **idempotent theo slug**: chạy lại không nhân đôi
dữ liệu (upsert theo `slug` của categories/products). Vì lý do an toàn, seed sẽ
**dừng và không ghi gì** nếu bảng `orders` đã có đơn hàng thật.
