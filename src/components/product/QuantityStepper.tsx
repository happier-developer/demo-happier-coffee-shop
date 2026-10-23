"use client";

// Bộ điều chỉnh số lượng ngay tại thẻ sản phẩm / trang chi tiết
// (HAP-29, behavior kiểu Shopee): hiển thị khi món ĐÃ có trong giỏ —
// [−] số lượng [+] đồng bộ hai chiều với CartProvider (localStorage):
// bấm +/− gọi updateQuantity; giảm về 0 thì món rời giỏ và component
// cha tự quay lại nút "Thêm vào giỏ". Sửa ở trang /gio-hang hay tab
// khác cũng phản ánh ngay vì cùng một nguồn dữ liệu giỏ.

import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

interface QuantityStepperProps {
  productId: string;
  /** Tên món — dùng cho aria-label của hai nút. */
  name: string;
  /** card: nút 36px (thẻ sản phẩm); detail: nút 44px (trang chi tiết). */
  size?: "card" | "detail";
}

export default function QuantityStepper({
  productId,
  name,
  size = "card",
}: QuantityStepperProps) {
  const { items, updateQuantity } = useCart();
  const quantity =
    items.find((item) => item.productId === productId)?.quantity ?? 0;

  // Món không còn trong giỏ (vừa giảm về 0 ở nơi khác): không render gì,
  // component cha đang hiển thị lại nút "Thêm vào giỏ".
  if (quantity <= 0) return null;

  const buttonSize = size === "detail" ? "h-11 w-11" : "h-9 w-9";
  const buttonClasses = `inline-flex ${buttonSize} items-center justify-center rounded-xl border border-line bg-surface text-coffee transition duration-state ease-standard active:scale-95 hover:border-caramel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta`;

  return (
    <div
      className="inline-flex items-center gap-1"
      role="group"
      aria-label={`Số lượng ${name} trong giỏ`}
    >
      <button
        type="button"
        onClick={() => updateQuantity(productId, quantity - 1)}
        aria-label={`Giảm số lượng ${name}`}
        className={buttonClasses}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span
        key={quantity}
        className="inline-block w-8 animate-pop-soft text-center font-bold text-coffee tabular-nums"
        role="status"
        aria-label={`Số lượng: ${quantity}`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(productId, quantity + 1)}
        aria-label={`Tăng số lượng ${name}`}
        className={buttonClasses}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
