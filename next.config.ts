import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // HAP-15: bật cơ chế "auth interrupts" để forbidden() trong
    // src/lib/auth/admin.ts render trang 403 (src/app/forbidden.tsx)
    // với đúng mã HTTP 403 khi user đã đăng nhập nhưng không phải admin.
    authInterrupts: true,
  },
  images: {
    // Ảnh món/hero dùng placeholder từ Unsplash (DESIGN.md mục 7).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Ảnh VietQR động ở màn hình xác nhận đơn (HAP-12).
        protocol: "https",
        hostname: "img.vietqr.io",
      },
    ],
  },
};

export default nextConfig;
