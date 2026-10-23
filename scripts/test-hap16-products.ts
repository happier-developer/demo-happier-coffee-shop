// Kiểm thử logic của HAP-16 (admin quản lý sản phẩm) — không chạm DB:
// 1. slugifyVietnamese: bỏ dấu tiếng Việt đúng chuẩn (kể cả đ/Đ, ơ/ư,
//    dấu tổ hợp), gộp khoảng trắng/ký tự lạ, tên rỗng → "san-pham".
// 2. uniqueSlug: trống thì giữ nguyên, trùng thì thêm -2, -3...
// 3. validateProductInput: chuẩn hoá dữ liệu hợp lệ (trim tên, parse
//    giá chuỗi → số nguyên, mô tả/ảnh rỗng → null) và bắt đúng từng lỗi:
//    tên rỗng/quá dài, giá âm/thập phân/không phải số/quá trần, nhóm
//    không phải UUID, mô tả quá dài, ảnh không phải https/đường dẫn.
// 4. decideProductDeletion: đã có trong order_items → chặn + thông điệp
//    hướng dẫn dùng "Hết hàng"; chưa có → cho xoá.
// 5. Kiểm tra tĩnh: mọi Server Action admin gọi requireAdmin trước, có
//    revalidate storefront, trang sửa GIỮ slug (không set slug khi update
//    ở tầng lib).
// Chạy: node scripts/test-hap16-products.ts (Node 24 native type-stripping).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  decideProductDeletion,
  slugifyVietnamese,
  uniqueSlug,
  validateProductInput,
  type ProductFormInput,
} from "../src/lib/products/admin-validate.ts";

// --- 1. slugifyVietnamese ---
assert.equal(slugifyVietnamese("Cà phê sữa đá"), "ca-phe-sua-da");
assert.equal(slugifyVietnamese("Trà đào cam sả"), "tra-dao-cam-sa");
assert.equal(slugifyVietnamese("Đen đá"), "den-da");
assert.equal(slugifyVietnamese("Đường nâu"), "duong-nau");
assert.equal(slugifyVietnamese("Bạc xỉu"), "bac-xiu");
assert.equal(slugifyVietnamese("Ổi hồng xí muội"), "oi-hong-xi-muoi");
assert.equal(slugifyVietnamese("Bánh mì & phô mai!"), "banh-mi-pho-mai");
assert.equal(slugifyVietnamese("  Espresso   Tonic  "), "espresso-tonic");
assert.equal(slugifyVietnamese("Cold brew 02"), "cold-brew-02");
assert.equal(slugifyVietnamese("!!!"), "san-pham");
assert.equal(slugifyVietnamese(""), "san-pham");

// --- 2. uniqueSlug ---
assert.equal(uniqueSlug("ca-phe", new Set()), "ca-phe");
assert.equal(uniqueSlug("ca-phe", new Set(["ca-phe"])), "ca-phe-2");
assert.equal(
  uniqueSlug("ca-phe", new Set(["ca-phe", "ca-phe-2"])),
  "ca-phe-3",
);
assert.equal(
  uniqueSlug("ca-phe", new Set(["ca-phe", "ca-phe-3"])),
  "ca-phe-2",
);

// --- 3. validateProductInput: hợp lệ + chuẩn hoá ---
const VALID_CATEGORY_ID = "11111111-1111-4111-8111-111111111111";
const baseInput: ProductFormInput = {
  name: "  Cà phê muối  ",
  categoryId: VALID_CATEGORY_ID,
  priceVnd: "45.000",
  description: "  Cà phê phin với lớp kem muối.  ",
  imageUrl: "https://images.unsplash.com/photo-abc",
  isAvailable: true,
  isFeatured: false,
};

const okResult = validateProductInput(baseInput);
assert.equal(okResult.ok, true);
if (okResult.ok) {
  assert.equal(okResult.data.name, "Cà phê muối");
  assert.equal(okResult.data.priceVnd, 45000);
  assert.equal(okResult.data.description, "Cà phê phin với lớp kem muối.");
  assert.equal(okResult.data.imageUrl, "https://images.unsplash.com/photo-abc");
  assert.equal(okResult.data.isAvailable, true);
}

// Giá dạng number và giá 0 đều hợp lệ (món tặng kèm/mẫu thử).
const zeroResult = validateProductInput({ ...baseInput, priceVnd: 0 });
assert.equal(zeroResult.ok, true);
if (zeroResult.ok) assert.equal(zeroResult.data.priceVnd, 0);

// Mô tả/ảnh rỗng → null (storefront dùng placeholder).
const emptyOptionals = validateProductInput({
  ...baseInput,
  description: "   ",
  imageUrl: "",
});
assert.equal(emptyOptionals.ok, true);
if (emptyOptionals.ok) {
  assert.equal(emptyOptionals.data.description, null);
  assert.equal(emptyOptionals.data.imageUrl, null);
}

// Ảnh dạng đường dẫn nội bộ hợp lệ.
const relativeImage = validateProductInput({
  ...baseInput,
  imageUrl: "/images/ca-phe.jpg",
});
assert.equal(relativeImage.ok, true);

// --- 3b. validateProductInput: từng lỗi ---
function expectFieldError(
  input: ProductFormInput,
  field: "name" | "categoryId" | "priceVnd" | "description" | "imageUrl",
) {
  const result = validateProductInput(input);
  assert.equal(result.ok, false, `kỳ vọng lỗi ở trường ${field}`);
  if (!result.ok) {
    assert.ok(result.fieldErrors[field], `thiếu thông điệp lỗi cho ${field}`);
  }
}

expectFieldError({ ...baseInput, name: "   " }, "name");
expectFieldError({ ...baseInput, name: "a".repeat(121) }, "name");
expectFieldError({ ...baseInput, categoryId: "" }, "categoryId");
expectFieldError({ ...baseInput, categoryId: "khong-phai-uuid" }, "categoryId");
expectFieldError({ ...baseInput, priceVnd: "" }, "priceVnd");
expectFieldError({ ...baseInput, priceVnd: "bon-muoi-nghin" }, "priceVnd");
expectFieldError({ ...baseInput, priceVnd: "45000.5" }, "priceVnd");
expectFieldError({ ...baseInput, priceVnd: 45000.5 }, "priceVnd");
expectFieldError({ ...baseInput, priceVnd: "-1000" }, "priceVnd");
expectFieldError({ ...baseInput, priceVnd: -1000 }, "priceVnd");
expectFieldError({ ...baseInput, priceVnd: "1000000000" }, "priceVnd");
expectFieldError({ ...baseInput, description: "a".repeat(1001) }, "description");
expectFieldError({ ...baseInput, imageUrl: "khong-phai-url" }, "imageUrl");
expectFieldError({ ...baseInput, imageUrl: "http://example.com/a.jpg" }, "imageUrl");
expectFieldError({ ...baseInput, imageUrl: "//example.com/a.jpg" }, "imageUrl");
expectFieldError({ ...baseInput, imageUrl: "javascript:alert(1)" }, "imageUrl");

// --- 4. decideProductDeletion ---
assert.deepEqual(decideProductDeletion(0), { allowed: true });
const blocked = decideProductDeletion(3);
assert.equal(blocked.allowed, false);
if (!blocked.allowed) {
  assert.match(blocked.message, /Hết hàng/);
}

// --- 5. Kiểm tra tĩnh wiring ---
const actionsSrc = readFileSync(
  new URL("../src/server-actions/admin-products.ts", import.meta.url),
  "utf8",
);
for (const fn of [
  "createProductAction",
  "updateProductAction",
  "setProductAvailabilityAction",
  "deleteProductAction",
]) {
  assert.match(actionsSrc, new RegExp(`export async function ${fn}`));
}
assert.equal(
  (actionsSrc.match(/await requireAdmin\(/g) ?? []).length,
  4,
  "cả 4 action đều phải gọi requireAdmin",
);
assert.match(actionsSrc, /revalidatePath\("\/"\)/);
assert.match(actionsSrc, /revalidatePath\("\/menu"\)/);
assert.match(actionsSrc, /revalidatePath\(`\/menu\/\$\{slug\}`\)/);
assert.match(actionsSrc, /revalidatePath\(ADMIN_LIST_PATH\)/);

const libSrc = readFileSync(
  new URL("../src/lib/products/admin.ts", import.meta.url),
  "utf8",
);
const updateBlock = libSrc.slice(libSrc.indexOf("export async function updateProduct"));
assert.ok(!/slug:/.test(updateBlock), "updateProduct KHÔNG được đổi slug");

const layoutSrc = readFileSync(
  new URL("../src/app/admin/layout.tsx", import.meta.url),
  "utf8",
);
assert.match(layoutSrc, /href: "\/admin\/san-pham"/);

console.log("HAP-16 product admin logic tests: PASS");
