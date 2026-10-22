import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Ảnh món/hero dùng placeholder từ Unsplash (DESIGN.md mục 7).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
