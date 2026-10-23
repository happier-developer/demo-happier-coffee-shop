import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth/server";

// Trang tài khoản (HAP-13) — guard ở SERVER: chưa có phiên thì redirect
// về /auth/dang-nhap?next=/account để đăng nhập xong quay lại đúng trang.
// Trang nằm trong route group (storefront) để dùng chung Header/Footer;
// URL vẫn là /account. Nội dung v1 tối thiểu: thông tin tài khoản + nút
// Đăng xuất. Lịch sử đơn hàng là HAP-14, chưa làm ở đây.
//
// Trang đọc cookie phiên nên bắt buộc dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tài khoản của tôi — Happier Coffee",
};

function formatMemberSince(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/dang-nhap?next=/account");
  }

  const memberSince = formatMemberSince(user.createdAt);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Họ tên", value: user.name || "—" },
    { label: "Email", value: user.email },
    {
      label: "Trạng thái email",
      value: user.emailVerified ? "Đã xác thực" : "Chưa xác thực",
    },
  ];
  if (memberSince) {
    rows.push({ label: "Thành viên từ", value: memberSince });
  }

  return (
    <Container>
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="mb-6 text-3xl font-bold text-coffee">
          Tài khoản của tôi
        </h1>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <dl className="flex flex-col divide-y divide-line">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="font-medium break-all text-coffee">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-4 text-sm text-muted">
          Lịch sử đơn hàng sẽ hiển thị tại trang này trong bản cập nhật tiếp
          theo. Các đơn bạn đặt khi đã đăng nhập đều được gắn với tài khoản
          này.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/menu">Xem menu</Button>
          <SignOutButton />
        </div>
      </div>
    </Container>
  );
}
