import { neon } from "@neondatabase/serverless";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, orders, products } from "./schema.ts";

// Seed dữ liệu mẫu cho Happier Coffee (HAP-7): 3 categories, 14 products.
// Chạy bằng: npm run db:seed (đọc DATABASE_URL từ env hoặc .env.local).
//
// IDEMPOTENT theo slug: chạy lại chỉ cập nhật bản ghi trùng slug, không nhân đôi.
// AN TOÀN với dữ liệu thật:
// - Bảng orders đã có đơn -> DỪNG, không ghi gì (tránh đụng dữ liệu bán hàng).
// - Sản phẩm đã bị order_items tham chiếu mà slug không còn trong danh sách mẫu
//   sẽ KHÔNG bị xóa; chỉ đồng bộ đúng các slug trong file này.

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
];

async function main() {
  const [{ value: orderCount }] = await db
    .select({ value: count() })
    .from(orders);
  if (orderCount > 0) {
    throw new Error(
      `Bảng orders đã có ${orderCount} đơn — DỪNG seed để tránh đụng dữ liệu thật.`,
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
