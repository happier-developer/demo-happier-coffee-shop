import { neon } from "@neondatabase/serverless";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, orders, products } from "./schema.ts";

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

  const [{ value: categoryCount }] = await db
    .select({ value: count() })
    .from(categories);
  const [{ value: productCount }] = await db
    .select({ value: count() })
    .from(products);
  console.log(
    `Seed xong: ${categoryCount} categories, ${productCount} products.`,
  );
}

await main();
