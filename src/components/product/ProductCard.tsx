import Image from "next/image";
import Link from "next/link";
import { Coffee } from "lucide-react";
import type { Product } from "@/lib/db/schema";
import { formatVnd } from "@/lib/format";
import AddToCartButton from "./AddToCartButton";

// ProductCard theo DESIGN.md mục 5: ảnh 4:3, tên món, ghi chú ngắn, giá
// (weight 700, màu caramel), nút Thêm vào giỏ; món hết hàng: ảnh xám +
// nhãn "Hết hàng". Tên và ảnh bấm sang trang chi tiết /menu/[slug] (HAP-10).
export default function ProductCard({ product }: { product: Product }) {
  const detailHref = `/menu/${product.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] overflow-hidden bg-line/40"
        aria-label={product.name}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-cover transition duration-300 group-hover:scale-105 ${
              product.isAvailable ? "" : "grayscale"
            }`}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted">
            <Coffee className="h-10 w-10" aria-hidden />
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 rounded-full bg-caramel px-2.5 py-1 text-xs font-medium text-white">
            Nổi bật
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute top-3 right-3 rounded-full bg-error px-2.5 py-1 text-xs font-medium text-white">
            Hết hàng
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={detailHref}
          className="line-clamp-1 font-bold text-coffee transition hover:text-cta"
        >
          {product.name}
        </Link>
        {product.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold text-caramel">
            {formatVnd(product.priceVnd)}
          </span>
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceVnd={product.priceVnd}
            imageUrl={product.imageUrl}
            disabled={!product.isAvailable}
          />
        </div>
      </div>
    </article>
  );
}
