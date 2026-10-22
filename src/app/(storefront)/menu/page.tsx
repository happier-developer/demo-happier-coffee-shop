import type { Metadata } from "next";
import PlaceholderPage from "../PlaceholderPage";

export const metadata: Metadata = {
  title: "Menu — Happier Coffee",
  description: "Thực đơn đồ uống và bánh của Happier Coffee.",
};

// Placeholder (HAP-8): trang Menu thật với lưới sản phẩm từ DB thuộc HAP-10.
export default function MenuPage() {
  return (
    <PlaceholderPage
      title="Menu"
      note="Thực đơn đầy đủ với từng món và giá sẽ ra mắt ở bước tiếp theo."
    />
  );
}
