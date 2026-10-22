import type { Metadata } from "next";
import PlaceholderPage from "../PlaceholderPage";

export const metadata: Metadata = {
  title: "Giới thiệu — Happier Coffee",
  description: "Giới thiệu về quán cà phê Happier Coffee.",
};

// Placeholder (HAP-8): trang Giới thiệu thật thuộc HAP-18.
export default function AboutPage() {
  return (
    <PlaceholderPage
      title="Giới thiệu"
      note="Câu chuyện của quán sẽ được kể đầy đủ ở đây."
    />
  );
}
