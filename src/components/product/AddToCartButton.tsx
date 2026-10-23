"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

// Nút "Thêm vào giỏ" của ProductCard (HAP-9): nối vào CartProvider có sẵn
// (localStorage theo Quyết định A2). Trang giỏ hàng/checkout là HAP-11/12.
interface AddToCartButtonProps {
  productId: string;
  slug: string;
  name: string;
  priceVnd: number;
  imageUrl?: string | null;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  slug,
  name,
  priceVnd,
  imageUrl,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleClick = () => {
    addItem({ productId, slug, name, priceVnd, imageUrl });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-live="polite"
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-cta px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white transition hover:bg-coffee focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:pointer-events-none disabled:opacity-50"
    >
      {added ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <ShoppingCart className="h-4 w-4" aria-hidden />
      )}
      {added ? "Đã thêm" : "Thêm vào giỏ"}
    </button>
  );
}
