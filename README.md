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

## Tài khoản & Neon Auth (HAP-13)

Đăng ký / đăng nhập / đăng xuất dùng **Neon Auth** (Managed Better Auth) qua
SDK `@neondatabase/auth` **0.7.0-beta** (pin exact — SDK còn beta, xem
ARCHITECTURE.md mục 1.1; không tự nâng bản).

### Route

| Route | Vai trò |
|---|---|
| `/auth/dang-nhap` | Trang đăng nhập (tham số `next` = đích quay lại sau login, chỉ chấp nhận đường dẫn nội bộ; `registered=1` = vừa đăng ký xong) |
| `/auth/dang-ky` | Trang đăng ký (họ tên + email + mật khẩu tối thiểu 8 ký tự) |
| `/account` | Trang tài khoản — guard ở server: chưa đăng nhập → redirect `/auth/dang-nhap?next=/account` |
| `/api/auth/[...path]` | Handler của SDK (`auth.handler()`): proxy mọi request auth lên Neon Auth và quản lý cookie phiên |

### Cách hoạt động

- Server: một instance `createNeonAuth()` duy nhất trong
  `src/lib/auth/server.ts` (khởi tạo lazy giống DB client), export qua
  `getAuth()`; helper `getCurrentUser()` trả user của phiên hiện tại hoặc
  `null` (không bao giờ throw — luồng khách vãng lai không bị auth làm hỏng).
- Form đăng nhập/đăng ký gọi Server Actions (`src/server-actions/auth.ts`)
  → method server của SDK (`signIn.email` / `signUp.email`) ghi cookie phiên
  ở server; client sau đó tải lại toàn trang về `next` để Header cập nhật
  đúng trạng thái phiên.
- Đăng ký: nếu Neon Auth cấu hình cho tạo phiên ngay thì khách vào thẳng
  `next`; nếu project yêu cầu xác thực email thì chưa có phiên — app chuyển
  khách sang trang đăng nhập kèm thông báo.
- Header đọc phiên bằng client SDK (`createAuthClient()` trong
  `src/lib/auth/client.ts`, hook `useSession`) chỉ để hiển thị — mọi kiểm
  tra quyền thật đều ở server.
- Đặt hàng: Server Action checkout tự đọc phiên ở server và gắn
  `orders.user_id` khi khách đã đăng nhập; **không** nhận userId từ client.
  Khách vãng lai vẫn đặt hàng bình thường (`user_id = null`).

### Env bắt buộc

- `NEON_AUTH_BASE_URL` — base URL của Neon Auth (đã có trên Vercel).
- `NEON_AUTH_COOKIE_SECRET` — secret ký cookie phiên, tối thiểu 32 ký tự
  (sinh bằng `openssl rand -base64 32`). Chỉ đặt trên Vercel / `.env.local`,
  **không** commit, không để trong chat/repo.

## Phân quyền Admin (kế hoạch — HAP-15)

Khu `/admin` sẽ dùng allowlist `ADMIN_EMAILS` (email cách nhau bằng dấu
phẩy) kiểm tra ở server — xem ARCHITECTURE.md mục 4.
