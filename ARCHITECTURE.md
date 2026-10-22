# ARCHITECTURE.md — Happier Coffee (Website bán hàng)

> Trạng thái: **v1 — chờ Duy duyệt tại cổng G3 (AI-DLC Factory spec v1.1, phase P7)**.
> Chưa code foundation (HAP-5) cho tới khi G3 được duyệt.
> Nguồn ràng buộc: HAP-5 → HAP-20 (Linear), DESIGN.md v1 (đã duyệt G2, 2026-10-23), Vercel project `demo-happier-coffee-shop` + Neon đã tích hợp sẵn.

## 1. Stack

| Tầng | Chọn | Ghi chú |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Đã chốt ở HAP-5. Một app duy nhất cho storefront + admin + API |
| UI | Tailwind CSS + token màu/font từ DESIGN.md | Token khai báo 1 chỗ (CSS variables / theme), không hard-code màu rải rác |
| Database | Neon Postgres qua tích hợp Vercel | Đã có `DATABASE_URL` / `POSTGRES_*` cho preview + production |
| ORM / truy vấn | **Drizzle ORM** + `@neondatabase/serverless` (driver neon-http) + Drizzle Kit cho migration | [Quyết định A1] Nhẹ, SQL-first, type-safe, hợp serverless/Vercel; thay thế nhẹ hơn Prisma (không engine binary, không codegen nặng) |
| Auth | Neon Auth (Managed Better Auth) — SDK `@neondatabase/auth` bản Next.js | Đã có `NEON_AUTH_BASE_URL`. Xem mục 4 và cảnh báo env ở mục 5 |
| Icon | Lucide | Theo DESIGN.md |
| CI | GitHub Actions: lint + build trên mọi PR | Theo acceptance của HAP-5 |
| Hosting | Vercel: `main` → Production, PR → Preview | Hobby chỉ cho demo/MVP; dùng thương mại phải qua cổng G6 nâng Pro (khách trả) |

Không làm ở v1: cổng thanh toán tự động VNPay/MoMo (cần hợp đồng merchant), đa ngôn ngữ, blog, app mobile, bảng giỏ hàng trên DB, UI quản lý phân quyền.

## 2. Cấu trúc thư mục

```text
/
├─ DESIGN.md / ARCHITECTURE.md / README.md
├─ .env.example            # chỉ tên biến, không secret thật
├─ drizzle/                # migration SQL do Drizzle Kit sinh, commit vào repo
├─ drizzle.config.ts
├─ public/                 # ảnh tĩnh của quán (hero, placeholder)
└─ src/
   ├─ app/
   │  ├─ (storefront)/     # trang chủ, menu, products/[slug], cart, checkout, about/contact
   │  ├─ auth/             # sign-in / sign-up (Neon Auth UI hoặc form gọi SDK)
   │  ├─ account/          # hồ sơ + lịch sử đơn — bắt buộc đăng nhập
   │  ├─ admin/            # layout có guard riêng; products/, orders/
   │  └─ api/
   │     ├─ auth/[...path]/route.ts   # handler của Neon Auth
   │     └─ health/route.ts           # health-check đọc DB (HAP-5)
   ├─ components/          # ui/ (Button, Input, Badge), layout/ (Header, Footer), product/, cart/, admin/
   ├─ lib/
   │  ├─ auth/             # server.ts (createNeonAuth), client.ts, admin.ts (kiểm tra ADMIN_EMAILS)
   │  ├─ db/               # index.ts (kết nối Drizzle), schema.ts
   │  ├─ cart/             # store giỏ hàng phía client
   │  ├─ orders/           # tạo đơn, mã đơn, chuyển trạng thái, tính tiền
   │  └─ config.ts         # thông tin quán + thông tin nhận VietQR (đọc từ env)
   └─ server-actions/      # mutation qua Server Actions: checkout, admin CRUD sản phẩm/đơn
```

Nguyên tắc: mutation (đặt hàng, sửa sản phẩm, đổi trạng thái đơn) đi qua **Server Actions** có kiểm tra quyền ở server; Route Handler chỉ dành cho auth + health-check. Không gọi DB từ client component.

## 3. Schema database (Neon Postgres, schema `public`)

Giá tiền luôn là **số nguyên VNĐ** (`integer`), không dùng số thập phân.

### categories
`id uuid PK`, `name text`, `slug text unique`, `sort_order integer`, `created_at timestamptz`, `updated_at timestamptz`

### products
`id uuid PK`, `category_id uuid FK → categories (on delete restrict)`, `name text`, `slug text unique`, `description text`, `price_vnd integer`, `image_url text`, `is_available boolean default true`, `is_featured boolean default false`, `sort_order integer`, `created_at`, `updated_at`
Index: `slug`, `category_id`, `is_featured`

### orders
`id uuid PK`, `code text unique` (mã đơn hiển thị, vd `HC-20261023-0001`), `user_id uuid null` (id user Neon Auth khi khách đăng nhập; **không đặt FK sang schema auth** — tham chiếu lỏng, khách vãng lai để null), `customer_name text`, `customer_phone text`, `customer_address text`, `note text null`, `subtotal_vnd integer`, `total_vnd integer` (v1: phí giao hàng = 0, `total = subtotal`), `payment_method text` (`vietqr` | `cod`), `payment_status text` (`unpaid` | `paid`), `status text` (`pending_confirmation` | `preparing` | `delivering` | `delivered` | `cancelled` — khớp badge ở DESIGN.md), `created_at`, `updated_at`
Index: `user_id + created_at desc`, `status`, `code`

### order_items
`id uuid PK`, `order_id uuid FK → orders (on delete cascade)`, `product_id uuid null FK → products (on delete set null)`, `product_name text` (snapshot lúc đặt), `unit_price_vnd integer` (snapshot), `quantity integer`, `line_total_vnd integer`

Quy tắc dữ liệu:
- Seed (HAP-7): tối thiểu 3 categories, 12 products mẫu (giá VNĐ, ảnh placeholder Unsplash).
- Migration chạy bằng Drizzle Kit, file migration commit vào `drizzle/`; chạy migration lên Neon branch preview trước, production sau khi merge (ghi rõ lệnh trong README).
- Không sửa trực tiếp schema trên Neon Console sau khi đã có migration.

## 4. Auth & phân quyền

Luồng khách:
1. Khách vãng lai vẫn xem menu, bỏ giỏ và đặt hàng được (đơn có `user_id = null`).
2. Đăng ký / đăng nhập / đăng xuất bằng Neon Auth tại `/auth/*`; handler ở `/api/auth/[...path]`.
3. Route `/account/*`: chưa đăng nhập → redirect về trang đăng nhập, login xong quay lại đúng trang đích (HAP-13).
4. Khi khách đã đăng nhập đặt hàng, đơn gắn `user_id`; lịch sử đơn chỉ truy vấn đơn của đúng `user_id` đó, kiểm tra ở server.

Luồng admin — [Quyết định A3]:
1. Route `/admin/*` có 2 lớp chặn ở server (layout guard + kiểm tra lại trong từng Server Action): đã đăng nhập **và** email nằm trong biến env `ADMIN_EMAILS`.
2. User thường / khách vãng lai → redirect hoặc 403 (HAP-15).
3. Chỉ định admin đầu tiên = thêm email vào `ADMIN_EMAILS` trên Vercel (preview + production) rồi redeploy; cách làm ghi trong README. V1 không có bảng roles và không có UI phân quyền — thêm sau nếu cần nhiều cấp quyền.

Bảo mật: mọi kiểm tra quyền thực hiện ở server, không tin trạng thái đăng nhập ở client; secret không bao giờ xuống client (chỉ biến `NEXT_PUBLIC_*` mới được lộ).

## 5. Env & secrets

| Biến | Trạng thái | Dùng cho |
|---|---|---|
| `DATABASE_URL` (+ `POSTGRES_*`) | Đã có trên Vercel (preview + production) | Drizzle kết nối Neon. Migration ưu tiên connection string trực tiếp (direct/pooled theo tài liệu Drizzle Kit) |
| `NEON_AUTH_BASE_URL` | Đã có | Neon Auth server SDK |
| `NEON_AUTH_COOKIE_SECRET` | **[A4] MỚI — bắt buộc** với `@neondatabase/auth` v0.2 (Managed Better Auth): ký cookie phiên đăng nhập | Cần sinh ngẫu nhiên an toàn (≥32 ký tự) và thêm vào Vercel preview + production ở bước HAP-5/HAP-13. Không commit, không để trong chat/repo |
| `ADMIN_EMAILS` | Mới | Danh sách email admin, phân cách bằng dấu phẩy (mục 4) |
| `NEXT_PUBLIC_BANK_*` (mã ngân hàng, số tài khoản, tên chủ TK) | Mới, điền sau | Sinh ảnh VietQR kèm mã đơn + số tiền ở trang checkout. Là thông tin nhận tiền công khai nên được phép ở client; demo dùng placeholder cho tới khi quán cung cấp số tài khoản thật |
| `VITE_NEON_AUTH_URL` | Đã có sẵn nhưng **không dùng** | Đây là biến của template Vite; app Next.js dùng SDK server ở trên, bỏ qua biến này |

`.env.example` liệt kê đủ tên biến, không chứa giá trị thật (acceptance HAP-5).

## 6. Giỏ hàng & đặt hàng — [Quyết định A2]

- Giỏ hàng v1 chỉ ở **client** (React context + `localStorage`, khóa theo trình duyệt): thêm / sửa số lượng / xóa, không có bảng cart trên DB, không đồng bộ đa thiết bị.
- Checkout: Server Action nhận giỏ → kiểm tra lại giá và `is_available` từ DB (không tin giá từ client) → tạo `orders` + `order_items` trong 1 transaction → sinh `code` → xóa giỏ ở client.
- Thanh toán: `vietqr` → hiện mã QR (số tiền + nội dung chuyển khoản = mã đơn), `payment_status = unpaid`, admin xác nhận tay khi tiền về rồi chuyển `paid`; `cod` → thu khi giao. Không tích hợp cổng tự động ở v1.

## 7. Deploy & CI

1. PR → GitHub Actions (lint + build) + Vercel Preview tự động; gate G4 sẽ duyệt trên bản Preview.
2. Merge vào `main` → Vercel Production.
3. Thay đổi schema: PR kèm file migration; chạy migration lên branch Neon của preview để kiểm chứng, merge xong chạy lên production (bước thủ công có checklist trong README của HAP-7).
4. Domain: v1 dùng subdomain `*.vercel.app` của project; gắn domain riêng là việc sau, ngoài scope v1.

## 8. Các quyết định cần Duy chốt tại G3

- **A1** ORM = Drizzle (nhẹ, SQL-first) thay vì Prisma.
- **A2** Giỏ hàng localStorage phía client, không lưu DB ở v1.
- **A3** Admin bằng allowlist `ADMIN_EMAILS`, không bảng roles / UI phân quyền ở v1.
- **A4** Thêm env mới `NEON_AUTH_COOKIE_SECRET` (bắt buộc của Neon Auth SDK hiện tại) + `ADMIN_EMAILS` + `NEXT_PUBLIC_BANK_*`.

## 9. Changelog kiến trúc
- v1 (2026-10-23): bản đầu theo AI-DLC Factory spec v1.1 phase P7 — chờ Duy duyệt tại cổng G3.
