// Tầng dữ liệu quản lý bài viết Blog phía admin (HAP-28) — CHỈ chạy ở
// server. Mọi hàm được gọi từ Server Actions / Server Components đã qua
// requireAdmin(); file này không tự kiểm quyền (chốt chặn nằm ở action +
// layout guard, theo ARCHITECTURE.md mục 4). Logic validate thuần nằm ở
// validate.ts; slug dùng lại slugifyVietnamese/uniqueSlug của HAP-16.

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogPosts, type BlogPost } from "@/lib/db/schema";
import {
  slugifyVietnamese,
  uniqueSlug,
} from "@/lib/products/admin-validate";
import type { ValidPostData } from "./validate";

/** Toàn bộ bài viết (cả nháp) cho trang quản trị, bài cập nhật gần nhất trước. */
export async function listPostsForAdmin(): Promise<BlogPost[]> {
  const db = getDb();
  return db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.updatedAt), desc(blogPosts.createdAt));
}

export async function getPostByIdForAdmin(
  id: string,
): Promise<BlogPost | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Tạo bài viết: slug tự sinh từ tiêu đề, duy nhất (hậu tố -2, -3...),
 * thử lại tối đa 3 lần khi đụng UNIQUE do race — cùng mẫu createProduct.
 * published_at ghi ngay nếu bài xuất bản luôn lúc tạo.
 */
export async function createPost(data: ValidPostData): Promise<BlogPost> {
  const db = getDb();
  const baseSlug = slugifyVietnamese(data.title) || "bai-viet";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slugRows = await db.select({ slug: blogPosts.slug }).from(blogPosts);
    const taken = new Set(slugRows.map((row) => row.slug));
    for (let i = 0; i < attempt; i += 1) {
      taken.add(i === 0 ? baseSlug : `${baseSlug}-${i + 1}`);
    }
    const slug = uniqueSlug(baseSlug, taken);
    try {
      const rows = await db
        .insert(blogPosts)
        .values({
          slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImageUrl,
          author: data.author,
          isPublished: data.isPublished,
          publishedAt: data.isPublished ? new Date() : null,
        })
        .returning();
      return rows[0];
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  throw new Error("Không tạo được bài viết sau 3 lần thử.");
}

/**
 * Sửa bài viết — slug GIỮ NGUYÊN (như sản phẩm HAP-16: tránh gãy liên
 * kết đã chia sẻ). published_at chỉ ghi khi xuất bản LẦN ĐẦU; rút về
 * nháp giữ nguyên published_at cũ (chỉ is_published đổi).
 */
export async function updatePost(
  id: string,
  data: ValidPostData,
): Promise<BlogPost | null> {
  const db = getDb();
  const existing = await getPostByIdForAdmin(id);
  if (!existing) return null;

  const rows = await db
    .update(blogPosts)
    .set({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      author: data.author,
      isPublished: data.isPublished,
      publishedAt:
        data.isPublished && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Bật/tắt xuất bản nhanh từ danh sách (không qua form). */
export async function setPostPublished(
  id: string,
  publish: boolean,
): Promise<BlogPost | null> {
  const db = getDb();
  const existing = await getPostByIdForAdmin(id);
  if (!existing) return null;

  const rows = await db
    .update(blogPosts)
    .set({
      isPublished: publish,
      publishedAt:
        publish && !existing.publishedAt ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Xoá hẳn bài viết — blog không bị ràng buộc dữ liệu khác (khác sản phẩm). */
export async function deletePostById(id: string): Promise<BlogPost | null> {
  const db = getDb();
  const rows = await db
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning();
  return rows[0] ?? null;
}
