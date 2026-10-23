// Helper định dạng dùng chung.
// Giá tiền luôn là số nguyên VNĐ; hiển thị dạng "45.000₫" theo DESIGN.md mục 8.

const vndNumber = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export function formatVnd(amountVnd: number): string {
  return `${vndNumber.format(amountVnd)}₫`;
}
