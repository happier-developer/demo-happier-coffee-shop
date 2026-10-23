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

// --- Nội dung trang Giới thiệu + Liên hệ (HAP-18) --------------------------
// ⚠️ NỘI DUNG MẪU — thay bằng nội dung thật ở HAP-20. Toàn bộ chữ hiển thị
// trên 2 trang /gioi-thieu và /lien-he nằm ở khối này (cùng shopConfig phía
// trên cho địa chỉ/giờ/SĐT/email), trang chỉ render từ config, không hardcode
// text trong JSX — khi có nội dung thật chỉ sửa đúng file này.

export const aboutContent = {
  // Ảnh mẫu Unsplash chủ đề cà phê (DESIGN.md mục 7) — thay ảnh thật ở HAP-20.
  heroImage:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop",
  heroImageAlt: "Ly cà phê cùng hạt cà phê rang (ảnh mẫu)",
  heading: "Câu chuyện của Happier Coffee",
  lead: "Một quán cà phê Việt Nam nhỏ ở Quận 1 — nơi hạt cà phê rang mới, không gian ấm cúng và những ly đồ uống làm tử tế gặp nhau.",
  storyTitle: "Bắt đầu từ một ly cà phê tử tế",
  storyImage:
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1200&auto=format&fit=crop",
  storyImageAlt: "Barista đang rót sữa tạo hình trên ly cà phê (ảnh mẫu)",
  story: [
    "Happier Coffee bắt đầu từ một quầy cà phê nhỏ với mong muốn giản dị: ai ghé quán cũng có một ly cà phê tử tế — hạt ngon, pha đúng gu, giá dễ chịu — và vài phút thảnh thơi giữa một ngày bận rộn.",
    "Quán chọn hạt Robusta từ Đắk Lắk và Arabica từ Cầu Đất, rang theo mẻ nhỏ mỗi tuần để giữ trọn hương thơm. Bên cạnh phin truyền thống, thực đơn có espresso, cold brew ủ chậm 16 giờ, trà trái cây tươi và matcha — và được làm mới theo mùa.",
    "Từ ngày bán thêm online, Happier Coffee vẫn giữ nguyên cách làm đó: mỗi đơn hàng chỉ được pha sau khi bạn đặt, đóng gói cẩn thận và giao nhanh, để ly cà phê tới tay vẫn ngon như uống tại quán.",
  ],
  highlightsTitle: "Điều làm nên Happier Coffee",
  highlightsIntro:
    "Bốn điều quán luôn giữ, từ ly cà phê tại quầy tới đơn hàng giao tận nơi.",
  // icon: khóa tra sang component Lucide ở trang Giới thiệu.
  highlights: [
    {
      icon: "coffee",
      title: "Hạt Việt, rang mới mỗi tuần",
      text: "Robusta Đắk Lắk và Arabica Cầu Đất rang theo mẻ nhỏ, xay ngay trước khi pha để hương vị luôn tươi và đậm.",
    },
    {
      icon: "leaf",
      title: "Nguyên liệu tươi trong ngày",
      text: "Sữa tươi, trái cây theo mùa và bánh nướng tại quán mỗi sáng — quán không dùng hương liệu công nghiệp.",
    },
    {
      icon: "zap",
      title: "Pha sau khi đặt, giao nhanh",
      text: "Đơn online chỉ bắt đầu pha khi bạn xác nhận, đóng gói giữ nhiệt và giao nhanh trong khu vực trung tâm.",
    },
    {
      icon: "heart",
      title: "Giá dễ chịu, phục vụ tận tâm",
      text: "Thực đơn từ 25.000₫ và barista luôn sẵn sàng chỉnh độ ngọt, lượng đá, gu cà phê theo đúng sở thích của bạn.",
    },
  ],
  cta: {
    title: "Thèm một ly cà phê ngon?",
    text: "Xem thực đơn hôm nay và đặt món — quán pha ngay sau khi bạn đặt.",
    buttonLabel: "Xem menu",
    href: "/menu",
  },
} as const;

export const contactContent = {
  heading: "Liên hệ với quán",
  lead: "Ghé quán thưởng thức tại chỗ, gọi điện đặt trước hoặc nhắn Zalo — đội ngũ Happier Coffee luôn sẵn sàng hỗ trợ bạn.",
  infoTitle: "Thông tin quán",
  mapTitle: "Bản đồ vị trí Happier Coffee",
  directionsLabel: "Mở chỉ đường",
  callLabel: "Gọi ngay",
  zaloLabel: "Nhắn Zalo",
  cta: {
    title: "Không tiện ghé quán? Đặt online, giao tận nơi",
    text: "Toàn bộ thực đơn đều có trên website — đặt món trong vài phút, quán xác nhận và giao nhanh tới bạn.",
    buttonLabel: "Xem menu",
    href: "/menu",
  },
} as const;

// URL production chính thức của website — NGUỒN DUY NHẤT cho metadataBase,
// Open Graph, sitemap.xml và robots.txt (HAP-19). Khi quán có domain riêng
// thì chỉ đổi đúng hằng số này (và thêm domain vào Neon Auth trusted
// domains — xem README mục Deploy).
export const siteUrl = "https://demo-happier-coffee-shop.vercel.app";

// Link Zalo suy ra từ SĐT trong shopConfig (bỏ khoảng trắng) — thay SĐT ở
// shopConfig là link tự cập nhật, không phải sửa thêm chỗ nào khác.
export const zaloHref = `https://zalo.me/${shopConfig.phone.replace(/\s+/g, "")}`;

// Nhúng bản đồ Google Maps không cần API key: truy vấn chính địa chỉ trong
// shopConfig, output=embed để dùng trong iframe.
export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  shopConfig.address,
)}&output=embed`;

// Link mở Google Maps (ứng dụng/web) tới đúng địa chỉ quán.
export const mapDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  shopConfig.address,
)}`;

export const mainNav = [
  { label: "Trang chủ", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Blog", href: "/blog" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

// --- VietQR (HAP-12) -------------------------------------------------------
// Thông tin nhận tiền của quán đọc từ env NEXT_PUBLIC_BANK_* (công khai,
// được phép ở client — ARCHITECTURE.md mục 5). Env hiện CHƯA đặt trên
// Vercel nên dùng bộ PLACEHOLDER rõ ràng dưới đây để demo luồng checkout;
// khi quán cung cấp số tài khoản thật chỉ cần đặt 3 biến env, không sửa code.

const BANK_NAMES_BY_BIN: Record<string, string> = {
  "970436": "Vietcombank",
  "970415": "VietinBank",
  "970418": "BIDV",
  "970416": "ACB",
  "970422": "MB Bank",
  "970407": "Techcombank",
  "970432": "VPBank",
  "970423": "TPBank",
};

const PLACEHOLDER_BANK = {
  bin: "970436",
  account: "0123456789",
  accountName: "HAPPIER COFFEE (DEMO)",
} as const;

export interface BankConfig {
  bin: string;
  account: string;
  accountName: string;
  bankName: string;
  /** true khi đang dùng thông tin mẫu (chưa có env thật). */
  isPlaceholder: boolean;
}

function resolveBankConfig(): BankConfig {
  const bin = process.env.NEXT_PUBLIC_BANK_BIN?.trim();
  const account = process.env.NEXT_PUBLIC_BANK_ACCOUNT?.trim();
  const accountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME?.trim();

  // Chỉ dùng env khi đủ cả 3 giá trị; thiếu một phần thì dùng trọn bộ
  // placeholder để tránh QR nửa thật nửa mẫu gây nhầm lẫn.
  const resolved =
    bin && account && accountName
      ? { bin, account, accountName, isPlaceholder: false }
      : { ...PLACEHOLDER_BANK, isPlaceholder: true };

  return {
    ...resolved,
    bankName:
      BANK_NAMES_BY_BIN[resolved.bin] ?? `Ngân hàng (mã ${resolved.bin})`,
  };
}

export const bankConfig: BankConfig = resolveBankConfig();

/**
 * URL ảnh VietQR động (img.vietqr.io) kèm số tiền và nội dung chuyển khoản
 * = mã đơn, để admin đối soát khi tiền về (xác nhận tay ở HAP-17).
 */
export function buildVietQrImageUrl(code: string, amountVnd: number): string {
  const params = new URLSearchParams({
    amount: String(amountVnd),
    addInfo: code,
    accountName: bankConfig.accountName,
  });
  return `https://img.vietqr.io/image/${bankConfig.bin}-${bankConfig.account}-compact2.png?${params.toString()}`;
}
