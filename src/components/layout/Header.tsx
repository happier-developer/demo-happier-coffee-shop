"use client";

// Header storefront theo DESIGN.md mục 5: cố định trên cùng (sticky), nền
// cream mờ, logo trái, menu giữa, giỏ hàng + tài khoản phải.
// Trạng thái active của menu theo pathname hiện tại; trên mobile dùng menu
// hamburger mở/đóng được (có aria-expanded, đóng khi chọn mục hoặc đổi trang).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Coffee, Menu as MenuIcon, ShoppingCart, User, X } from "lucide-react";
import Container from "@/components/ui/Container";
import { mainNav, shopConfig } from "@/lib/config";
import { useCart } from "@/lib/cart/cart-context";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-2 text-[15px] transition ${
        active
          ? "font-semibold text-coffee underline decoration-caramel decoration-2 underline-offset-8"
          : "text-muted hover:bg-line/50 hover:text-coffee"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { totalQuantity, hydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Đổi trang thì đóng menu mobile (mẫu điều chỉnh state khi render,
  // thay cho useEffect — theo khuyến nghị của React).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const showBadge = hydrated && totalQuantity > 0;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo (chữ — logo thật thay ở HAP-20) */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            aria-label={`${shopConfig.name} — Trang chủ`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coffee text-cream">
              <Coffee className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-xl font-bold whitespace-nowrap text-coffee">
              Happier <span className="text-caramel">Coffee</span>
            </span>
          </Link>

          {/* Menu desktop */}
          <nav aria-label="Điều hướng chính" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    active={isActive(pathname, item.href)}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Giỏ hàng + tài khoản + nút menu mobile */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/gio-hang"
              aria-label={
                showBadge
                  ? `Giỏ hàng, ${totalQuantity} món`
                  : "Giỏ hàng"
              }
              className="relative rounded-full p-2 text-coffee transition hover:bg-line/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            >
              <ShoppingCart className="h-6 w-6" aria-hidden />
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cta px-1 text-[11px] font-bold text-white">
                  {totalQuantity}
                </span>
              )}
            </Link>

            <Link
              href="/auth/dang-nhap"
              className="inline-flex items-center gap-2 rounded-full border border-coffee/25 px-3 py-2 text-[15px] font-medium text-coffee transition hover:border-coffee hover:bg-coffee hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:px-4"
            >
              <User className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">Tài khoản</span>
            </Link>

            <button
              type="button"
              className="rounded-full p-2 text-coffee transition hover:bg-line/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <MenuIcon className="h-6 w-6" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Điều hướng chính trên di động"
          className="border-t border-line bg-cream md:hidden"
        >
          <Container>
            <ul className="flex flex-col py-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={
                      isActive(pathname, item.href) ? "page" : undefined
                    }
                    className={`block rounded-xl px-3 py-3 text-base transition ${
                      isActive(pathname, item.href)
                        ? "bg-coffee/5 font-semibold text-coffee underline decoration-caramel decoration-2 underline-offset-8"
                        : "text-muted hover:bg-line/50 hover:text-coffee"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
