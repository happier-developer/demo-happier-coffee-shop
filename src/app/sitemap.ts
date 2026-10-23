import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { getProductSlugsForSitemap } from "@/lib/products/catalog";
import { getPostSlugsForSitemap } from "@/lib/blog/posts";

// sitemap.xml (HAP-19): các route tĩnh công khai + toàn bộ slug sản phẩm
// từ DB. Từ HAP-21 slug đọc qua cache catalogue (tag `catalog`) — admin
// thêm/xoá sản phẩm thì invalidation ngay, không cần render động mỗi
// request. Lỗi DB (hoặc build không có DATABASE_URL) KHÔNG được làm gãy
// sitemap/deploy — khi đó chỉ còn route tĩnh và lỗi được log ra console.

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, changeFrequency: "weekly", priority: 1 },
  { url: `${siteUrl}/menu`, changeFrequency: "daily", priority: 0.9 },
  { url: `${siteUrl}/gioi-thieu`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/lien-he`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await getProductSlugsForSitemap();

    // Slug bài Blog (HAP-28): lỗi riêng của blog không được làm mất phần
    // sản phẩm đã tải được (và ngược lại ở catch ngoài).
    let postEntries: MetadataRoute.Sitemap = [];
    try {
      const postRows = await getPostSlugsForSitemap();
      postEntries = postRows.map((row) => ({
        url: `${siteUrl}/blog/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } catch (error) {
      console.error("Không tải được slug bài viết cho sitemap:", error);
    }

    return [
      ...staticRoutes,
      ...rows.map((row) => ({
        url: `${siteUrl}/menu/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...postEntries,
    ];
  } catch (error) {
    console.error("Không tải được slug sản phẩm cho sitemap:", error);
    return staticRoutes;
  }
}
