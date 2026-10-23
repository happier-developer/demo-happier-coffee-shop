import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
