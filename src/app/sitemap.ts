import type { MetadataRoute } from "next";
import { asc } from "drizzle-orm";
import { siteUrl } from "@/lib/config";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";

// sitemap.xml (HAP-19): các route tĩnh công khai + toàn bộ slug sản phẩm
// từ DB. Bắt buộc force-dynamic để danh sách món luôn mới; lỗi DB (hoặc
// build không có DATABASE_URL) KHÔNG được làm gãy sitemap/deploy — khi đó
// chỉ còn route tĩnh và lỗi được log ra console.
export const dynamic = "force-dynamic";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, changeFrequency: "weekly", priority: 1 },
  { url: `${siteUrl}/menu`, changeFrequency: "daily", priority: 0.9 },
  { url: `${siteUrl}/gioi-thieu`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/lien-he`, changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getDb();
    const rows = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .orderBy(asc(products.slug));

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
