// Kiểm thử logic của HAP-17 (admin quản lý đơn hàng) — không chạm DB:
// 1. Máy trạng thái: duyệt TOÀN BỘ 5×5 cặp chuyển — chỉ đúng tập hợp
//    lệ mới được phép (tiến 1 bước trong vòng đời, hoặc hủy khi chưa
//    cuối); nhảy cóc/đi ngược/tự chuyển/đi ra khỏi trạng thái cuối đều
//    bị từ chối kèm thông điệp.
// 2. Trạng thái cuối (delivered/cancelled) khóa cứng.
// 3. decidePaymentConfirmation: chỉ unpaid + chưa hủy mới xác nhận
//    được; đã paid → từ chối; đã hủy → từ chối.
// 4. isOrderStatus: nhận đúng 5 giá trị, loại chuỗi lạ.
// 5. Kiểm tra tĩnh: Server Action gọi requireAdmin + chốt bằng 2 hàm
//    decide + revalidate đủ 4 đường (admin danh sách/chi tiết, khách
//    danh sách/chi tiết); trang danh sách lọc ở server qua query param;
//    sidebar + card Tổng quan đã trỏ link thật /admin/don-hang.
// Chạy: node scripts/test-hap17-orders.ts (Node 24 native type-stripping).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { OrderStatus } from "../src/lib/db/schema.ts";
import {
  ORDER_TRANSITIONS,
  allowedNextStatuses,
  canOrderTransition,
  decideOrderTransition,
  decidePaymentConfirmation,
  isOrderStatus,
  isTerminalOrderStatus,
} from "../src/lib/orders/transitions.ts";

const ALL_STATUSES: OrderStatus[] = [
  "pending_confirmation",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
];

// --- 1. Toàn bộ cặp chuyển 5×5 ---
const EXPECTED: Record<OrderStatus, OrderStatus[]> = {
  pending_confirmation: ["preparing", "cancelled"],
  preparing: ["delivering", "cancelled"],
  delivering: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

for (const from of ALL_STATUSES) {
  assert.deepEqual(
    [...allowedNextStatuses(from)].sort(),
    [...EXPECTED[from]].sort(),
    `allowedNextStatuses(${from}) phải khớp bảng kỳ vọng`,
  );
  assert.deepEqual(
    [...ORDER_TRANSITIONS[from]].sort(),
    [...EXPECTED[from]].sort(),
    `ORDER_TRANSITIONS[${from}] phải khớp bảng kỳ vọng`,
  );
  for (const to of ALL_STATUSES) {
    const expectedAllowed = EXPECTED[from].includes(to);
    assert.equal(
      canOrderTransition(from, to),
      expectedAllowed,
      `canOrderTransition(${from} -> ${to})`,
    );
    const decision = decideOrderTransition(from, to);
    assert.equal(
      decision.allowed,
      expectedAllowed,
      `decideOrderTransition(${from} -> ${to})`,
    );
    if (!decision.allowed) {
      assert.ok(
        decision.message.length > 0,
        "Chuyển bị từ chối phải có thông điệp cho admin",
      );
    }
  }
}

// --- 2. Trạng thái cuối khóa cứng ---
assert.equal(isTerminalOrderStatus("delivered"), true);
assert.equal(isTerminalOrderStatus("cancelled"), true);
assert.equal(isTerminalOrderStatus("pending_confirmation"), false);
assert.equal(isTerminalOrderStatus("preparing"), false);
assert.equal(isTerminalOrderStatus("delivering"), false);
// Tự chuyển về chính nó không bao giờ hợp lệ.
for (const status of ALL_STATUSES) {
  assert.equal(canOrderTransition(status, status), false);
}

// --- 3. decidePaymentConfirmation ---
assert.deepEqual(
  decidePaymentConfirmation({
    status: "pending_confirmation",
    paymentStatus: "unpaid",
  }),
  { allowed: true },
);
assert.deepEqual(
  decidePaymentConfirmation({ status: "delivered", paymentStatus: "unpaid" }),
  { allowed: true },
  "Đơn COD đã giao mà chưa ghi thu tiền vẫn xác nhận thanh toán được",
);
const paidDecision = decidePaymentConfirmation({
  status: "preparing",
  paymentStatus: "paid",
});
assert.equal(paidDecision.allowed, false);
if (!paidDecision.allowed) assert.match(paidDecision.message, /đã được xác nhận/);
const cancelledDecision = decidePaymentConfirmation({
  status: "cancelled",
  paymentStatus: "unpaid",
});
assert.equal(cancelledDecision.allowed, false);
if (!cancelledDecision.allowed) {
  assert.match(cancelledDecision.message, /đã hủy/);
}

// --- 4. isOrderStatus ---
for (const status of ALL_STATUSES) {
  assert.equal(isOrderStatus(status), true);
}
assert.equal(isOrderStatus("bogus"), false);
assert.equal(isOrderStatus(""), false);
assert.equal(isOrderStatus(undefined), false);
assert.equal(isOrderStatus(null), false);
assert.equal(isOrderStatus("PENDING_CONFIRMATION"), false);

// --- 5. Kiểm tra tĩnh wiring ---
const actionsSrc = readFileSync(
  new URL("../src/server-actions/admin-orders.ts", import.meta.url),
  "utf8",
);
assert.match(actionsSrc, /requireAdmin\(/, "Action phải gọi requireAdmin");
assert.match(
  actionsSrc,
  /decideOrderTransition\(/,
  "Action phải chốt chuyển trạng thái bằng decideOrderTransition",
);
assert.match(
  actionsSrc,
  /decidePaymentConfirmation\(/,
  "Action phải chốt xác nhận thanh toán bằng decidePaymentConfirmation",
);
assert.match(actionsSrc, /revalidatePath\(ADMIN_LIST_PATH\)/);
assert.match(actionsSrc, /revalidatePath\(`\$\{ADMIN_LIST_PATH\}\/\$\{code\}`\)/);
assert.match(actionsSrc, /revalidatePath\("\/account"\)/);
assert.match(actionsSrc, /revalidatePath\(`\/account\/don-hang\/\$\{code\}`\)/);

const listPageSrc = readFileSync(
  new URL("../src/app/admin/don-hang/page.tsx", import.meta.url),
  "utf8",
);
assert.match(listPageSrc, /searchParams/, "Trang danh sách phải đọc query param");
assert.match(listPageSrc, /trang-thai/, "Bộ lọc dùng param ?trang-thai=");
assert.match(
  listPageSrc,
  /listOrdersForAdmin\(/,
  "Danh sách phải truy vấn qua tầng dữ liệu admin (lọc ở server)",
);

const layoutSrc = readFileSync(
  new URL("../src/app/admin/layout.tsx", import.meta.url),
  "utf8",
);
assert.match(layoutSrc, /href: "\/admin\/don-hang"/);
assert.ok(
  !layoutSrc.includes('note: "HAP-17"'),
  "Sidebar không còn nhãn 'Sắp có · HAP-17' cho Đơn hàng",
);

const dashboardSrc = readFileSync(
  new URL("../src/app/admin/page.tsx", import.meta.url),
  "utf8",
);
assert.match(dashboardSrc, /href: "\/admin\/don-hang"/);
assert.ok(
  !dashboardSrc.includes('issue: "HAP-17"'),
  "Card Đơn hàng ở Tổng quan không còn nhãn 'Sắp có · HAP-17'",
);

console.log("HAP-17 order admin logic tests: PASS");
