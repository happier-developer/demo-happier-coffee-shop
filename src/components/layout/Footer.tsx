// Footer storefront theo DESIGN.md mục 5: nền --color-coffee, chữ cream,
// 3 cột liên hệ / giờ mở cửa / mạng xã hội + cột điều hướng và dòng bản quyền.
// Toàn bộ thông tin lấy từ src/lib/config.ts (nội dung mẫu — thay thật ở HAP-20).

import Link from "next/link";
import { Clock, Coffee, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { mainNav, shopConfig } from "@/lib/config";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-coffee text-cream">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: thương hiệu + liên hệ */}
          <div>
            <p className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream/10">
                <Coffee className="h-5 w-5" aria-hidden />
              </span>
              Happier <span className="-ml-1 text-caramel">Coffee</span>
            </p>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-cream/85">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-caramel" aria-hidden />
                <span>{shopConfig.address}</span>
              </li>
              <li>
                <a
                  href={shopConfig.phoneHref}
                  className="flex gap-2 transition hover:text-white"
                >
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-caramel" aria-hidden />
                  <span>{shopConfig.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={shopConfig.emailHref}
                  className="flex gap-2 transition hover:text-white"
                >
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-caramel" aria-hidden />
                  <span>{shopConfig.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 2: giờ mở cửa */}
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-5 w-5 text-caramel" aria-hidden />
              Giờ mở cửa
            </h2>
            <ul className="mt-4 space-y-3 text-[15px] text-cream/85">
              {shopConfig.openingHours.map((row) => (
                <li key={row.days} className="flex flex-col">
                  <span>{row.days}</span>
                  <span className="font-medium text-cream">{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: điều hướng */}
          <div>
            <h2 className="text-base font-semibold">Khám phá</h2>
            <ul className="mt-4 space-y-3 text-[15px]">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/85 transition hover:text-white hover:underline hover:decoration-caramel hover:underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/gio-hang"
                  className="text-cream/85 transition hover:text-white hover:underline hover:decoration-caramel hover:underline-offset-4"
                >
                  Giỏ hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: mạng xã hội */}
          <div>
            <h2 className="text-base font-semibold">Theo dõi quán</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-cream/85">
              Cập nhật món mới và ưu đãi trên các kênh của {shopConfig.name}.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {shopConfig.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-cream/30 px-4 py-2 text-sm font-medium transition hover:border-caramel hover:bg-caramel hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-cream/15 pt-6 text-sm text-cream/70">
          <p>
            © {year} {shopConfig.name}. Mọi quyền được bảo lưu.
          </p>
        </div>
      </Container>
    </footer>
  );
}
