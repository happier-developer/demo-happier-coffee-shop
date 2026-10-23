import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { getProductSlugsForSitemap } from "@/lib/products/catalog";

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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await getProductSlugsForSitemap();

    return [
      ...staticRoutes,
      ...rows.map((row) => ({
        url: `${siteUrl}/menu/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    console.error("Không tải được slug sản phẩm cho sitemap:", error);
    return staticRoutes;
  }
}
