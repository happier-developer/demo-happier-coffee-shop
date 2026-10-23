// Kiểm thử logic của HAP-15 (phân quyền admin) — không chạm DB/không
// cần phiên thật:
// 1. parseAdminEmails: tách phẩy, trim, viết thường, bỏ rỗng + trùng.
// 2. isAdminEmail: khớp không phân biệt hoa/thường; danh sách trống =
//    không ai là admin; env ADMIN_EMAILS được tôn trọng qua tham số mặc
//    định (đọc ở thời điểm gọi).
// 3. Kiểm tra tĩnh: layout /admin gọi requireAdmin, admin.ts dùng
//    forbidden() cho user thường + redirect login cho khách vãng lai,
//    next.config.ts đã bật experimental.authInterrupts.
// Chạy: node scripts/test-hap15-admin.ts (Node 24 native type-stripping).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isAdminEmail,
  parseAdminEmails,
} from "../src/lib/auth/admin-emails.ts";

// --- 1. parseAdminEmails ---
assert.deepEqual(parseAdminEmails(undefined), []);
assert.deepEqual(parseAdminEmails(null), []);
assert.deepEqual(parseAdminEmails(""), []);
assert.deepEqual(parseAdminEmails("   "), []);
assert.deepEqual(parseAdminEmails(",,,"), []);
assert.deepEqual(parseAdminEmails("a@x.com"), ["a@x.com"]);
assert.deepEqual(parseAdminEmails(" A@X.com , b@y.com ,, A@x.COM "), [
  "a@x.com",
  "b@y.com",
]);

// --- 2. isAdminEmail với danh sách tường minh ---
const list = parseAdminEmails("Admin@Happier.Coffee, quanly@happier.coffee");
assert.equal(isAdminEmail("admin@happier.coffee", list), true);
assert.equal(isAdminEmail(" ADMIN@HAPPIER.COFFEE ", list), true);
assert.equal(isAdminEmail("quanly@happier.coffee", list), true);
assert.equal(isAdminEmail("khach@gmail.com", list), false);
assert.equal(isAdminEmail("", list), false);
assert.equal(isAdminEmail(null, list), false);
assert.equal(isAdminEmail(undefined, list), false);
assert.equal(isAdminEmail("admin@happier.coffee", []), false);

// --- 2b. isAdminEmail đọc env qua tham số mặc định ---
const savedEnv = process.env.ADMIN_EMAILS;
try {
  delete process.env.ADMIN_EMAILS;
  assert.equal(isAdminEmail("admin@happier.coffee"), false);
  process.env.ADMIN_EMAILS = "E2E.Test@Example.com";
  assert.equal(isAdminEmail("e2e.test@example.com"), true);
  assert.equal(isAdminEmail("e2e2.test@example.com"), false);
} finally {
  if (savedEnv === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = savedEnv;
}

// --- 3. Kiểm tra tĩnh wiring ---
const adminSrc = readFileSync(
  new URL("../src/lib/auth/admin.ts", import.meta.url),
  "utf8",
);
assert.match(adminSrc, /getCurrentUser/);
assert.match(adminSrc, /redirect\(`\/auth\/dang-nhap\?next=/);
assert.match(adminSrc, /forbidden\(\)/);

const layoutSrc = readFileSync(
  new URL("../src/app/admin/layout.tsx", import.meta.url),
  "utf8",
);
assert.match(layoutSrc, /requireAdmin\("\/admin"\)/);
assert.match(layoutSrc, /force-dynamic/);

const configSrc = readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);
assert.match(configSrc, /authInterrupts:\s*true/);

console.log("HAP-15 admin logic tests: PASS");
