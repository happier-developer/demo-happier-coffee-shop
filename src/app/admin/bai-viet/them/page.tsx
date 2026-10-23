import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PostForm from "@/components/admin/PostForm";

// Trang tạo bài viết mới (HAP-28). Guard admin ở layout; form là
// client component gọi Server Actions (requireAdmin chạy lại ở action).

export const metadata: Metadata = {
  title: "Viết bài mới",
};

export default function AdminCreatePostPage() {
  return (
    <section>
      <Link
        href="/admin/bai-viet"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-caramel transition hover:text-coffee"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Danh sách bài viết
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-coffee">
        Viết bài mới
      </h1>
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <PostForm />
      </div>
    </section>
  );
}
