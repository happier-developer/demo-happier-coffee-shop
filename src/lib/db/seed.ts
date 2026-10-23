import { neon } from "@neondatabase/serverless";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { blogPosts, categories, orders, products } from "./schema.ts";

// Seed dữ liệu mẫu cho Happier Coffee (HAP-7, bổ sung HAP-27): 3 categories,
// 39 products (14 món gốc + 25 món bổ sung cho menu demo phong phú hơn).
// Chạy bằng: npm run db:seed (đọc DATABASE_URL từ env hoặc .env.local).
//
// IDEMPOTENT theo slug: chạy lại chỉ cập nhật bản ghi trùng slug, không nhân đôi.
// AN TOÀN với dữ liệu thật:
// - Chỉ upsert đúng các slug trong file này, KHÔNG bao giờ xóa sản phẩm —
//   sản phẩm đã bị order_items tham chiếu giữ nguyên id nên đơn hàng cũ
//   không bị ảnh hưởng; bảng orders/order_items không bị đụng tới.
// - (HAP-27) Bỏ chốt chặn "có đơn là dừng seed" của HAP-7: chốt đó chỉ để
//   bảo vệ lần seed đầu tiên; upsert theo slug an toàn khi đã có đơn thật.

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Không có .env.local: dựa vào biến môi trường của shell/CI.
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL chưa được cấu hình (env hoặc .env.local) — không seed được.",
  );
}

const db = drizzle(neon(databaseUrl), {
  schema: { categories, products, orders },
});

const CATEGORY_SEED = [
  { name: "Cà phê", slug: "ca-phe", sortOrder: 1 },
  { name: "Trà & Matcha", slug: "tra-matcha", sortOrder: 2 },
  { name: "Bánh & Ăn nhẹ", slug: "banh-an-nhe", sortOrder: 3 },
] as const;

type CategorySlug = (typeof CATEGORY_SEED)[number]["slug"];

const PRODUCT_SEED: ReadonlyArray<{
  categorySlug: CategorySlug;
  name: string;
  slug: string;
  description: string;
  priceVnd: number;
  imageUrl: string;
  isFeatured: boolean;
  // Mặc định true (còn hàng); chỉ khai báo khi muốn món ở trạng thái hết hàng.
  isAvailable?: boolean;
  sortOrder: number;
}> = [
  // --- Cà phê ---
  {
    categorySlug: "ca-phe",
    name: "Cà phê sữa đá",
    slug: "ca-phe-sua-da",
    description:
      "Cà phê robusta pha phin truyền thống, sữa đặc béo ngậy, uống kèm đá — món chủ lực của quán.",
    priceVnd: 29000,
    imageUrl:
      "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    categorySlug: "ca-phe",
    name: "Espresso",
    slug: "espresso",
    description:
      "Shot espresso đậm vị từ hạt arabica rang vừa, lớp crema vàng óng.",
    priceVnd: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 2,
  },
  {
    categorySlug: "ca-phe",
    name: "Bạc xỉu",
    slug: "bac-xiu",
    description:
      "Bạc xỉu Sài Gòn: nhiều sữa, ít cà phê, ngọt dịu và thơm nhẹ — dễ uống cho người mới.",
    priceVnd: 32000,
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 3,
  },
  {
    categorySlug: "ca-phe",
    name: "Cappuccino",
    slug: "cappuccino",
    description:
      "Espresso, sữa nóng và lớp bọt sữa mịn dày, rắc nhẹ bột cacao.",
    priceVnd: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 4,
  },
  {
    categorySlug: "ca-phe",
    name: "Latte",
    slug: "latte",
    description: "Espresso pha sữa tươi đánh nóng, vị êm dịu, vẽ latte art.",
    priceVnd: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1561047029-3000c68339ca?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 5,
  },
  {
    categorySlug: "ca-phe",
    name: "Cold brew",
    slug: "cold-brew",
    description:
      "Cà phê ủ lạnh 18 giờ, vị thanh, hậu ngọt tự nhiên, ít chua ít đắng.",
    priceVnd: 49000,
    imageUrl:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 6,
  },
  // --- Trà & Matcha ---
  {
    categorySlug: "tra-matcha",
    name: "Matcha latte",
    slug: "matcha-latte",
    description:
      "Matcha Nhật Bản whisk tay, pha sữa tươi, vị chát nhẹ béo thơm.",
    priceVnd: 49000,
    imageUrl:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà đào cam sả",
    slug: "tra-dao-cam-sa",
    description:
      "Trà đen ủ đào, thêm cam tươi và sả thơm, kèm miếng đào giòn ngọt.",
    priceVnd: 39000,
    imageUrl:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà sen vàng",
    slug: "tra-sen-vang",
    description:
      "Trà ô long ướp hương sen, vị thanh mát, hậu ngọt dịu.",
    priceVnd: 39000,
    imageUrl:
      "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 3,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà vải hoa hồng",
    slug: "tra-vai-hoa-hong",
    description: "Trà lài ướp vải thiều và cánh hoa hồng, thơm nhẹ, ngọt thanh.",
    priceVnd: 42000,
    imageUrl:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 4,
  },
  // --- Bánh & Ăn nhẹ ---
  {
    categorySlug: "banh-an-nhe",
    name: "Croissant bơ",
    slug: "croissant-bo",
    description: "Bánh sừng bò nhiều lớp, vỏ giòn rụm, thơm bơ Pháp.",
    priceVnd: 32000,
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 1,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Tiramisu",
    slug: "tiramisu",
    description:
      "Tiramisu mascarpone mềm mịn, thấm cà phê espresso, phủ cacao đắng nhẹ.",
    priceVnd: 55000,
    imageUrl:
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Cheesecake chanh dây",
    slug: "cheesecake-chanh-day",
    description:
      "Cheesecake nướng đế bánh quy, phủ sốt chanh dây chua ngọt cân bằng.",
    priceVnd: 52000,
    imageUrl:
      "https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 3,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Bánh flan cà phê",
    slug: "flan-ca-phe",
    description:
      "Flan trứng sữa mềm mịn với lớp caramel cà phê — món tráng miệng nhẹ nhàng.",
    priceVnd: 25000,
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 4,
  },
  // --- Bổ sung HAP-27: +25 món cho menu demo (tổng 39) ---
  // --- Cà phê (tiếp nối sortOrder 7-16) ---
  {
    categorySlug: "ca-phe",
    name: "Cà phê đen đá",
    slug: "ca-phe-den-da",
    description:
      "Cà phê phin đen nguyên chất, đậm và tỉnh, thêm chút đường theo khẩu vị.",
    priceVnd: 25000,
    imageUrl:
      "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 7,
  },
  {
    categorySlug: "ca-phe",
    name: "Cà phê muối",
    slug: "ca-phe-muoi",
    description:
      "Đặc sản Huế: cà phê phin phủ lớp kem muối mặn nhẹ, béo thơm, hậu vị lạ miệng.",
    priceVnd: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 8,
  },
  {
    categorySlug: "ca-phe",
    name: "Cà phê trứng",
    slug: "ca-phe-trung",
    description:
      "Cà phê Hà Nội với lớp kem trứng đánh bông mịn như bánh, ngọt dịu béo ngậy.",
    priceVnd: 39000,
    imageUrl:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 9,
  },
  {
    categorySlug: "ca-phe",
    name: "Americano đá",
    slug: "americano-da",
    description:
      "Espresso pha loãng đá lạnh, vị sạch, đậm vừa — lựa chọn ít ngọt, ít calo.",
    priceVnd: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 10,
  },
  {
    categorySlug: "ca-phe",
    name: "Mocha",
    slug: "mocha",
    description:
      "Espresso hòa quyện socola và sữa nóng, phủ kem tươi — ngọt ấm, dễ uống.",
    priceVnd: 49000,
    imageUrl:
      "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 11,
  },
  {
    categorySlug: "ca-phe",
    name: "Caramel macchiato",
    slug: "caramel-macchiato",
    description:
      "Sữa tươi, espresso và sốt caramel xếp lớp đẹp mắt, vị ngọt thơm rõ nét.",
    priceVnd: 52000,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 12,
  },
  {
    categorySlug: "ca-phe",
    name: "Flat white",
    slug: "flat-white",
    description:
      "Double ristretto với lớp sữa micro-foam mỏng mịn, vị cà phê rõ và êm.",
    priceVnd: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 13,
  },
  {
    categorySlug: "ca-phe",
    name: "Cà phê cốt dừa",
    slug: "ca-phe-cot-dua",
    description:
      "Cà phê xay cùng cốt dừa và đá bào, béo thơm kiểu miền Tây, mát lạnh sảng khoái.",
    priceVnd: 39000,
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 14,
  },
  {
    categorySlug: "ca-phe",
    name: "Espresso tonic",
    slug: "espresso-tonic",
    description:
      "Shot espresso rót trên nước tonic có ga và lát cam — chua nhẹ, sảng khoái, lạ miệng.",
    priceVnd: 55000,
    imageUrl:
      "https://images.unsplash.com/photo-1524350876685-274059332603?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    isAvailable: false,
    sortOrder: 15,
  },
  {
    categorySlug: "ca-phe",
    name: "Affogato",
    slug: "affogato",
    description:
      "Viên kem vani dội shot espresso nóng — món tráng miệng kiểu Ý, ăn ngay khi kem vừa tan.",
    priceVnd: 59000,
    imageUrl:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 16,
  },
  // --- Trà & Matcha (tiếp nối sortOrder 5-12) ---
  {
    categorySlug: "tra-matcha",
    name: "Matcha cốt dừa",
    slug: "matcha-cot-dua",
    description:
      "Matcha whisk tay pha nước cốt dừa béo nhẹ, thơm dịu, màu xanh bắt mắt.",
    priceVnd: 52000,
    imageUrl:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 5,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà ô long sữa",
    slug: "tra-o-long-sua",
    description:
      "Ô long rang thơm đậm, pha sữa tươi béo vừa, hậu vị trà rõ và sạch.",
    priceVnd: 42000,
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 6,
  },
  {
    categorySlug: "tra-matcha",
    name: "Hồng trà sữa trân châu",
    slug: "hong-tra-sua-tran-chau",
    description:
      "Hồng trà đậm vị pha sữa, kèm trân châu đen dai mềm nấu đường nâu.",
    priceVnd: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 7,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà chanh mật ong",
    slug: "tra-chanh-mat-ong",
    description:
      "Trà đen mát lạnh pha chanh tươi và mật ong — chua ngọt cân bằng, giải khát nhanh.",
    priceVnd: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1437418747212-8d9709afab22?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 8,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà gừng mật ong",
    slug: "tra-gung-mat-ong",
    description:
      "Trà gừng nóng ấm bụng, ngọt dịu mật ong — hợp ngày mưa và lúc cần thư giãn.",
    priceVnd: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 9,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà hoa cúc táo đỏ",
    slug: "tra-hoa-cuc-tao-do",
    description:
      "Trà hoa cúc ủ táo đỏ và kỷ tử, thanh nhẹ, thơm dịu, dễ ngủ.",
    priceVnd: 39000,
    imageUrl:
      "https://images.unsplash.com/photo-1587080413959-06b859fb107d?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 10,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà dâu tằm",
    slug: "tra-dau-tam",
    description:
      "Trà lài pha siro dâu tằm nhà làm, chua ngọt tự nhiên, màu đỏ tím đẹp mắt.",
    priceVnd: 42000,
    imageUrl:
      "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 11,
  },
  {
    categorySlug: "tra-matcha",
    name: "Trà tắc mật ong",
    slug: "tra-tac-mat-ong",
    description:
      "Trà xanh pha tắc tươi và mật ong, thơm mát, vị chua dịu — món tủ mùa nóng.",
    priceVnd: 32000,
    imageUrl:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    isAvailable: false,
    sortOrder: 12,
  },
  // --- Bánh & Ăn nhẹ (tiếp nối sortOrder 5-11) ---
  {
    categorySlug: "banh-an-nhe",
    name: "Croissant socola",
    slug: "croissant-socola",
    description:
      "Sừng bò ngàn lớp nhân socola đắng nhẹ, nướng giòn thơm bơ.",
    priceVnd: 38000,
    imageUrl:
      "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    sortOrder: 5,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Bánh chuối nướng",
    slug: "banh-chuoi-nuong",
    description:
      "Bánh chuối nướng cốt dừa kiểu miền Tây, mềm ẩm, ngọt vừa, thơm nức.",
    priceVnd: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 6,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Cookie socola chip",
    slug: "cookie-socola-chip",
    description:
      "Cookie nướng trong ngày, vỏ giòn rìa mềm giữa, đầy hạt socola chip.",
    priceVnd: 28000,
    imageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 7,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Mousse chanh dây",
    slug: "mousse-chanh-day",
    description:
      "Mousse kem mịn vị chanh dây chua thanh, đế bánh quy bơ giòn nhẹ.",
    priceVnd: 48000,
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 8,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Tart trứng",
    slug: "tart-trung",
    description:
      "Tart trứng kiểu Hong Kong: vỏ ngàn lớp giòn, nhân trứng sữa béo mịn, nướng vàng mặt.",
    priceVnd: 30000,
    imageUrl:
      "https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    isAvailable: false,
    sortOrder: 9,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Panna cotta",
    slug: "panna-cotta",
    description:
      "Panna cotta kem sữa mềm tan, phủ sốt dâu chua ngọt, ăn lạnh.",
    priceVnd: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 10,
  },
  {
    categorySlug: "banh-an-nhe",
    name: "Sandwich gà nướng",
    slug: "sandwich-ga-nuong",
    description:
      "Sandwich bánh mì nướng giòn kẹp ức gà ướp thảo mộc, xà lách và sốt mật ong mù tạt.",
    priceVnd: 55000,
    imageUrl:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    sortOrder: 11,
  },
];

// --- Bài viết Blog mẫu (HAP-28): nội dung HTML theo đúng đầu ra của
// editor Tiptap trong admin (<p>, <h2>, <ul>, <strong>, <em>,
// <blockquote>, <a>) để trang chi tiết render đồng nhất với bài do
// admin tự soạn. Idempotent theo slug như sản phẩm.
const POST_SEED: ReadonlyArray<{
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: string;
  content: string;
}> = [
  {
    slug: "pha-ca-phe-phin-chuan-vi-tai-nha",
    title: "Pha cà phê phin chuẩn vị tại nhà",
    excerpt:
      "Tỉ lệ vàng 1:4, nước 93-96°C và ba lỗi nhỏ khiến ly phin đắng gắt — hướng dẫn từng bước để có ly cà phê phin nhỏ giọt chuẩn vị quán ngay tại bếp nhà.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-10-20T08:00:00+07:00",
    content: `<p>Cà phê phin là cách pha chậm rãi và rất "Việt Nam": nước nóng đi qua lớp bột cà phê bằng trọng lực, nhỏ từng giọt xuống ly. Nghe đơn giản, nhưng chỉ cần lệch một chút về tỉ lệ hay nhiệt độ là ly cà phê dễ đắng gắt hoặc nhạt nhẽo. Bài này là quy trình mà barista của Happier Coffee dùng mỗi ngày, gọn lại để bạn làm được ngay tại nhà.</p>
<h2>Chuẩn bị</h2>
<ul>
<li><strong>Cà phê:</strong> 25g bột xay vừa (cỡ hạt cát thô). Hạt robusta rang vừa cho vị đậm kiểu truyền thống; thích nhẹ nhàng hơn thì trộn 70% robusta + 30% arabica.</li>
<li><strong>Nước:</strong> 100ml nước nóng 93-96°C — sôi xong để nguội khoảng 1 phút là vừa.</li>
<li><strong>Dụng cụ:</strong> phin nhôm hoặc inox, ly thủy tinh dày, và một chút kiên nhẫn.</li>
</ul>
<h2>Các bước pha</h2>
<ul>
<li><strong>Tráng phin</strong> bằng nước nóng để làm ấm và sạch phin.</li>
<li>Cho 25g cà phê vào phin, lắc nhẹ cho mặt bột phẳng, đặt nắp gài và <em>ấn vừa tay</em> — chặt quá nước không thấm, lỏng quá cà phê chảy ào và chua.</li>
<li><strong>Ủ (bloom):</strong> rót 20ml nước nóng, chờ 30 giây cho bột nở đều.</li>
<li>Rót tiếp 80ml nước còn lại, đậy nắp, chờ nhỏ giọt. Tốc độ chuẩn là khoảng <strong>1 giọt mỗi giây</strong>, tổng thời gian 5-7 phút.</li>
<li>Khuấy đều phần cốt cà phê, thêm sữa đặc hoặc đường theo khẩu vị, cho đá vào và thưởng thức.</li>
</ul>
<h2>Ba lỗi thường gặp</h2>
<ul>
<li><strong>Nước quá sôi (100°C):</strong> chiết xuất quá tay, ly cà phê đắng gắt và khét. Hãy để nước nghỉ một phút sau khi sôi.</li>
<li><strong>Xay quá mịn:</strong> bột bít lỗ phin, nước chảy rất lâu và vị chát tăng mạnh.</li>
<li><strong>Ấn nắp gài quá chặt:</strong> tưởng đậm hơn nhưng thực ra nước chỉ thấm một phần bột, ly cà phê vừa yếu vừa không đều vị.</li>
</ul>
<blockquote>Pha phin ngon là pha chậm mà chắc: đúng tỉ lệ, đúng nhiệt độ, và đừng vội.</blockquote>
<p>Nếu bạn muốn nếm "bản chuẩn" trước khi tự pha, ghé quán thử ly <strong>cà phê sữa đá</strong> — món chủ lực được pha đúng quy trình này mỗi sáng.</p>`,
  },
  {
    slug: "cold-brew-khac-gi-ca-phe-phin",
    title: "Cold brew khác gì cà phê phin?",
    excerpt:
      "Một bên ủ lạnh 18 giờ, một bên nhỏ giọt bằng nước nóng — cold brew và cà phê phin khác nhau từ cách chiết xuất đến hậu vị. Bài này giúp bạn chọn đúng gu.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-10-14T08:00:00+07:00",
    content: `<p>Cùng là cà phê đen mát lạnh, nhưng cold brew và cà phê phin là hai trải nghiệm gần như trái ngược. Hiểu rõ khác biệt giúp bạn gọi đúng món theo tâm trạng — và theo cái bụng của mình nữa.</p>
<h2>Khác nhau từ cách chiết xuất</h2>
<p><strong>Cà phê phin</strong> dùng nước nóng 93-96°C đi qua bột cà phê trong 5-7 phút. Nhiệt độ cao kéo ra nhiều hợp chất hương lẫn vị chua và đắng — đó là lý do phin có vị "đậm, gắt, rất cà phê".</p>
<p><strong>Cold brew</strong> ngâm bột cà phê trong nước lạnh 12-18 giờ. Không có nhiệt, các hợp chất chua và đắng ít tan hơn nhiều, trong khi vị ngọt tự nhiên và hương sô-cô-la, hạt dẻ lại nổi lên. Kết quả là một ly cà phê êm, mượt, ít chua gắt — nhiều người thấy "dễ uống" hơn hẳn.</p>
<h2>So sánh nhanh</h2>
<ul>
<li><strong>Vị:</strong> phin đậm, đắng rõ, hậu khói nhẹ; cold brew thanh, ngọt tự nhiên, hậu sạch.</li>
<li><strong>Độ chua:</strong> phin chua nhẹ đặc trưng; cold brew rất ít chua — hợp người dạ dày nhạy cảm.</li>
<li><strong>Caffeine:</strong> cold brew thường <em>cao hơn</em> vì ngâm lâu và tỉ lệ cà phê lớn, dù uống vào thấy "nhẹ" hơn. Đừng để vị êm đánh lừa!</li>
<li><strong>Cách uống:</strong> phin hợp với sữa đặc kiểu truyền thống; cold brew ngon nhất khi uống nguyên chất với đá, hoặc thêm lát cam, chút tonic.</li>
</ul>
<h2>Vậy gu nào hợp với bạn?</h2>
<p>Nếu bạn thích khởi đầu ngày mới bằng một cú "tỉnh táo dứt khoát" và yêu vị cà phê truyền thống, hãy chọn phin. Nếu bạn muốn một ly cà phê nhâm nhi cả buổi, ít chua, hậu ngọt và không cần sữa đường, cold brew sinh ra cho bạn.</p>
<blockquote>Không có cách pha nào "ngon hơn" tuyệt đối — chỉ có cách pha hợp với khẩu vị và khoảnh khắc của bạn hơn.</blockquote>
<p>Ở Happier Coffee, cả hai đều có mặt trong menu. Lần tới ghé quán, thử gọi mỗi loại một ly nhỏ và tự mình cảm nhận sự khác biệt nhé.</p>`,
  },
  {
    slug: "robusta-va-arabica-gu-nao-hop-voi-ban",
    title: "Robusta và Arabica: gu nào hợp với bạn?",
    excerpt:
      "Robusta đậm, nhiều caffeine, là linh hồn của cà phê Việt; Arabica thơm, chua thanh, được giới specialty săn đón. Hiểu hai giống hạt này để chọn ly cà phê đúng gu.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-10-08T08:00:00+07:00",
    content: `<p>Hơn 90% cà phê trên thế giới thuộc về hai giống: <strong>Robusta</strong> và <strong>Arabica</strong>. Việt Nam là quê hương của robusta hảo hạng, còn arabica gắn với những vùng cao như Cầu Đất, Sơn La. Vậy hai giống này khác nhau thế nào trong ly?</p>
<h2>Robusta — đậm và thẳng thắn</h2>
<ul>
<li>Caffeine cao gần gấp đôi arabica (khoảng 2,2-2,7%) → tỉnh táo mạnh.</li>
<li>Vị đậm, đắng rõ, hậu sô-cô-la đen và khói nhẹ; lớp crema dày khi pha espresso.</li>
<li>Hạt cứng cáp, kháng bệnh tốt, trồng được ở độ cao thấp — giá dễ chịu hơn.</li>
<li>Là lựa chọn số một cho cà phê phin, cà phê sữa đá và bạc xỉu.</li>
</ul>
<h2>Arabica — thơm và tinh tế</h2>
<ul>
<li>Caffeine thấp hơn (khoảng 1,2-1,5%), nhiều đường và dầu thơm hơn.</li>
<li>Vị chua thanh kiểu trái cây, hương hoa, mật ong, hạt dẻ tùy vùng trồng.</li>
<li>Khó trồng, kén độ cao và khí hậu (thường trên 1.000m) nên giá cao hơn.</li>
<li>Hợp với pour over, espresso uống nguyên chất và các món latte, cappuccino cần vị êm.</li>
</ul>
<h2>Không phải cứ arabica là "xịn" hơn</h2>
<p>Một ly phin sữa đá làm từ arabica 100% thường bị chê là "nhạt, chua, không ra cà phê Việt" — trong khi robusta chất lượng cao, rang đúng, lại cho trải nghiệm trọn vẹn. Ngược lại, pha pour over bằng robusta rẻ tiền thì khó mà thơm tinh tế được.</p>
<blockquote>Giống hạt chỉ là điểm bắt đầu. Chất lượng thu hái, cách rang và cách pha mới quyết định ly cà phê cuối cùng.</blockquote>
<p>Mẹo nhỏ khi chọn: thích <strong>đậm — đắng — tỉnh</strong> thì robusta; thích <strong>thơm — thanh — khám phá</strong> thì arabica; còn phân vân, một tỉ lệ trộn 70/30 như quán đang dùng cho espresso là điểm cân bằng rất dễ chịu.</p>`,
  },
  {
    slug: "matcha-tu-tra-dao-den-latte",
    title: "Matcha: từ trà đạo Nhật Bản đến ly latte mỗi ngày",
    excerpt:
      "Từ nghi lễ trà đạo hàng trăm năm tuổi đến ly matcha latte xanh mướt trong quán cà phê Sài Gòn — hành trình của bột trà xanh và cách whisk đúng để matcha không bị vón, không đắng gắt.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1522992319-0365e5f11656?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-09-30T08:00:00+07:00",
    content: `<p>Matcha không phải "trà xanh xay nhuyễn" theo nghĩa đơn giản. Đó là lá trà <em>tencha</em> được che nắng nhiều tuần trước thu hoạch, hấp, sấy, bỏ gân và nghiền bằng cối đá thành bột mịn. Người Nhật đã đưa matcha vào trà đạo từ thế kỷ 12 — một nghi lễ chậm rãi, tĩnh lặng, nơi mỗi thao tác đều có ý nghĩa.</p>
<h2>Vì sao matcha tốt cho sức khỏe?</h2>
<ul>
<li>Uống matcha là uống <strong>cả lá trà</strong>, nên chất chống oxy hóa (EGCG) cao hơn trà xanh pha lá nhiều lần.</li>
<li>Caffeine trong matcha đi cùng <strong>L-theanine</strong> — axit amin giúp tỉnh táo mà vẫn thư thái, ít "say cà phê" và ít tụt năng lượng đột ngột.</li>
<li>Chlorophyll từ quá trình che nắng tạo màu xanh đậm và vị umami đặc trưng.</li>
</ul>
<h2>Whisk đúng cách: chìa khóa của ly matcha ngon</h2>
<p>Khác biệt lớn nhất giữa matcha quán ngon và matcha tự pha bị vón nằm ở bước whisk. Bột matcha được rây mịn, thêm nước nóng khoảng <strong>80°C</strong> (nước sôi già làm matcha đắng và mất hương), rồi dùng chổi chasen đánh theo hình chữ M thật nhanh trong 15-20 giây đến khi nổi lớp bọt mịn như kem.</p>
<blockquote>Lớp bọt mịn trên mặt không chỉ để đẹp — đó là dấu hiệu matcha đã tan đều và vị sẽ êm, béo, không lợn cợn.</blockquote>
<h2>Matcha latte: cuộc gặp Đông — Tây</h2>
<p>Khi matcha gặp sữa tươi, vị chát nhẹ và umami được làm dịu, thành một ly đồ uống béo thơm mà vẫn thanh. Ở Happier Coffee, ngoài matcha latte truyền thống, quán còn có <strong>matcha cốt dừa</strong> — biến tấu rất Việt Nam mà bạn nên thử ít nhất một lần.</p>
<p>Lần tới khi cần tỉnh táo nhưng không muốn thêm một ly cà phê nữa, hãy để matcha làm nhiệm vụ đó — nhẹ nhàng mà hiệu quả.</p>`,
  },
  {
    slug: "ghep-banh-voi-ca-phe-hop-vi",
    title: "Ghép bánh với cà phê sao cho hợp vị?",
    excerpt:
      "Tiramisu đi với espresso, croissant hợp latte, flan cà phê sinh ra để ăn cùng bạc xỉu — vài nguyên tắc ghép đôi đơn giản giúp buổi cà phê của bạn tròn vị hơn hẳn.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-09-22T08:00:00+07:00",
    content: `<p>Một ly cà phê ngon đã là nửa niềm vui; nửa còn lại nằm ở miếng bánh đi kèm. Ghép đúng, vị cà phê và vị bánh nâng nhau lên; ghép sai, cả hai cùng nhạt. Dưới đây là vài nguyên tắc đơn giản quán rút ra sau nhiều lần thử — và sai.</p>
<h2>Nguyên tắc 1: đậm đi với béo</h2>
<p>Cà phê càng đậm, đắng (espresso, cà phê đen) càng cần món béo, ngọt để cân bằng. <strong>Tiramisu + espresso</strong> là cặp đôi kinh điển của Ý: lớp mascarpone béo ngậy ôm lấy vị đắng gọn của espresso, và bản thân tiramisu cũng thấm cà phê nên hai bên "cùng tần số".</p>
<h2>Nguyên tắc 2: nhẹ đi với thanh</h2>
<p>Đồ uống nhẹ như latte, cappuccino nên đi với bánh có cấu trúc rõ như <strong>croissant bơ</strong> — vỏ giòn, thơm bơ, không quá ngọt nên không lấn vị sữa. Trà và matcha thì hợp bánh ít béo, vị trái cây như <strong>cheesecake chanh dây</strong>: vị chua thanh của bánh làm nổi bật hậu vị trà.</p>
<h2>Nguyên tắc 3: tránh "ngọt chồng ngọt"</h2>
<p>Bạc xỉu, cà phê sữa vốn đã ngọt; ăn kèm bánh quá ngọt sẽ gây ngán nhanh. Hãy chọn <strong>flan cà phê</strong> (ngọt dịu, có vị cà phê nối vị) hoặc cookie socola chip hơi đắng nhẹ để giữ cân bằng.</p>
<ul>
<li>Espresso / đen đá → tiramisu, cookie socola chip</li>
<li>Latte / cappuccino → croissant bơ, croissant socola</li>
<li>Cold brew → bánh chuối nướng, tart trứng</li>
<li>Matcha latte → cheesecake chanh dây, mousse chanh dây</li>
<li>Bạc xỉu / cà phê sữa đá → flan cà phê, panna cotta</li>
</ul>
<blockquote>Mẹo của quán: luôn nhấp một ngụm cà phê trước, ăn một miếng bánh, rồi nhấp ngụm thứ hai — ngụm thứ hai là lúc hai vị hòa vào nhau rõ nhất.</blockquote>
<p>Tất cả các cặp đôi trên đều có trong <a href="/menu">thực đơn của quán</a>. Ghé Happier Coffee và thử "ghép đôi" theo gu của riêng bạn nhé!</p>`,
  },
];

async function main() {
  const [{ value: orderCount }] = await db
    .select({ value: count() })
    .from(orders);
  if (orderCount > 0) {
    // HAP-27: chỉ ghi nhận, không dừng — seed chỉ upsert categories/products
    // theo slug (không xóa, không đổi id), nên đơn hàng hiện có an toàn.
    console.log(
      `Lưu ý: bảng orders đang có ${orderCount} đơn — seed không đụng tới orders/order_items.`,
    );
  }

  for (const category of CATEGORY_SEED) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          sortOrder: category.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const categoryIdBySlug = new Map(categoryRows.map((r) => [r.slug, r.id]));

  for (const product of PRODUCT_SEED) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Không tìm thấy category slug=${product.categorySlug}`);
    }
    await db
      .insert(products)
      .values({
        categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceVnd: product.priceVnd,
        imageUrl: product.imageUrl,
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable ?? true,
        sortOrder: product.sortOrder,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          categoryId,
          name: product.name,
          description: product.description,
          priceVnd: product.priceVnd,
          imageUrl: product.imageUrl,
          isFeatured: product.isFeatured,
          isAvailable: product.isAvailable ?? true,
          sortOrder: product.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  for (const post of POST_SEED) {
    await db
      .insert(blogPosts)
      .values({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        author: "Happier Coffee",
        isPublished: true,
        publishedAt: new Date(post.publishedAt),
      })
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          author: "Happier Coffee",
          isPublished: true,
          publishedAt: new Date(post.publishedAt),
          updatedAt: new Date(),
        },
      });
  }

  const [{ value: categoryCount }] = await db
    .select({ value: count() })
    .from(categories);
  const [{ value: productCount }] = await db
    .select({ value: count() })
    .from(products);
  const [{ value: postCount }] = await db
    .select({ value: count() })
    .from(blogPosts);
  console.log(
    `Seed xong: ${categoryCount} categories, ${productCount} products, ${postCount} blog posts.`,
  );
}

await main();
