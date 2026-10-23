import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileText, Pencil, Plus } from "lucide-react";
import PostRowActions from "@/components/admin/PostRowActions";
import { listPostsForAdmin } from "@/lib/blog/admin";
import type { BlogPost } from "@/lib/db/schema";
import { formatDateTimeVi } from "@/lib/format";

// Trang quản lý bài viết Blog (HAP-28) — cùng khuôn bảng dữ liệu với
// trang Sản phẩm (HAP-16): gồm CẢ bài nháp (khác storefront chỉ thấy
// bài đã xuất bản). Guard admin ở layout; trang này chỉ đọc + thao tác
// qua Server Actions.

export const metadata: Metadata = {
  title: "Bài viết",
};

function PublishBadge({ post }: { post: BlogPost }) {
  return post.isPublished ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
      Đã xuất bản
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning" />
      Nháp
    </span>
  );
}

export default async function AdminPostsPage() {
  const posts = await listPostsForAdmin();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-coffee">Bài viết Blog</h1>
          <p className="mt-1 text-sm text-muted">
            {posts.length} bài viết ·{" "}
            {posts.filter((p) => p.isPublished).length} đã xuất bản ·{" "}
            {posts.filter((p) => !p.isPublished).length} nháp
          </p>
        </div>
        <Link
          href="/admin/bai-viet/them"
          className="ms-auto inline-flex items-center gap-2 rounded-xl bg-cta px-4 py-2.5 text-sm font-medium text-white transition duration-state ease-standard hover:opacity-90 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Viết bài mới
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-muted">
          Chưa có bài viết nào. Bấm &quot;Viết bài mới&quot; để bắt đầu.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <ul className="divide-y divide-line">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-4 px-4 py-4 md:px-5"
              >
                <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-line/40">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-muted">
                      <FileText className="h-5 w-5" aria-hidden />
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-medium text-coffee">
                    {post.title}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    /blog/{post.slug} · {post.author}
                    {post.publishedAt
                      ? ` · Đăng ${formatDateTimeVi(post.publishedAt)}`
                      : ""}
                  </p>
                </div>

                <PublishBadge post={post} />

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/bai-viet/${post.id}/sua`}
                    aria-label={`Sửa bài "${post.title}"`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm font-medium text-coffee transition duration-state ease-standard hover:bg-cream active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Sửa
                  </Link>
                  <PostRowActions
                    postId={post.id}
                    postTitle={post.title}
                    isPublished={post.isPublished}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
