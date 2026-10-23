// Kiểm thử logic thuần của HAP-12 (checkout) — không chạm DB:
// sinh mã đơn, validate checkout, tính tiền từ giá DB, URL VietQR.
// Chạy: node scripts/test-hap12-logic.ts (Node 24 native type-stripping).

import assert from "node:assert/strict";
import { bankConfig, buildVietQrImageUrl } from "../src/lib/config.ts";
import {
  buildOrderCode,
  nextSequenceFromCodes,
  orderDateKey,
} from "../src/lib/orders/order-code.ts";
import { buildOrderLines, PricingError } from "../src/lib/orders/pricing.ts";
import {
  normalizePhone,
  validateCheckoutInput,
  type CheckoutInput,
} from "../src/lib/orders/validate.ts";

const P1 = "11111111-1111-4111-8111-111111111111";
const P2 = "22222222-2222-4222-8222-222222222222";
const P3 = "33333333-3333-4333-8333-333333333333";

// --- Mã đơn ---
// 16:59 UTC = 23:59 giờ VN cùng ngày; 17:30 UTC = 00:30 giờ VN ngày hôm sau.
assert.equal(orderDateKey(new Date("2026-10-23T16:59:00.000Z")), "20261023");
assert.equal(orderDateKey(new Date("2026-10-23T17:30:00.000Z")), "20261024");
assert.equal(buildOrderCode("20261023", 7), "HC-20261023-0007");
assert.equal(buildOrderCode("20261023", 123), "HC-20261023-0123");
assert.equal(nextSequenceFromCodes([], "20261023"), 1);
assert.equal(
  nextSequenceFromCodes(
    ["HC-20261023-0001", "HC-20261023-0009", "HC-20261022-0099"],
    "20261023",
  ),
  10,
);
console.log("✓ order-code");

// --- Validate ---
assert.equal(normalizePhone("0901 234 567"), "0901234567");
assert.equal(normalizePhone("0901.234.567"), "0901234567");

const validInput: CheckoutInput = {
  items: [
    { productId: P1, quantity: 2 },
    { productId: P1, quantity: 1 }, // dòng trùng: phải được gộp
    { productId: P2, quantity: 1 },
  ],
  customerName: "  Nguyễn Văn A  ",
  customerPhone: "0901 234 567",
  customerAddress: "123 Nguyễn Huệ, Quận 1",
  note: "   ",
  paymentMethod: "vietqr",
};
const valid = validateCheckoutInput(validInput);
assert.equal(valid.ok, true);
if (valid.ok) {
  assert.equal(valid.data.customerName, "Nguyễn Văn A");
  assert.equal(valid.data.customerPhone, "0901234567");
  assert.equal(valid.data.note, null);
  assert.deepEqual(valid.data.items, [
    { productId: P1, quantity: 3 },
    { productId: P2, quantity: 1 },
  ]);
  assert.equal(valid.data.paymentMethod, "vietqr");
}

function expectFieldError(patch: Partial<CheckoutInput>, field: string) {
  const result = validateCheckoutInput({ ...validInput, ...patch });
  assert.equal(result.ok, false, `kỳ vọng lỗi ở trường ${field}`);
  if (!result.ok) {
    assert.ok(
      result.fieldErrors[field as keyof typeof result.fieldErrors],
      `thiếu fieldErrors.${field}`,
    );
  }
}
expectFieldError({ customerPhone: "12345" }, "customerPhone");
expectFieldError({ customerPhone: "1901234567" }, "customerPhone");
expectFieldError({ customerName: "A" }, "customerName");
expectFieldError({ customerAddress: "abc" }, "customerAddress");
expectFieldError({ items: [] }, "items");
expectFieldError({ items: [{ productId: P1, quantity: 0 }] }, "items");
expectFieldError({ items: [{ productId: P1, quantity: 100 }] }, "items");
expectFieldError(
  {
    items: [
      { productId: P1, quantity: 60 },
      { productId: P1, quantity: 50 },
    ],
  },
  "items",
);
expectFieldError({ items: [{ productId: "khong-phai-uuid", quantity: 1 }] }, "items");
expectFieldError({ paymentMethod: "card" }, "paymentMethod");
console.log("✓ validate");

// --- Pricing (giá luôn từ DB) ---
const dbProducts = [
  { id: P1, name: "Cà phê sữa đá", priceVnd: 29000, isAvailable: true },
  { id: P2, name: "Cold brew", priceVnd: 49000, isAvailable: true },
  { id: P3, name: "Tiramisu", priceVnd: 55000, isAvailable: false },
];
const { lines, subtotalVnd } = buildOrderLines(dbProducts, [
  { productId: P1, quantity: 2 },
  { productId: P2, quantity: 1 },
]);
assert.equal(subtotalVnd, 107000);
assert.equal(lines[0].lineTotalVnd, 58000);
assert.equal(lines[0].unitPriceVnd, 29000);
assert.throws(
  () => buildOrderLines(dbProducts, [{ productId: P3, quantity: 1 }]),
  (error: unknown) =>
    error instanceof PricingError && error.message.includes("Tiramisu"),
);
assert.throws(
  () =>
    buildOrderLines(dbProducts, [
      { productId: "99999999-9999-4999-8999-999999999999", quantity: 1 },
    ]),
  PricingError,
);
console.log("✓ pricing");

// --- VietQR ---
const qrUrl = buildVietQrImageUrl("HC-20261023-0007", 107000);
assert.ok(qrUrl.startsWith("https://img.vietqr.io/image/"));
assert.ok(qrUrl.includes("-compact2.png?"));
assert.ok(qrUrl.includes("amount=107000"));
assert.ok(qrUrl.includes("addInfo=HC-20261023-0007"));
console.log(
  `✓ vietqr (placeholder=${bankConfig.isPlaceholder}, bank=${bankConfig.bankName})`,
);

console.log("Tất cả kiểm thử logic HAP-12 đều PASS.");
