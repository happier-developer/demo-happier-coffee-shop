// Tầng đọc Blog cho storefront (HAP-28) — CHỈ chạy ở server.
// Cùng mẫu cache với catalogue sản phẩm (HAP-21): nội dung blog chỉ đổi
// khi admin thao tác qua Server Actions (src/server-actions/admin-posts.ts)
// nên các hàm đọc ở đây được bọc `unstable_cache` với tag BLOG_TAG:
// - Server Actions admin gọi updateTag(BLOG_TAG) sau MỌI mutation →
//   thay đổi (đăng bài, sửa, rút nháp, xoá) phản ánh ngay.
// - revalidate 3600s chỉ là lưới an toàn.
// Chỉ bài ĐÃ XUẤT BẢN mới tới được storefront; bài nháp không lọt qua
// bất kỳ hàm nào trong file này. Lỗi DB ném ra ngoài để trang tự xử lý
// trạng thái trống (không cache kết quả lỗi).

import { unstable_cache } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogPosts, type BlogPost } from "@/lib/db/schema";

export const BLOG_TAG = "blog";
const BLOG_REVALIDATE_SECONDS = 3600;

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const db = getDb();
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
}

async function fetchPublishedPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(
      and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function fetchPostSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const db = getDb();
  return db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt));
}

/** Danh sách bài đã xuất bản cho /blog — đã qua cache tag `blog`. */
export const getPublishedPosts = unstable_cache(fetchPublishedPosts, [
  "blog-published-posts",
], { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS });

/** Chi tiết 1 bài đã xuất bản theo slug — cache theo từng slug. */
export const getPublishedPostBySlug = unstable_cache(
  fetchPublishedPostBySlug,
  ["blog-post-detail"],
  { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS },
);

/** Slug bài đã xuất bản cho sitemap — đã qua cache tag `blog`. */
export const getPostSlugsForSitemap = unstable_cache(fetchPostSlugs, [
  "blog-sitemap-slugs",
], { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS });
