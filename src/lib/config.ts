// Thông tin quán Happier Coffee — nguồn dùng chung cho Header/Footer và các
// trang thông tin (theo ARCHITECTURE.md mục 2: src/lib/config.ts).
//
// ⚠️ PLACEHOLDER (HAP-8): địa chỉ, số điện thoại, giờ mở cửa và link mạng xã
// hội dưới đây là nội dung MẪU để dựng layout. Nội dung thật của quán sẽ thay
// ở HAP-20 "[Chờ asset] Thay nội dung thật của quán".

export const shopConfig = {
  name: "Happier Coffee",
  tagline: "Cà phê ngon, đặt online dễ dàng",
  // Câu giới thiệu ngắn ở hero trang chủ (HAP-9) — nội dung mẫu, HAP-20 thay thật.
  description:
    "Hạt cà phê Việt Nam rang vừa, pha phin truyền thống hay espresso hiện đại — đặt online giao nhanh tận nơi, hoặc ghé quán tận hưởng không gian ấm cúng.",
  // Đoạn giới thiệu ngắn ở trang chủ (HAP-9) — nội dung mẫu, HAP-20 thay thật.
  about:
    "Happier Coffee bắt đầu từ một quán nhỏ với mong muốn đơn giản: một ly cà phê ngon, giá hợp lý và cảm giác dễ chịu mỗi lần ghé. Quán phục vụ cà phê pha phin, espresso, trà, matcha và bánh ngọt làm trong ngày — mọi món đều có thể đặt online và giao nhanh trong khu vực.",
  // Ảnh placeholder từ Unsplash (DESIGN.md mục 7) — HAP-20 thay ảnh thật.
  heroImage:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1600&auto=format&fit=crop",
  aboutImage:
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
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
