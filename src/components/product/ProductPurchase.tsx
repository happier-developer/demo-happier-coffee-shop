"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import QuantityStepper from "./QuantityStepper";
import { useCart } from "@/lib/cart/cart-context";

// Khối mua hàng ở trang chi tiết sản phẩm (HAP-10) theo DESIGN.md mục 6:
// chọn số lượng + nút Thêm vào giỏ. Từ HAP-29: khi món ĐÃ có trong giỏ,
// khối mua hàng chuyển sang stepper đồng bộ với giỏ (QuantityStepper
// cỡ detail) kèm dòng trạng thái — khách chỉnh số lượng ngay tại đây
// thay vì chọn lại số rồi bấm thêm chồng lên. Món hết hàng
// (isAvailable = false): toàn bộ điều khiển bị vô hiệu hóa.
interface ProductPurchaseProps {
  productId: string;
  slug: string;
  name: string;
  priceVnd: number;
  imageUrl?: string | null;
  disabled?: boolean;
}

const MAX_QUANTITY = 99;

export default function ProductPurchase({
  productId,
  slug,
  name,
  priceVnd,
  imageUrl,
  disabled = false,
}: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const { items, hydrated } = useCart();
  const cartQuantity = hydrated
    ? (items.find((item) => item.productId === productId)?.quantity ?? 0)
    : 0;

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1));

  const stepperButtonClasses =
    "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-coffee transition duration-state ease-standard active:scale-95 hover:border-caramel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:pointer-events-none disabled:opacity-50";

  // Đã có trong giỏ → stepper đồng bộ (trừ khi món vừa hết hàng:
  // giữ toàn bộ điều khiển bị khóa như trước).
  if (!disabled && cartQuantity > 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper productId={productId} name={name} size="detail" />
          <p className="text-sm text-muted" role="status">
            Đã có {cartQuantity} trong giỏ — chỉnh số lượng ngay tại đây
            hoặc trong giỏ hàng.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="inline-flex items-center gap-1"
          aria-label="Chọn số lượng"
        >
          <button
            type="button"
            onClick={decrease}
            disabled={disabled || quantity <= 1}
            aria-label="Giảm số lượng"
            className={stepperButtonClasses}
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span
            key={quantity}
            className="inline-block w-10 animate-pop-soft text-center font-bold text-coffee tabular-nums"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={increase}
            disabled={disabled || quantity >= MAX_QUANTITY}
            aria-label="Tăng số lượng"
            className={stepperButtonClasses}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="[&_button]:h-11 [&_button]:px-6 [&_button]:text-base">
          <AddToCartButton
            productId={productId}
            slug={slug}
            name={name}
            priceVnd={priceVnd}
            imageUrl={imageUrl}
            quantity={quantity}
            disabled={disabled}
          />
        </div>
      </div>
      {disabled && (
        <p className="text-sm font-medium text-error">
          Món này đang hết hàng — bạn vui lòng chọn món khác nhé.
        </p>
      )}
    </div>
  );
}
