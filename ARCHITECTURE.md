# ARCHITECTURE.md — Happier Coffee (Website bán hàng)

> Trạng thái: **v1.1 — Duy đã duyệt tại cổng G3 ngày 2026-10-23 (AI-DLC Factory spec v1.1, phase P7)**.
> Foundation (HAP-5) bắt đầu code theo đúng bản kiến trúc này.
> Nguồn ràng buộc: HAP-5 → HAP-20 (Linear), DESIGN.md v1 (đã duyệt G2, 2026-10-23), Vercel project `demo-happier-coffee-shop` + Neon đã tích hợp sẵn.
> Version dưới đây đã kiểm chứng trực tiếp trên npm registry ngày 2026-10-23 (dist-tag `latest`, trừ các ngoại lệ ghi rõ lý do).

## 1. Stack — đã pin version

| Tầng | Package / nền tảng | Version pin | Ghi chú |
|---|---|---|---|
| Runtime | Node.js (LTS “Krypton”) | **24.22.1** — `.nvmrc` ghi `v24.22.1`, `engines.node = "24.x"`, Vercel Project Settings chọn Node 24.x | Bản vá bảo mật mới nhất của nhánh 24 (phát hành 21/10/2026), hỗ trợ tới 30/04/2028. Không pin Node 26: tới 28/10/2026 mới vào LTS |
| Package manager | npm | **12.2.1** — khai báo ở field `packageManager` trong `package.json` | CI và local dùng đúng bản này |
| Framework | `next` (App Router) | **16.4.2** | Đã chốt ở HAP-5. Một app duy nhất cho storefront + admin + API. `eslint-config-next` pin cùng số **16.4.2** |
| UI library | `react` / `react-dom` | **19.3.1** / **19.3.1** | Đi cặp với Next 16.4 (peer yêu cầu React ^19). `@types/react` / `@types/react-dom` pin **19.3.0** (bản types mới nhất trên registry) |
| Ngôn ngữ | `typescript` (dev) | **5.9.3** | [Quyết định A5] Xem mục 1.1 — cố ý KHÔNG lấy bản latest 7.0.2 |
| Types runtime | `@types/node` (dev) | **24.19.2** | Khớp nhánh Node 24 |
| CSS | `tailwindcss` + `@tailwindcss/postcss` | **4.3.3** / **4.3.3** | Tailwind v4 là CSS-first: token DESIGN.md khai báo bằng `@theme` trong file CSS + `@import "tailwindcss"`, **không có `tailwind.config.js`**; không cần thêm `autoprefixer`/`postcss` rời (plugin PostCSS của Tailwind đã gồm) |
| Database | Neon Postgres qua tích hợp Vercel | — (Neon quản lý version Postgres theo project, app không pin) | Đã có `DATABASE_URL` / `POSTGRES_*` cho preview + production |
| ORM / truy vấn | `drizzle-orm` | **0.45.4** | [Quyết định A1] Nhẹ, SQL-first, type-safe, hợp serverless/Vercel; nhẹ hơn Prisma (không engine binary, không codegen nặng) |
| DB driver | `@neondatabase/serverless` | **1.2.0** | Driver neon-http cho Drizzle, hợp môi trường serverless của Vercel |
| Migration | `drizzle-kit` (dev) | **0.31.11** | Cặp tương thích với `drizzle-orm` 0.45.x |
| Auth | `@neondatabase/auth` (Neon Auth — Managed Better Auth, bản Next.js) | **0.7.0-beta** — pin exact tuyệt đối, không dùng `^`/`~`/`@latest` | SDK còn ở beta: API theo tài liệu migration v0.2 (`createNeonAuth()`), peer yêu cầu `next >=16` nên khớp Next 16.4.2. Đã có `NEON_AUTH_BASE_URL`; xem cảnh báo env ở mục 5 và rủi ro beta ở mục 1.1 |
| Icon | `lucide-react` | **1.61.0** | Theo DESIGN.md |
| Lint | `eslint` (dev) | **10.13.0** | Peer của `eslint-config-next@16.4.2` yêu cầu `eslint >=9` — thỏa. CI: lint + build trên mọi PR (acceptance HAP-5) |
| Hosting | Vercel: `main` → Production, PR → Preview | — (nền tảng quản lý) | Hobby chỉ cho demo/MVP; dùng thương mại phải qua cổng G6 nâng Pro (khách trả) |

### 1.1 Quy tắc pin & nâng version — [Quyết định A5]

- `package.json` ghi **version exact** cho mọi dependency (cài bằng `npm install --save-exact`), không để `^` / `~` tự nhảy bản; `package-lock.json` commit vào repo và CI cài bằng `npm ci`.
- Ngoại lệ có chủ đích — **TypeScript pin 5.9.3, không phải latest 7.0.2**: TS 7 chưa có programmatic compiler API (dự kiến ở 7.1) nên hệ tooling quanh Next/ESLint chưa hỗ trợ đầy đủ, và chính `create-next-app@16.4.2` vẫn scaffold TypeScript dòng 5. Nâng TS chỉ khi 7.1 ổn định API và kiểm chứng lại với Next + ESLint.
- **Auth SDK đang beta (0.7.0-beta)**: khóa cứng version, khi code HAP-13 phải test sớm đủ luồng đăng ký / đăng nhập / quên mật khẩu trên Preview trước khi làm tiếp tính năng phụ thuộc auth; có lỗi của SDK thì ghi lại, không tự nhảy bản beta khác giữa chừng.
- Nâng version bất kỳ package nào = **PR riêng**, ghi lý do + đọc changelog của bản đích, CI xanh mới merge; không nâng version tiện tay trong PR tính năng.
- Chỉ pin version ở tầng app kiểm soát được; version Postgres do Neon quản lý, runtime patch của Vercel bám theo nhánh Node đã pin ở trên.

Không làm ở v1: cổng thanh toán tự động VNPay/MoMo (cần hợp đồng merchant), đa ngôn ngữ, blog, app mobile, bảng giỏ hàng trên DB, UI quản lý phân quyền.

## 2. Cấu trúc thư mục

```text
/
├─ DESIGN.md / ARCHITECTURE.md / README.md
├─ .nvmrc                  # v24.22.1 — khớp engines.node và Vercel
├─ package.json            # version exact + packageManager npm@12.2.1; kèm package-lock.json
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
- **A5** Pin version exact toàn bộ stack theo mục 1 (kiểm chứng trên npm registry 2026-10-23), gồm 2 ngoại lệ có lý do: TypeScript giữ 5.9.3 thay vì latest 7.0.2, và `@neondatabase/auth` khóa cứng ở beta 0.7.0-beta.

## 9. Changelog kiến trúc
- v1 (2026-10-23): bản đầu theo AI-DLC Factory spec v1.1 phase P7 — chờ Duy duyệt tại cổng G3.
- v1.1 (2026-10-23): pin version cho toàn bộ stack (mục 1 + quy tắc 1.1) theo yêu cầu của Duy; stack và các quyết định A1–A4 không đổi.
- v1.1 (2026-10-23): **Duy đã duyệt tại cổng G3** — toàn bộ kiến trúc gồm các quyết định A1–A5 chính thức có hiệu lực; bắt đầu code HAP-5 foundation.
