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
- Button: Primary (nền --color-cta, chữ trắng), Secondary (viền --color-coffee, nền trong), Ghost (chỉ chữ). Trạng thái: hover đậm hơn 8%, pressed thu nhỏ theo thang ở mục 9, disabled mờ 50% + không bấm được, focus có viền rõ.
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

## 9. Micro-interactions
- Mục đích: mọi thao tác nhấn/bấm đều có phản hồi thị giác tức thì và nhất quán toàn site (storefront, auth, checkout, admin) — đặc biệt trên mobile, nơi không có hover.
- Token thời lượng (khai báo trong globals.css qua @theme): `--duration-press` 100ms (phản hồi khi nhấn) / `--duration-state` 150ms (hover, chuyển trạng thái) / `--duration-enter` 250ms (phần tử xuất hiện).
- Easing chuẩn: `--ease-standard` = cubic-bezier(0.2, 0, 0, 1) cho mọi transition/animation thuộc nhóm này.
- Press scale (qua trạng thái :active, không dùng JS): nút 0.97; nút icon nhỏ (stepper +/-, nút xoá, icon header) 0.95; thẻ ProductCard 0.99.
- Chỉ animate transform và opacity — không animate kích thước/vị trí gây layout shift (giữ hiệu năng của HAP-21).
- Hiệu ứng xuất hiện (keyframes trong globals.css): `pop` cho badge số lượng giỏ hàng ở Header và icon check của trạng thái "Đã thêm"; `pop-soft` cho số lượng ở stepper (giỏ hàng, trang chi tiết). Cả hai chỉ chạy transform: scale.
- Focus: vòng focus-visible màu caramel (--color-cta) thống nhất cho mọi phần tử tương tác.
- Tap highlight: tắt -webkit-tap-highlight-color mặc định ở phần tử tương tác.
- Giảm chuyển động: khi người dùng bật prefers-reduced-motion, mọi animation/transition (cả cũ lẫn mới) bị rút về ~0ms.
- Loading & pending ở khu admin (HAP-26): mọi route /admin/* có skeleton (animate-pulse, khối bg-line bám layout thật: tiêu đề, thẻ, dòng bảng/form) hiện ngay khi điều hướng; thao tác ghi đang chạy phải có spinner + chữ "Đang xử lý…" kèm nút disabled — không để màn hình đứng yên không phản hồi. Dữ liệu admin/đơn hàng không cache nên skeleton là cách chữa "đơ", không phải cache.
- Lối vào quản trị (HAP-25): nút "Quản trị" (icon LayoutDashboard, nền coffee chữ cream) ở Header storefront + khối "Khu vực quản trị" ở trang /account — chỉ render khi server xác nhận tài khoản là admin.
- Hiệu ứng click "giọt cà phê loang" (HAP-24, chỉ storefront — không áp dụng admin): khi nhấn chuột/tap, một giọt cà phê loang ra tại đúng điểm nhấn như giọt rơi vào sữa, kèm 1 vòng gợn mờ, rồi fade hết. Token: `--duration-drop` 700ms, easing `--ease-standard`, kích thước tối đa 56px (thu nhỏ từ 96px theo yêu cầu của Duy khi nghiệm thu HAP-24); giọt dùng radial-gradient từ token `--color-coffee` sang `--color-caramel` với alpha tối đa ~0.35 (không đậm hơn — tránh trông như vết lem). Keyframes trong globals.css: `coffee-drop` (giọt loang, scale 0.12 → 1) và `coffee-ring` (vòng gợn, scale 0.2 → 1.15), cả hai chỉ animate transform/opacity. Lớp hiệu ứng là overlay `pointer-events: none`, tối đa 5 giọt đồng thời, node tự dọn sau animation; khi prefers-reduced-motion bật thì tắt hoàn toàn (không sinh giọt).

- Stepper số lượng kiểu Shopee (HAP-29): khi món đã có trong giỏ, nút "Thêm vào giỏ" trên thẻ sản phẩm tự chuyển thành stepper [−] số [+] đồng bộ với giỏ (nút 36px ở thẻ, 44px ở trang chi tiết; viền line, nền surface, hover viền caramel, press scale 0.95; số lượng bold tabular-nums ở giữa, `pop-soft` khi đổi số). Giảm về 0 → món rời giỏ, nút trở về "Thêm vào giỏ". Món hết hàng không hiện stepper (giữ trạng thái khóa). Chiều cao stepper bằng chiều cao nút thêm để thẻ không nhảy layout.
- Nhập trực tiếp số lượng (HAP-31): số ở giữa stepper là ô input gõ được (kiểu Shopee) — chạm vào số là gõ ngay, chỉ nhận chữ số, mở bàn phím số trên mobile; Enter/blur chốt vào giỏ, rỗng/sai hoàn số cũ, gõ 0 xóa món, Escape hủy nhập. Ô input rộng 40px (đủ 2–3 chữ số), không animate khi đang gõ để tránh nhảy layout; trang giỏ dùng chung component với cap 99 (quá 99 kẹp về 99).

## 10. Blog (HAP-28)

- **Danh sách /blog:** lưới thẻ bài (ảnh bìa 16:9, meta ngày · tác giả chữ nhỏ uppercase màu muted, tiêu đề bold màu coffee — hover chuyển caramel, excerpt tối đa 3 dòng, liên kết "Đọc tiếp →"). Thẻ là một liên kết duy nhất tới bài viết.
- **Trang bài viết:** khổ đọc tối đa 720px căn giữa; tiêu đề 3xl–4xl; ảnh bìa bo góc 2xl tỉ lệ 16:9; nội dung dùng class `.post-content` trong globals.css — cỡ chữ 17px, line-height 1.8, H2 24px/H3 20px bold, trích dẫn có vạch trái caramel và chữ nghiêng muted, liên kết màu cta có gạch chân, ảnh trong bài bo góc 1rem. Chỉ dùng token màu hiện có, không thêm màu mới.
- **Editor trong admin (Tiptap):** khung viền line, bo góc xl; toolbar nền cream mờ, nút công cụ 36px (icon 18px), trạng thái active có nền cream + viền line + chữ cta; vùng soạn thảo dùng chính `.post-content` để bản soạn sát bản hiển thị. Nút/nề form giữ nguyên quy ước mục 5–6 và micro-interactions mục 9.
- **Nhãn trạng thái admin:** "Đã xuất bản" dùng cặp màu success, "Nháp" dùng cặp màu warning (nền nhạt + chấm tròn), cùng mẫu nhãn còn/hết hàng của sản phẩm.

## 11. Changelog thiết kế
- v1 (2026-10-23): bản đầu theo khung AI-DLC Factory T2 — Duy đã duyệt tại cổng G2 ngày 2026-10-23.
- v1.1 (2026-10-24): thêm mục 9 Micro-interactions (HAP-23).
- v1.2 (2026-10-24): bổ sung hiệu ứng click "giọt cà phê loang" vào mục 9 (HAP-24).
- v1.3 (2026-10-24): lối vào quản trị cho admin (HAP-25) + quy ước loading skeleton/pending ở khu admin (HAP-26), mục 9.
- v1.4 (2026-10-24): thu nhỏ hiệu ứng giọt cà phê loang từ 96px xuống 56px (HAP-24).
- v1.5 (2026-10-24): mục 10 mới — quy ước Blog (thẻ bài, khổ đọc .post-content, editor Tiptap trong admin, nhãn Nháp/Đã xuất bản) cho HAP-28.
- v1.6 (2026-10-24): quy ước stepper số lượng kiểu Shopee cho nút Thêm vào giỏ (HAP-29), bổ sung ở mục 9.
- v1.7 (2026-10-24): ảnh LCP (hero trang chủ, ảnh bìa Blog, ảnh chi tiết món, ảnh Giới thiệu) phải có cả `priority` và `fetchPriority="high"` — chỉ `priority` thì Next không sinh fetchpriority cho thẻ preload, Lighthouse báo LCP request discovery FAIL (HAP-30).
- v1.8 (2026-10-24): SDK auth (Neon Auth) không được import tĩnh trong Header — tách thành SessionProvider + SessionLoader tải lười sau lần render đầu (HAP-30 vòng 2), giảm ~70 KiB gzip JS đầu trang; Header chỉ dùng context nhẹ. Trạng thái mặc định lúc chờ vẫn là nút "Tài khoản" như khi SSR.
- v1.9 (2026-10-24): số lượng ở stepper thành ô input gõ trực tiếp kiểu Shopee (HAP-31), bổ sung ở mục 9; trang giỏ dùng chung QuantityStepper thay stepper inline riêng.
