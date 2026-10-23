"use server";

// Server Actions quản lý bài viết Blog (HAP-28) — mutation DUY NHẤT của
// khu admin bài viết, cùng mẫu admin-products.ts (HAP-16): mọi action
// gọi requireAdmin() TRƯỚC TIÊN, validate lại toàn bộ input ở server
// bằng logic thuần (src/lib/blog/validate.ts), không tin dữ liệu client.
//
// Sau mỗi mutation thành công: updateTag(BLOG_TAG) để cache blog phía
// storefront hết hạn NGAY (danh sách /blog, chi tiết, sitemap) +
// revalidate các đường liên quan và danh sách admin.

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { BLOG_TAG } from "@/lib/blog/posts";
import {
  createPost,
  deletePostById,
  getPostByIdForAdmin,
  setPostPublished,
  updatePost,
} from "@/lib/blog/admin";
import {
  validatePostInput,
  type PostFieldErrors,
  type PostFormInput,
} from "@/lib/blog/validate";

export type PostActionResult =
  | { ok: true; id?: string; slug?: string; message?: string }
  | { ok: false; message: string; fieldErrors?: PostFieldErrors };

const ADMIN_LIST_PATH = "/admin/bai-viet";
const GENERIC_ERROR_MESSAGE =
  "Chưa lưu được thay đổi lúc này. Vui lòng thử lại sau ít phút.";
const NOT_FOUND_MESSAGE = "Không tìm thấy bài viết này (có thể đã bị xoá).";

function revalidateBlog(slug?: string) {
  updateTag(BLOG_TAG);
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath(ADMIN_LIST_PATH);
}

export async function createPostAction(
  input: PostFormInput,
): Promise<PostActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  const validation = validatePostInput(input);
  if (!validation.ok) {
    return {
      ok: false,
      message: "Thông tin bài viết chưa hợp lệ, vui lòng kiểm tra lại.",
      fieldErrors: validation.fieldErrors,
    };
  }
  try {
    const post = await createPost(validation.data);
    revalidateBlog(post.slug);
    return {
      ok: true,
      id: post.id,
      slug: post.slug,
      message: post.isPublished
        ? "Đã xuất bản bài viết."
        : "Đã lưu bài viết nháp.",
    };
  } catch (error) {
    console.error("createPostAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

export async function updatePostAction(
  id: string,
  input: PostFormInput,
): Promise<PostActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  const validation = validatePostInput(input);
  if (!validation.ok) {
    return {
      ok: false,
      message: "Thông tin bài viết chưa hợp lệ, vui lòng kiểm tra lại.",
      fieldErrors: validation.fieldErrors,
    };
  }
  try {
    const post = await updatePost(id, validation.data);
    if (!post) return { ok: false, message: NOT_FOUND_MESSAGE };
    revalidateBlog(post.slug);
    return {
      ok: true,
      id: post.id,
      slug: post.slug,
      message: "Đã lưu thay đổi bài viết.",
    };
  } catch (error) {
    console.error("updatePostAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

export async function setPostPublishedAction(
  id: string,
  publish: boolean,
): Promise<PostActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  try {
    const post = await setPostPublished(id, publish);
    if (!post) return { ok: false, message: NOT_FOUND_MESSAGE };
    revalidateBlog(post.slug);
    return {
      ok: true,
      id: post.id,
      slug: post.slug,
      message: publish ? "Đã xuất bản bài viết." : "Đã rút bài về nháp.",
    };
  } catch (error) {
    console.error("setPostPublishedAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

export async function deletePostAction(
  id: string,
): Promise<PostActionResult> {
  await requireAdmin(ADMIN_LIST_PATH);
  try {
    const existing = await getPostByIdForAdmin(id);
    if (!existing) return { ok: false, message: NOT_FOUND_MESSAGE };
    await deletePostById(id);
    revalidateBlog(existing.slug);
    return { ok: true, id, message: "Đã xoá bài viết." };
  } catch (error) {
    console.error("deletePostAction failed:", error);
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}
