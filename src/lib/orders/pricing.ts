// Tính tiền đơn hàng từ GIÁ TRONG DB (HAP-12, ARCHITECTURE.md mục 6):
// không bao giờ tin giá client gửi lên. File thuần (chỉ nhận dữ liệu đã đọc
// từ DB) để kiểm thử độc lập bằng scripts/test-hap12-logic.ts.

import type { CheckoutItemInput } from "./validate";

/** Hình dạng tối thiểu của một dòng sản phẩm đọc từ DB mà pricing cần. */
export interface PricedProduct {
  id: string;
  name: string;
  priceVnd: number;
  isAvailable: boolean;
}

export interface OrderLineData {
  productId: string;
  productName: string;
  unitPriceVnd: number;
  quantity: number;
  lineTotalVnd: number;
}

/** Lỗi nghiệp vụ có thông điệp hiển thị được cho khách. */
export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

/**
 * Dựng các dòng đơn + tạm tính từ danh sách sản phẩm trong DB.
 * Ném PricingError nếu có món không tồn tại hoặc đã hết hàng (is_available
 * = false) — thông điệp nêu rõ tên món để khách sửa giỏ.
 */
export function buildOrderLines(
  productsFromDb: readonly PricedProduct[],
  items: readonly CheckoutItemInput[],
): { lines: OrderLineData[]; subtotalVnd: number } {
  const productById = new Map(productsFromDb.map((p) => [p.id, p]));

  const lines: OrderLineData[] = [];
  let subtotalVnd = 0;
  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      throw new PricingError(
        "Một món trong giỏ không còn tồn tại. Vui lòng bỏ món đó khỏi giỏ và thử lại.",
      );
    }
    if (!product.isAvailable) {
      throw new PricingError(
        `Món "${product.name}" hiện đã hết hàng. Vui lòng bỏ khỏi giỏ và thử lại.`,
      );
    }
    const lineTotalVnd = product.priceVnd * item.quantity;
    lines.push({
      productId: product.id,
      productName: product.name,
      unitPriceVnd: product.priceVnd,
      quantity: item.quantity,
      lineTotalVnd,
    });
    subtotalVnd += lineTotalVnd;
  }

  return { lines, subtotalVnd };
}
