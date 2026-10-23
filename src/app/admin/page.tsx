import type { Metadata } from "next";
import { ClipboardList, Package } from "lucide-react";

// Trang Tổng quan khu quản trị (HAP-15) — mới là KHUNG: guard đã nằm ở
// layout (chỉ admin mới tới được đây). Hai khối chức năng chính trỏ về
// các issue tiếp theo trong chuỗi: quản lý sản phẩm (HAP-16) và quản lý
// đơn hàng (HAP-17); khi các trang đó có thật, bỏ trạng thái "Sắp có"
// ở đây và ở sidebar trong layout.

export const metadata: Metadata = {
  title: "Tổng quan quản trị — Happier Coffee",
};

const SECTIONS = [
  {
    title: "Sản phẩm",
    issue: "HAP-16",
    icon: Package,
    description:
      "Thêm, sửa, ẩn/hiện món trong menu; cập nhật giá và tình trạng còn hàng của quán.",
  },
  {
    title: "Đơn hàng",
    issue: "HAP-17",
    icon: ClipboardList,
    description:
      "Xem đơn khách đặt, xác nhận thanh toán VietQR/COD và chuyển trạng thái đơn (đang chuẩn bị, đang giao, đã giao, huỷ).",
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-coffee">Tổng quan</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Khu quản trị của Happier Coffee. Chỉ tài khoản có email trong danh
        sách <span className="font-medium text-coffee">ADMIN_EMAILS</span>{" "}
        mới vào được khu này — cách chỉ định quản trị viên xem trong
        README, mục “Quản trị viên (admin)”.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-caramel" aria-hidden />
                <h2 className="text-xl font-bold text-coffee">
                  {section.title}
                </h2>
                <span className="ms-auto rounded-full bg-line/70 px-2.5 py-1 text-xs font-medium text-muted">
                  Sắp có · {section.issue}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">{section.description}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
