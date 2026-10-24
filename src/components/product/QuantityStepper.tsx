"use client";

// Bộ điều chỉnh số lượng ngay tại thẻ sản phẩm / trang chi tiết
// (HAP-29, behavior kiểu Shopee) + nhập trực tiếp số lượng (HAP-31):
// hiển thị khi món ĐÃ có trong giỏ — [−] số lượng [+] đồng bộ hai
// chiều với CartProvider (localStorage): bấm +/− gọi updateQuantity;
// giảm về 0 thì món rời giỏ và component cha tự quay lại nút
// "Thêm vào giỏ". Sửa ở trang /gio-hang hay tab khác cũng phản ánh
// ngay vì cùng một nguồn dữ liệu giỏ.
//
// Ô số lượng là input gõ được (kiểu Shopee): chạm vào số là gõ ngay,
// chỉ nhận chữ số, mở bàn phím số trên mobile. Số đang gõ là bản nháp
// tách khỏi giỏ — chỉ chốt vào giỏ khi Enter hoặc blur: rỗng/sai thì
// hoàn số cũ, gõ 0 thì xóa món, Escape thì hủy nhập. Trong lúc đang
// gõ, số lượng đổi từ nơi khác (bấm +/−, sửa ở trang khác) không
// phá bản nháp; khi không gõ nữa, ô luôn hiển thị số thật của giỏ.

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

interface QuantityStepperProps {
  productId: string;
  /** Tên món — dùng cho aria-label của hai nút và ô nhập. */
  name: string;
  /** card: nút 36px (thẻ sản phẩm); detail: nút 44px (trang chi tiết). */
  size?: "card" | "detail";
  /**
   * Giới hạn trên cho nút + và khi chốt số gõ (trang giỏ: 99).
   * Không đặt = không giới hạn (thẻ/chi tiết, theo HAP-29).
   */
  maxQuantity?: number;
}

export default function QuantityStepper({
  productId,
  name,
  size = "card",
  maxQuantity,
}: QuantityStepperProps) {
  const { items, updateQuantity } = useCart();
  const quantity =
    items.find((item) => item.productId === productId)?.quantity ?? 0;

  // Bản nháp khi đang gõ (null = không gõ, hiển thị số thật của giỏ).
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Đồng bộ theo giỏ khi KHÔNG đang gõ trong ô (bấm +/−, sửa ở trang
  // khác, tab khác): giá trị hiển thị luôn là số thật của giỏ. Hook
  // phải đặt trước early return bên dưới (số lượng có thể về 0 rồi
  // tăng lại — thứ tự hook không được đổi theo render).
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(null);
    }
  }, [quantity]);

  // Món không còn trong giỏ (vừa giảm về 0 ở nơi khác): không render gì,
  // component cha đang hiển thị lại nút "Thêm vào giỏ".
  if (quantity <= 0) return null;

  const atMax = maxQuantity !== undefined && quantity >= maxQuantity;

  const commit = () => {
    // Chốt bản nháp vào giỏ (gọi từ onBlur; Enter chỉ blur để đi
    // chung một đường chốt duy nhất, tránh chốt trùng hai lần).
    if (draft === null) return;
    const raw = draft.trim();
    if (raw === "" || !/^\d+$/.test(raw)) {
      setDraft(null); // rỗng/sai: hoàn số cũ, không đổi giỏ.
      return;
    }
    let next = parseInt(raw, 10);
    if (maxQuantity !== undefined) next = Math.min(next, maxQuantity);
    setDraft(null);
    // next = 0 → cart-context xóa món khỏi giỏ.
    updateQuantity(productId, next);
  };

  const buttonSize = size === "detail" ? "h-11 w-11" : "h-9 w-9";
  const buttonClasses = `inline-flex ${buttonSize} items-center justify-center rounded-xl border border-line bg-surface text-coffee transition duration-state ease-standard active:scale-95 hover:border-caramel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:pointer-events-none disabled:opacity-50`;

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
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft ?? String(quantity)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setDraft(null); // hủy nhập, hoàn số cũ
        }}
        aria-label={`Số lượng ${name}, nhập số để thay đổi`}
        className="h-9 w-10 rounded-lg text-center font-bold text-coffee tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      />
      {/* Thông báo số lượng đã chốt cho trình đọc màn hình. */}
      <span className="sr-only" role="status">
        {`Số lượng ${name}: ${quantity}`}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(productId, quantity + 1)}
        disabled={atMax}
        aria-label={`Tăng số lượng ${name}`}
        className={buttonClasses}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
