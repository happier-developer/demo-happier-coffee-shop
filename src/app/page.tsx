import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-center gap-6 px-4 text-center">
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
    </main>
  );
}
