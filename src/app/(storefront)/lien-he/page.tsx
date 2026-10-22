import type { Metadata } from "next";
import PlaceholderPage from "../PlaceholderPage";

export const metadata: Metadata = {
  title: "Liên hệ — Happier Coffee",
  description: "Thông tin liên hệ của Happier Coffee.",
};

// Placeholder (HAP-8): trang Liên hệ thật thuộc HAP-18.
export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Liên hệ"
      note="Thông tin liên hệ chi tiết sẽ được cập nhật tại đây."
    />
  );
}
