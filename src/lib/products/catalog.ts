// Tầng đọc catalogue sản phẩm cho storefront (HAP-21) — CHỈ chạy ở server.
//
// Bối cảnh: trước HAP-21, trang chủ/menu/chi tiết/sitemap đều
// `force-dynamic` và query Neon (Singapore) từ function Vercel ở Mỹ mỗi
// lần điều hướng — TTFB 0.68–0.98s. Catalogue chỉ thay đổi khi admin
// thao tác qua Server Actions (HAP-16), nên toàn bộ dữ liệu đọc ở đây
// được bọc `unstable_cache` với tag CATALOG_TAG:
// - Server Actions admin (src/server-actions/admin-products.ts) gọi
//   updateTag(CATALOG_TAG) sau MỌI mutation → cache hết hạn ngay,
//   thay đổi phản ánh tức thì như trước HAP-21.
// - revalidate 3600s chỉ là lưới an toàn chống sót đường invalidation.
// Lỗi DB được ném ra ngoài (KHÔNG nuốt lỗi trong hàm đã cache — kết quả
// lỗi không bị cache; trang gọi tự xử lý trạng thái trống như trước).
//
// TUYỆT ĐỐI không dùng file này cho dữ liệu đơn hàng/tài khoản/admin:
// các luồng đó luôn đọc DB trực tiếp (src/lib/orders/*, src/lib/products/admin.ts).

import { unstable_cache } from "next/cache";
import { and, asc, eq, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  categories,
  products,
  type Category,
  type Product,
} from "@/lib/db/schema";

export const CATALOG_TAG = "catalog";
const CATALOG_REVALIDATE_SECONDS = 3600;

export interface MenuCatalog {
  categoryList: Category[];
  productList: Product[];
}

export interface ProductDetail {
  product: Product;
  categoryName: string;
  categorySlug: string;
  related: Product[];
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(and(eq(products.isFeatured, true), eq(products.isAvailable, true)))
    .orderBy(asc(products.sortOrder), asc(products.name))
    .limit(8);
}

async function fetchMenuCatalog(): Promise<MenuCatalog> {
  const db = getDb();
  const [categoryList, productList] = await Promise.all([
    db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(products)
      .orderBy(asc(products.sortOrder), asc(products.name)),
  ]);
  return { categoryList, productList };
}

async function fetchProductDetail(slug: string): Promise<ProductDetail | null> {
  const db = getDb();
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const related = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, row.product.categoryId),
        ne(products.id, row.product.id),
      ),
    )
    .orderBy(asc(products.sortOrder), asc(products.name))
    .limit(4);

  return {
    product: row.product,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    related,
  };
}

async function fetchProductSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const db = getDb();
  return db
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .orderBy(asc(products.slug));
}

/** Món nổi bật cho trang chủ — đã qua cache tag `catalog`. */
export const getFeaturedProducts = unstable_cache(
  fetchFeaturedProducts,
  ["catalog-featured-products"],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS },
);

/** Toàn bộ nhóm + món cho trang /menu — đã qua cache tag `catalog`. */
export const getMenuCatalog = unstable_cache(fetchMenuCatalog, [
  "catalog-menu",
], { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS });

/** Chi tiết 1 món theo slug (kèm món cùng nhóm) — cache theo từng slug. */
export const getProductDetail = unstable_cache(
  fetchProductDetail,
  ["catalog-product-detail"],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS },
);

/** Slug + updatedAt cho sitemap — đã qua cache tag `catalog`. */
export const getProductSlugsForSitemap = unstable_cache(fetchProductSlugs, [
  "catalog-sitemap-slugs",
], { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS });
