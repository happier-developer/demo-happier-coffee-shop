// Thông tin quán Happier Coffee — nguồn dùng chung cho Header/Footer và các
// trang thông tin (theo ARCHITECTURE.md mục 2: src/lib/config.ts).
//
// ⚠️ PLACEHOLDER (HAP-8): địa chỉ, số điện thoại, giờ mở cửa và link mạng xã
// hội dưới đây là nội dung MẪU để dựng layout. Nội dung thật của quán sẽ thay
// ở HAP-20 "[Chờ asset] Thay nội dung thật của quán".

export const shopConfig = {
  name: "Happier Coffee",
  tagline: "Cà phê ngon, đặt online dễ dàng",
  // Mẫu — thay bằng địa chỉ thật ở HAP-20
  address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  // Mẫu — thay bằng số thật ở HAP-20
  phone: "0901 234 567",
  phoneHref: "tel:+84901234567",
  email: "hello@happiercoffee.vn",
  emailHref: "mailto:hello@happiercoffee.vn",
  // Mẫu — thay bằng giờ mở cửa thật ở HAP-20
  openingHours: [
    { days: "Thứ 2 – Thứ 6", hours: "7:00 – 22:00" },
    { days: "Thứ 7 – Chủ nhật", hours: "7:00 – 23:00" },
  ],
  // Mẫu — thay bằng link thật ở HAP-20
  socials: [
    { label: "Facebook", href: "https://facebook.com/happiercoffee" },
    { label: "Instagram", href: "https://instagram.com/happiercoffee" },
    { label: "TikTok", href: "https://tiktok.com/@happiercoffee" },
  ],
} as const;

export const mainNav = [
  { label: "Trang chủ", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;
