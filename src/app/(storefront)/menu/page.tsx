import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Coffee } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/product/ProductCard";
import { getDb } from "@/lib/db";
import {
  categories,
  products,
  type Category,
  type Product,
} from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Menu — Happier Coffee",
  description:
    "Thực đơn cà phê, trà và bánh của Happier Coffee — lọc theo nhóm món, giá rõ ràng.",
};

// Trang Menu (HAP-10) theo DESIGN.md mục 6: thanh lọc theo nhóm món trên
// đầu (?nhom=<slug-nhom>, mặc định Tất cả), lưới ProductCard bên dưới.
// Render phía server mỗi lần truy cập để luôn hiển thị dữ liệu thật mới
// nhất từ DB; lỗi DB chỉ làm trang hiện trạng thái trống, không sập trang.
export const dynamic = "force-dynamic";

interface MenuData {
  categoryList: Category[];
  productsByCategoryId: Map<string, Product[]>;
}

async function getMenuData(): Promise<MenuData | null> {
  try {
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
    const productsByCategoryId = new Map<string, Product[]>();
    for (const product of productList) {
      const group = productsByCategoryId.get(product.categoryId) ?? [];
      group.push(product);
      productsByCategoryId.set(product.categoryId, group);
    }
    return { categoryList, productsByCategoryId };
  } catch (error) {
    console.error("Không tải được menu từ DB:", error);
    return null;
  }
}

function pillClasses(active: boolean): string {
  return `inline-flex items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta ${
    active
      ? "bg-coffee text-cream"
      : "border border-line bg-surface text-coffee hover:border-caramel hover:text-cta"
  }`;
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ nhom?: string | string[] }>;
}) {
  const params = await searchParams;
  const nhomParam = Array.isArray(params.nhom) ? params.nhom[0] : params.nhom;

  const data = await getMenuData();

  return (
    <Container className="py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
          Menu
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Chọn nhóm món để lọc nhanh, bấm vào món để xem chi tiết và thêm vào
          giỏ hàng.
        </p>
      </div>

      {data === null ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <Coffee className="h-10 w-10 text-caramel" aria-hidden />
          <p className="font-medium text-coffee">Menu đang được cập nhật</p>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Thực đơn sẽ sớm xuất hiện tại đây. Bạn vui lòng quay lại trong ít
            phút nữa nhé.
          </p>
        </div>
      ) : (
        <>
          {/* Thanh lọc theo nhóm món */}
          <nav
            aria-label="Lọc menu theo nhóm món"
            className="mb-10 flex flex-wrap gap-2"
          >
            <Link href="/menu" className={pillClasses(!nhomParam)}>
              Tất cả
            </Link>
            {data.categoryList.map((category) => (
              <Link
                key={category.id}
                href={`/menu?nhom=${category.slug}`}
                className={pillClasses(nhomParam === category.slug)}
                aria-current={nhomParam === category.slug ? "true" : undefined}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <MenuSections data={data} activeSlug={nhomParam ?? null} />
        </>
      )}
    </Container>
  );
}

function MenuSections({
  data,
  activeSlug,
}: {
  data: MenuData;
  activeSlug: string | null;
}) {
  const visibleCategories = data.categoryList.filter((category) => {
    if (activeSlug !== null && category.slug !== activeSlug) return false;
    return (data.productsByCategoryId.get(category.id) ?? []).length > 0;
  });

  if (visibleCategories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
        <Coffee className="h-10 w-10 text-caramel" aria-hidden />
        <p className="font-medium text-coffee">Nhóm này chưa có món</p>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Bạn xem thử các món ở{" "}
          <Link href="/menu" className="font-medium text-cta hover:text-coffee">
            toàn bộ menu
          </Link>{" "}
          nhé.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {visibleCategories.map((category) => {
        const items = data.productsByCategoryId.get(category.id) ?? [];
        return (
          <section key={category.id} aria-label={category.name}>
            <h2 className="mb-6 text-2xl font-bold text-coffee">
              {category.name}
            </h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
