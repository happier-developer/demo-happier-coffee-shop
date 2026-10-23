"use server";

// Server Actions quản lý sản phẩm (HAP-16) — mutation DUY NHẤT của khu
// admin sản phẩm, theo ARCHITECTURE.md mục 2 + mục 4: mọi action gọi
// requireAdmin() TRƯỚC TIÊN (lớp chặn thứ 2 sau layout guard — action
// gọi được trực tiếp nên không được tin là đã qua trang). Validate lại
// toàn bộ input ở server bằng logic thuần dùng chung
// (src/lib/products/admin-validate.ts), không tin dữ liệu client.
//
// Sau mỗi mutation thành công: revalidate các đường storefront bị ảnh
// hưởng để thay đổi phản ánh NGAY ra ngoài (trang chủ, /menu, chi tiết
// món) cùng danh sách admin.

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { CATALOG_TAG } from "@/lib/products/catalog";
import {
  categoryExists,
  countOrderItemsForProduct,
  createProduct,
  deleteProductById,
  getProductByIdForAdmin,
  setProductAvailability,
  updateProduct,
} from "@/lib/products/admin";
import {
  decideProductDeletion,
  validateProductInput,
  type ProductFieldErrors,
  type ProductFormInput,
  type ValidProductData,
} from "@/lib/products/admin-validate";

export type ProductActionResult =
  | { ok: true; id?: string; slug?: string; message?: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: ProductFieldErrors;
      /** true khi bị chặn vì sản phẩm đã có trong đơn hàng (xoá an toàn). */
      blocked?: boolean;
    };

const ADMIN_LIST_PATH = "/admin/san-pham";
const GENERIC_ERROR_MESSAGE =
  "Chưa lưu được thay đổi lúc này. Vui lòng thử lại sau ít phút.";
const NOT_FOUND_MESSAGE = "Không tìm thấy sản phẩm này (có thể đã bị xoá).";

function revalidateStorefront(slug?: string) {
  // HAP-21: dữ liệu catalogue phía storefront nằm trong cache tag
  // `catalog` (src/lib/products/catalog.ts) — updateTag làm cache hết hạn
  // NGAY (không phục vụ bản cũ, đúng cam kết "phản ánh ngay" từ HAP-16)
  // để MỌI đường đọc (trang chủ, menu, chi tiết, sitemap) thấy thay đổi,
  // kể cả khi slug/nhóm của món thay đổi làm revalidatePath theo đường
  // cũ sót.
  updateTag(CATALOG_TAG);
  revalidatePath("/");
  revalidatePath("/menu");
  if (slug) revalidatePath(`/menu/${slug}`);
  revalidatePath(ADMIN_LIST_PATH);
}

type CheckedInput =
  | { ok: true; data: ValidProductData }
  | { ok: false; result: ProductActionResult };

async function validateAndCheckCategory(
  input: ProductFormInput,
): Promise<CheckedInput> {
  const validation = validateProductInput(input);
  if (!validation.ok) {
    return {
      ok: false,
      result: {
        ok: false,
        message: "Thông tin sản phẩm chưa hợp lệ, vui lòng kiểm tra lại.",
        fieldErrors: validation.fieldErrors,
      },
    };
  }
  if (!(await categoryExists(validation.data.categoryId))) {
    return {
      ok: false,
      result: {
        ok: false,
        message: "Thông tin sản phẩm chưa hợp lệ, vui lòng kiểm tra lại.",
        fieldErrors: { categoryId: "Nhóm món này không còn tồn tại." },
      },
    };
  }
  return { ok: true, data: validation.data };
}

export async function createProductAction(
  input: ProductFormInput,
): Promise<ProductActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  try {
    const checked = await validateAndCheckCategory(input);
    if (!checked.ok) return checked.result;
    const created = await createProduct(checked.data);
    revalidateStorefront(created.slug);
    return {
      ok: true,
      id: created.id,
      slug: created.slug,
      message: `Đã thêm sản phẩm “${created.name}”.`,
    };
  } catch (error) {
    console.error("createProductAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductFormInput,
): Promise<ProductActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  try {
    const existing = await getProductByIdForAdmin(id);
    if (!existing) return { ok: false, message: NOT_FOUND_MESSAGE };

    const checked = await validateAndCheckCategory(input);
    if (!checked.ok) return checked.result;

    const updated = await updateProduct(id, checked.data);
    if (!updated) return { ok: false, message: NOT_FOUND_MESSAGE };

    // Slug giữ nguyên khi sửa (xem ghi chú trong lib/products/admin.ts)
    // nên chỉ cần revalidate đúng đường chi tiết hiện tại.
    revalidateStorefront(existing.slug);
    return {
      ok: true,
      id: updated.id,
      slug: updated.slug,
      message: `Đã cập nhật sản phẩm “${updated.name}”.`,
    };
  } catch (error) {
    console.error("updateProductAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

export async function setProductAvailabilityAction(
  id: string,
  isAvailable: boolean,
): Promise<ProductActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  try {
    const updated = await setProductAvailability(id, Boolean(isAvailable));
    if (!updated) return { ok: false, message: NOT_FOUND_MESSAGE };
    revalidateStorefront(updated.slug);
    return {
      ok: true,
      id: updated.id,
      slug: updated.slug,
      message: updated.isAvailable
        ? `“${updated.name}” đang bán trở lại.`
        : `“${updated.name}” đã chuyển sang Hết hàng.`,
    };
  } catch (error) {
    console.error("setProductAvailabilityAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ProductActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  try {
    const existing = await getProductByIdForAdmin(id);
    if (!existing) return { ok: false, message: NOT_FOUND_MESSAGE };

    // XOÁ AN TOÀN: đã có trong đơn của khách → từ chối, giữ lịch sử đơn.
    const orderItemCount = await countOrderItemsForProduct(id);
    const decision = decideProductDeletion(orderItemCount);
    if (!decision.allowed) {
      return { ok: false, blocked: true, message: decision.message };
    }

    await deleteProductById(id);
    revalidateStorefront(existing.slug);
    return {
      ok: true,
      id,
      message: `Đã xoá sản phẩm “${existing.name}”.`,
    };
  } catch (error) {
    console.error("deleteProductAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}
