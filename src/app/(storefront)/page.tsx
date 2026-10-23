import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Coffee,
  CreditCard,
  MapPin,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import { shopConfig } from "@/lib/config";
import { getDb } from "@/lib/db";
import { products, type Product } from "@/lib/db/schema";

// Trang chủ (HAP-9) theo pattern DESIGN.md mục 6:
// Hero → Món nổi bật (từ DB) → Giới thiệu ngắn → Cách đặt hàng 3 bước.
// Render phía server mỗi lần truy cập để món nổi bật luôn là dữ liệu thật
// mới nhất từ DB; lỗi DB chỉ làm khối món hiện trạng thái trống, trang
// vẫn hiển thị bình thường.
export const dynamic = "force-dynamic";

// Metadata trang chủ (HAP-19): không khai title (dùng title mặc định ở
// root layout), description + OG riêng với ảnh hero của trang chủ.
export const metadata: Metadata = {
  description: shopConfig.description,
  openGraph: {
    title: `${shopConfig.name} — ${shopConfig.tagline}`,
    description: shopConfig.description,
    images: [{ url: shopConfig.heroImage, alt: shopConfig.name }],
  },
};

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(products)
      .where(
        and(eq(products.isFeatured, true), eq(products.isAvailable, true)),
      )
      .orderBy(asc(products.sortOrder), asc(products.name))
      .limit(8);
  } catch (error) {
    console.error("Không tải được món nổi bật từ DB:", error);
    return [];
  }
}

const orderSteps = [
  {
    icon: ShoppingBag,
    title: "Chọn món",
    text: "Duyệt menu, thêm món yêu thích vào giỏ hàng.",
  },
  {
    icon: CreditCard,
    title: "Đặt hàng & thanh toán",
    text: "Điền thông tin giao hàng, chọn chuyển khoản VietQR hoặc trả khi nhận (COD).",
  },
  {
    icon: PackageCheck,
    title: "Nhận món",
    text: "Quán xác nhận, pha chế và giao đến tận nơi cho bạn.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section>
        <Container className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-start gap-5">
            <p className="text-sm font-medium tracking-wide text-caramel uppercase">
              {shopConfig.tagline}
            </p>
            <h1 className="text-4xl leading-[1.2] font-bold text-coffee md:text-[40px]">
              {shopConfig.name}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted">
              {shopConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/menu" variant="primary">
                Xem menu
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/menu" variant="secondary">
                Đặt hàng ngay
              </Button>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4 text-caramel" aria-hidden />
              {shopConfig.address}
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-line/40 lg:aspect-[4/3]">
            <Image
              src={shopConfig.heroImage}
              alt={`Không gian quán ${shopConfig.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* ---------- Món nổi bật (dữ liệu thật từ DB) ---------- */}
      <section className="py-4 md:py-8">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
                Món nổi bật
              </h2>
              <p className="mt-2 text-base text-muted">
                Những món được yêu thích nhất tại {shopConfig.name}.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 font-medium text-cta transition hover:text-coffee"
            >
              Xem tất cả menu
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
              <Coffee className="h-10 w-10 text-caramel" aria-hidden />
              <p className="font-medium text-coffee">
                Menu đang được cập nhật
              </p>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Các món nổi bật sẽ sớm xuất hiện tại đây. Bạn vẫn có thể ghé
                quán trực tiếp hoặc xem menu trong ít phút nữa.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* ---------- Giới thiệu ngắn ---------- */}
      <section className="mt-12 bg-surface md:mt-16">
        <Container className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line/40">
            <Image
              src={shopConfig.aboutImage}
              alt={`Giới thiệu về ${shopConfig.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-2xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
              Giới thiệu về {shopConfig.name}
            </h2>
            <p className="text-base leading-relaxed text-muted">
              {shopConfig.about}
            </p>
            <Button href="/gioi-thieu" variant="secondary">
              Tìm hiểu thêm
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </Container>
      </section>

      {/* ---------- Cách đặt hàng 3 bước ---------- */}
      <section>
        <Container className="py-12 md:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
            Đặt hàng trong 3 bước
          </h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {orderSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-6"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream text-cta">
                  <step.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-bold text-coffee">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
