import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostForm from "@/components/admin/PostForm";
import { getPostByIdForAdmin } from "@/lib/blog/admin";

// Trang sửa bài viết (HAP-28). Id không tồn tại → 404. Slug của bài
// giữ nguyên khi sửa (PostForm hiển thị rõ), tránh gãy liên kết.

export const metadata: Metadata = {
  title: "Sửa bài viết",
};

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();

  return (
    <section>
      <Link
        href="/admin/bai-viet"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-caramel transition hover:text-coffee"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Danh sách bài viết
      </Link>
      <h1 className="mt-3 mb-6 line-clamp-2 text-2xl font-bold text-coffee">
        Sửa bài: {post.title}
      </h1>
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <PostForm post={post} />
      </div>
    </section>
  );
}
