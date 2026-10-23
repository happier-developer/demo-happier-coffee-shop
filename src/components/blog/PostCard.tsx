import Image from "next/image";
import Link from "next/link";
import { Coffee } from "lucide-react";
import type { BlogPost } from "@/lib/db/schema";
import { formatDateVi } from "@/lib/format";

// Thẻ bài viết ở trang danh sách /blog (HAP-28) — cùng ngôn ngữ thị
// giác với ProductCard: ảnh bìa bo góc, tiêu đề đậm màu coffee, meta
// ngày/tác giả màu muted. Toàn bộ thẻ là một liên kết tới bài viết.

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-state ease-standard hover:border-caramel/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta active:scale-[0.99]"
    >
      <span className="relative block aspect-[16/9] w-full overflow-hidden bg-line/40">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition duration-300 ease-standard group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted">
            <Coffee className="h-10 w-10" aria-hidden />
          </span>
        )}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-medium tracking-wide text-muted uppercase">
          {post.publishedAt ? formatDateVi(post.publishedAt) : ""} ·{" "}
          {post.author}
        </span>
        <span className="text-lg leading-snug font-bold text-coffee group-hover:text-caramel">
          {post.title}
        </span>
        {post.excerpt ? (
          <span className="line-clamp-3 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </span>
        ) : null}
        <span className="mt-auto pt-1 text-sm font-medium text-caramel">
          Đọc tiếp →
        </span>
      </span>
    </Link>
  );
}
