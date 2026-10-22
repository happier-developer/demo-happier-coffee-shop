import Link from "next/link";
import Container from "@/components/ui/Container";

// Trang chủ — bản stub giữ nguyên từ HAP-5. Trang chủ thật (hero, món nổi
// bật từ DB...) thuộc HAP-9; HAP-8 chỉ chuyển stub vào route group
// (storefront) để dùng chung Header/Footer.
export default function Home() {
  return (
    <Container className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-caramel uppercase">
        Happier Coffee
      </p>
      <h1 className="text-4xl font-bold text-coffee">
        Cà phê ngon, đặt online dễ dàng
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-muted">
        Website bán hàng của quán cà phê Happier đang được xây dựng theo quy
        trình AI-DLC Factory. Menu và đặt hàng trực tuyến sẽ sớm ra mắt.
      </p>
      <Link
        href="/api/health"
        className="rounded-xl bg-cta px-6 py-3 font-medium text-white transition hover:opacity-90"
      >
        Kiểm tra trạng thái hệ thống
      </Link>
    </Container>
  );
}
