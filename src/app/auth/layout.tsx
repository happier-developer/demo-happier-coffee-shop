import type { ReactNode } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { shopConfig } from "@/lib/config";

// Layout tối giản cho khu /auth/* (HAP-13): không dùng Header/Footer của
// storefront để form tập trung; chỉ có logo quay về trang chủ và thẻ form
// ở giữa màn hình trên nền cream theo DESIGN.md.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="flex justify-center py-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={`${shopConfig.name} — Trang chủ`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-coffee text-cream">
            <Coffee className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xl font-bold whitespace-nowrap text-coffee">
            Happier <span className="text-caramel">Coffee</span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
