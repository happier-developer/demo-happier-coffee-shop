import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happier Coffee",
  description: "Website bán hàng của quán cà phê Happier — đặt món online, giao tận nơi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} antialiased`}>{children}</body>
    </html>
  );
}
