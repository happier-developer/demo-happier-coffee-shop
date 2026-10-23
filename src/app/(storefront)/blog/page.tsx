import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PostCard from "@/components/blog/PostCard";
import { getPublishedPosts } from "@/lib/blog/posts";
import type { BlogPost } from "@/lib/db/schema";

// Trang danh sách Blog (HAP-28): chỉ bài ĐÃ XUẤT BẢN, mới nhất trước.
// Dữ liệu đọc qua cache tag `blog` (src/lib/blog/posts.ts) — admin
// đăng/sửa/rút bài thì updateTag làm mới ngay; revalidate 3600 là lưới
// an toàn. Lỗi DB → trạng thái trống thân thiện thay vì sập trang
// (cùng cách trang chủ xử lý khi không tải được món nổi bật).

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Câu chuyện cà phê của Happier Coffee: cách pha phin, cold brew, matcha và những gợi ý thưởng thức từ quán.",
  openGraph: {
    title: "Blog — Happier Coffee",
    description:
      "Câu chuyện cà phê của Happier Coffee: cách pha phin, cold brew, matcha và những gợi ý thưởng thức từ quán.",
    type: "website",
  },
};

export default async function BlogListPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await getPublishedPosts();
  } catch (error) {
    console.error("Không tải được danh sách bài viết:", error);
  }

  return (
    <Container className="py-10 md:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-coffee md:text-4xl">
          Blog Happier Coffee
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Những câu chuyện nhỏ quanh ly cà phê: cách pha, cách chọn hạt và
          cách thưởng thức chậm rãi hơn một chút.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-muted">
          Quán đang ủ bài viết đầu tiên — mời bạn quay lại sau ít hôm nhé.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Container>
  );
}
