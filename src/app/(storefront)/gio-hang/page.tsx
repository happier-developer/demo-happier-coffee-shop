import type { Metadata } from "next";
import PlaceholderPage from "../PlaceholderPage";

export const metadata: Metadata = {
  title: "Giỏ hàng — Happier Coffee",
  description: "Giỏ hàng của bạn tại Happier Coffee.",
};

// Placeholder (HAP-8): trang Giỏ hàng thật (danh sách món, sửa số lượng,
// tổng tiền, nút Thanh toán) thuộc HAP-11; checkout thuộc HAP-12.
export default function CartPage() {
  return (
    <PlaceholderPage
      title="Giỏ hàng"
      note="Giỏ hàng và thanh toán sẽ ra mắt ở bước tiếp theo."
    />
  );
}
