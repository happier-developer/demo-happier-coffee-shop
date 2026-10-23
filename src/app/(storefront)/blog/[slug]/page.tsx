import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import { getDb } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPublishedPostBySlug } from "@/lib/blog/posts";
import { formatDateVi } from "@/lib/format";
import { siteUrl } from "@/lib/config";

// Trang chi tiết bài viết Blog (HAP-28). Chỉ bài ĐÃ XUẤT BẢN mới xem
// được — slug sai hoặc bài đang là nháp → 404. Nội dung là HTML do
// editor Tiptap trong admin sinh ra (nguồn tin cậy nội bộ duy nhất có
// quyền ghi), render trực tiếp với typography `.post-content` trong
// globals.css (khai báo ở DESIGN.md). Render tĩnh theo slug +
// generateStaticParams như trang chi tiết sản phẩm (HAP-21); admin sửa
// bài thì updateTag(`blog`) làm mới ngay.

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));
    return rows.map((row) => ({ slug: row.slug }));
  } catch (error) {
    console.error("Không tải được slug blog cho generateStaticParams:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);
  if (!post) {
    return { title: "Không tìm thấy bài viết" };
  }
  // publishedAt qua unstable_cache có thể là chuỗi ISO (sau khi cache
  // serialize) chứ không còn là Date — chuẩn hoá trước khi toISOString,
  // nếu không generateMetadata sẽ ném lỗi và cả trang trả 500.
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      publishedTime:
        publishedDate && !Number.isNaN(publishedDate.getTime())
          ? publishedDate.toISOString()
          : undefined,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  return (
    <Container className="py-10 md:py-14">
      <article className="mx-auto max-w-[720px]">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-caramel transition hover:text-coffee"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tất cả bài viết
        </Link>

        <header className="mt-6">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {post.publishedAt ? formatDateVi(post.publishedAt) : ""} ·{" "}
            {post.author}
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-bold text-coffee md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        {post.coverImageUrl ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-line/40">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        {/* Nội dung HTML từ Tiptap (admin) — xem ghi chú đầu file. */}
        <div
          className="post-content mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-12 border-t border-line pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-caramel transition hover:text-coffee"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Đọc thêm bài khác trên Blog
          </Link>
        </footer>
      </article>
    </Container>
  );
}
