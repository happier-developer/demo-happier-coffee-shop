// Kiểm thử logic của HAP-14 (lịch sử đơn hàng) — không chạm DB thật:
// 1. Map badge trạng thái đơn/thanh toán khớp DESIGN.md mục 5.
// 2. SQL do Drizzle sinh cho truy vấn lịch sử LUÔN scope theo user_id
//    (mẫu truy vấn tương đương history.ts, dựng trên schema thật) —
//    kèm kiểm tra tĩnh rằng history.ts thật dùng đúng điều kiện đó.
// 3. Định dạng ngày giờ + tiền dùng ở trang tài khoản.
// Chạy: node scripts/test-hap14-logic.ts (Node 24 native type-stripping).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema.ts";
import { orders } from "../src/lib/db/schema.ts";
import { formatDateTimeVi, formatVnd } from "../src/lib/format.ts";
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_META,
} from "../src/lib/orders/status.ts";

// --- 1. Badge meta khớp DESIGN.md ---
assert.deepEqual(
  Object.keys(ORDER_STATUS_META).sort(),
  [
    "cancelled",
    "delivered",
    "delivering",
    "pending_confirmation",
    "preparing",
  ],
);
assert.equal(ORDER_STATUS_META.pending_confirmation.label, "Chờ xác nhận");
assert.equal(ORDER_STATUS_META.pending_confirmation.dotClass, "bg-warning");
assert.equal(ORDER_STATUS_META.preparing.label, "Đang chuẩn bị");
assert.equal(ORDER_STATUS_META.preparing.dotClass, "bg-caramel");
assert.equal(ORDER_STATUS_META.delivering.label, "Đang giao");
assert.equal(ORDER_STATUS_META.delivering.dotClass, "bg-coffee");
assert.equal(ORDER_STATUS_META.delivered.label, "Đã giao");
assert.equal(ORDER_STATUS_META.delivered.dotClass, "bg-success");
assert.equal(ORDER_STATUS_META.cancelled.label, "Đã hủy");
assert.equal(ORDER_STATUS_META.cancelled.dotClass, "bg-error");
assert.equal(PAYMENT_STATUS_META.unpaid.label, "Chưa thanh toán");
assert.equal(PAYMENT_STATUS_META.paid.label, "Đã thanh toán");
assert.equal(PAYMENT_METHOD_LABELS.vietqr, "Chuyển khoản VietQR");
assert.equal(PAYMENT_METHOD_LABELS.cod, "Tiền mặt khi nhận hàng (COD)");
console.log("✓ badge meta (DESIGN.md mục 5)");

// --- 2. Scope truy vấn theo user ---
const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const fakeDb = drizzle(neon("postgres://u:p@localhost:5432/db"), { schema });

// Mẫu tương đương listOrdersForUser trong history.ts:
const listSql = fakeDb
  .select()
  .from(orders)
  .where(eq(orders.userId, USER_A))
  .orderBy(desc(orders.createdAt))
  .limit(20)
  .toSQL();
assert.match(listSql.sql, /from "orders" where "orders"\."user_id" = \$1/);
assert.deepEqual(listSql.params, [USER_A, 20]);
assert.match(listSql.sql, /order by "orders"\."created_at" desc/);

// Mẫu tương đương getOrderDetailForUser trong history.ts:
const detailSql = fakeDb
  .select()
  .from(orders)
  .where(
    and(eq(orders.code, "HC-20261023-0001"), eq(orders.userId, USER_A)),
  )
  .limit(1)
  .toSQL();
assert.match(
  detailSql.sql,
  /where \("orders"\."code" = \$1 and "orders"\."user_id" = \$2\)/,
);
assert.deepEqual(detailSql.params, ["HC-20261023-0001", USER_A, 1]);

// Kiểm tra tĩnh: history.ts thật dùng đúng các điều kiện scope trên và
// không có truy vấn orders nào thiếu user_id.
const historySource = readFileSync(
  new URL("../src/lib/orders/history.ts", import.meta.url),
  "utf8",
);
assert.match(historySource, /eq\(orders\.userId, userId\)/);
assert.match(
  historySource,
  /and\(eq\(orders\.code, code\), eq\(orders\.userId, userId\)\)/,
);
assert.equal(
  (historySource.match(/\.from\(orders\)/g) ?? []).length,
  2,
  "history.ts chỉ được có đúng 2 truy vấn lên bảng orders (list + detail)",
);
console.log("✓ scope truy vấn theo user_id (SQL + mã nguồn)");

// --- 3. Định dạng hiển thị ---
assert.equal(formatVnd(84000), "84.000₫");
assert.match(
  formatDateTimeVi(new Date("2026-10-23T03:30:00.000Z")),
  /^23\/10\/2026/,
);
console.log("✓ formatVnd + formatDateTimeVi");

console.log("HAP-14 logic: TẤT CẢ PASS");
