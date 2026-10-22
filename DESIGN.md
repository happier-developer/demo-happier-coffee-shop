# DESIGN.md — Happier Coffee (Website bán hàng)

## 1. Tổng quan & brand
- Đối tượng: khách trẻ và dân văn phòng mua cà phê online + ghé quán.
- Giọng điệu: thân thiện, gọn, tin cậy. Xưng hô trung tính, ưu tiên tiếng Việt tự nhiên.
- Cảm giác chủ đạo: ấm áp của cà phê rang, sáng và tối giản — nhiều khoảng trắng, ảnh món là nhân vật chính.
- Nguyên tắc: mobile-first (đa số khách đặt hàng qua điện thoại).

## 2. Màu sắc (token)
| Token | Hex | Khi nào dùng |
|---|---|---|
| --color-cream | #FAF6EF | Nền trang chính |
| --color-surface | #FFFFFF | Nền card, form, bảng |
| --color-coffee | #3E2A20 | Chữ chính, header, footer |
| --color-caramel | #C08552 | Accent: giá, điểm nhấn, icon đang chọn |
| --color-cta | #A85B2A | Nút hành động chính (Đặt hàng, Thanh toán) |
| --color-muted | #8A7364 | Chữ phụ, mô tả, placeholder |
| --color-line | #E7DCCF | Đường viền, chia khối |
| --color-success | #4C8055 | Trạng thái đơn thành công / còn hàng |
| --color-warning | #C98A2D | Trạng thái chờ xác nhận, chờ thanh toán |
| --color-error | #B3402A | Lỗi form, hết hàng, đơn hủy |

## 3. Typography
- Font: "Be Vietnam Pro" (Google Fonts, hỗ trợ tiếng Việt đầy đủ) cho cả heading và body.
- Thang cỡ: 12 / 14 / 16 (body) / 20 / 24 / 32 / 40 (hero).
- Weight: 400 thường, 500 nhấn nhẹ, 700 tiêu đề và giá.
- Line-height: 1.5 cho đoạn văn, 1.2 cho tiêu đề.

## 4. Spacing & layout
- Đơn vị gốc 4px; khoảng cách chuẩn: 8 / 12 / 16 / 24 / 32 / 48.
- Container tối đa 1200px, padding ngang 16px (mobile) / 24px (desktop).
- Breakpoint: 640 / 768 / 1024 / 1280.
- Bo góc: 12px cho card và nút, 16px cho khối lớn (hero, banner).
- Lưới sản phẩm: 2 cột mobile, 3 cột tablet, 4 cột desktop.

## 5. Component
- Button: Primary (nền --color-cta, chữ trắng), Secondary (viền --color-coffee, nền trong), Ghost (chỉ chữ). Trạng thái: hover đậm hơn 8%, disabled mờ 50% + không bấm được, focus có viền rõ.
- ProductCard: ảnh 4:3, tên món, ghi chú ngắn, giá (700, --color-caramel), nút Thêm vào giỏ; hết hàng: ảnh xám + nhãn "Hết hàng".
- Badge trạng thái đơn: Chờ xác nhận (warning) / Đang chuẩn bị (caramel) / Đang giao (coffee) / Đã giao (success) / Đã hủy (error).
- Input: viền --color-line, bo 12px, nhãn phía trên, lỗi hiển thị chữ --color-error ngay dưới ô.
- Header: cố định trên cùng, nền cream mờ, logo trái, menu giữa, giỏ hàng + tài khoản phải.
- Footer: nền --color-coffee, chữ cream, 3 cột: liên hệ / giờ mở cửa / mạng xã hội.
- Bảng Admin: hàng cách nhau bằng --color-line, thao tác sửa/xóa ở cột cuối, xác nhận trước khi xóa.

## 6. Pattern & các màn hình chính
- Trang chủ: Hero (ảnh quán + CTA) → Món nổi bật (từ DB) → Giới thiệu ngắn → Cách đặt hàng 3 bước → Footer.
- Menu: thanh lọc theo nhóm món trên đầu, lưới ProductCard, bấm vào mở chi tiết.
- Chi tiết sản phẩm: ảnh lớn trái, thông tin + chọn số lượng + Thêm vào giỏ phải.
- Giỏ hàng: danh sách dòng món (ảnh nhỏ, tên, số lượng +/-, xóa), tổng tiền, nút Thanh toán.
- Checkout: form giao hàng → chọn VietQR/COD → (VietQR: hiện mã QR kèm mã đơn) → màn hình xác nhận có mã đơn.
- Tài khoản: đăng nhập/đăng ký (Neon Auth), hồ sơ, lịch sử đơn + chi tiết đơn.
- Admin: sidebar (Sản phẩm / Đơn hàng), bảng dữ liệu + form thêm/sửa.

## 7. Icon & hình ảnh
- Icon: Lucide (đồng nhất nét, nhẹ).
- Ảnh món: tỷ lệ 4:3, tối thiểu 800x600. Ảnh hero: 16:9.
- Demo: dùng ảnh cà phê từ Unsplash làm placeholder; thay bằng ảnh thật của quán ở issue "[Chờ asset] Thay nội dung thật của quán".

## 8. Nên / Không nên
- Nên: giá luôn hiển thị dạng 45.000₫; trạng thái đơn luôn có màu + chữ đi kèm; nút chính mỗi màn hình chỉ 1.
- Nên: giữ toàn bộ chữ tiếng Việt có dấu đúng chuẩn.
- Không nên: dùng màu ngoài bảng token; không dùng ảnh tỉ lệ tùy ý làm vỡ lưới; không đặt quá 1 CTA chính trong 1 khối.

## 9. Changelog thiết kế
- v1 (2026-10-23): bản đầu theo khung AI-DLC Factory T2 — Duy đã duyệt tại cổng G2 ngày 2026-10-23.
