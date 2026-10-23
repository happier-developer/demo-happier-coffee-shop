import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, ne } from "drizzle-orm";
import { ArrowLeft, Coffee } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/product/ProductCard";
import ProductPurchase from "@/components/product/ProductPurchase";
import { getDb } from "@/lib/db";
import {
  categories,
  products,
  type Product,
} from "@/lib/db/schema";
import { formatVnd } from "@/lib/format";

// Trang chi tiết sản phẩm (HAP-10) theo DESIGN.md mục 6: ảnh lớn bên
// trái, thông tin + chọn số lượng + Thêm vào giỏ bên phải. Slug sai →
// 404 (notFound). Render phía server như các trang storefront khác.
export const dynamic = "force-dynamic";

interface ProductDetail {
  product: Product;
  categoryName: string;
  categorySlug: string;
  related: Product[];
}

async function getProductDetail(slug: string): Promise<ProductDetail | null> {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const detail = await getProductDetail(slug);
    if (detail) {
      return {
        title: `${detail.product.name} — Happier Coffee`,
        description:
          detail.product.description ??
          `Đặt ${detail.product.name} tại Happier Coffee.`,
      };
    }
  } catch (error) {
    console.error("Không tải được metadata sản phẩm:", error);
  }
  return { title: "Chi tiết món — Happier Coffee" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let detail: ProductDetail | null = null;
  try {
    detail = await getProductDetail(slug);
  } catch (error) {
    console.error("Không tải được chi tiết sản phẩm:", error);
    return (
      <Container className="py-10 md:py-14">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <Coffee className="h-10 w-10 text-caramel" aria-hidden />
          <p className="font-medium text-coffee">
            Chưa tải được thông tin món
          </p>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Bạn vui lòng quay lại{" "}
            <Link href="/menu" className="font-medium text-cta">
              menu
            </Link>{" "}
            và thử lại trong ít phút nữa nhé.
          </p>
        </div>
      </Container>
    );
  }

  if (!detail) notFound();

  const { product, categoryName, categorySlug, related } = detail;

  return (
    <Container className="py-10 md:py-14">
      <Link
        href="/menu"
        className="mb-8 inline-flex items-center gap-1.5 font-medium text-cta transition hover:text-coffee"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Quay lại Menu
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Ảnh lớn bên trái */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line/40">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover ${
                product.isAvailable ? "" : "grayscale"
              }`}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-muted">
              <Coffee className="h-16 w-16" aria-hidden />
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-4 left-4 rounded-full bg-caramel px-3 py-1 text-xs font-medium text-white">
              Nổi bật
            </span>
          )}
          {!product.isAvailable && (
            <span className="absolute top-4 right-4 rounded-full bg-error px-3 py-1 text-xs font-medium text-white">
              Hết hàng
            </span>
          )}
        </div>

        {/* Thông tin + mua hàng bên phải */}
        <div className="flex flex-col items-start gap-4">
          <Link
            href={`/menu?nhom=${categorySlug}`}
            className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-coffee transition hover:border-caramel hover:text-cta"
          >
            {categoryName}
          </Link>
          <h1 className="text-3xl font-bold text-coffee md:text-4xl md:leading-[1.2]">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-base leading-relaxed text-muted">
              {product.description}
            </p>
          )}
          <p className="text-2xl font-bold text-caramel">
            {formatVnd(product.priceVnd)}
          </p>
          <div className="w-full border-t border-line pt-5">
            <ProductPurchase
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceVnd={product.priceVnd}
              imageUrl={product.imageUrl}
              disabled={!product.isAvailable}
            />
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Đặt online để quán chuẩn bị sẵn, hoặc ghé quán thưởng thức trực
            tiếp. Thanh toán bằng chuyển khoản VietQR hoặc tiền mặt khi nhận
            món (COD).
          </p>
        </div>
      </div>

      {/* Món cùng nhóm */}
      {related.length > 0 && (
        <section className="mt-14 md:mt-16" aria-label="Món cùng nhóm">
          <h2 className="mb-6 text-2xl font-bold text-coffee">
            Món cùng nhóm {categoryName}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
