// lib/posUtils.ts
// Pure business-logic helpers for the POS system.
// These are framework-agnostic so they are easily unit-testable.

// ─── Reference Number ────────────────────────────────────────────────────────

/**
 * Generate a sale reference number in the format INV-YYYYMMDD-XXXX.
 * @param date  The transaction date (defaults to now).
 * @param count Current total document count used to produce the sequential part.
 */
export function generateReferenceNo(count: number, date: Date = new Date()): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = (count + 1).toString().padStart(4, '0');
  return `INV-${dateStr}-${seq}`;
}

// ─── Cart Calculations ────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  name: string;
  unit_price: number;      // effective price after discount
  original_price?: number; // before discount
  quantity: number;
}

/** Sub-total for a single cart item. */
export function calcItemSubtotal(item: CartItem): number {
  return item.unit_price * item.quantity;
}

/** Total before tax & discount for entire cart. */
export function calcCartTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + calcItemSubtotal(item), 0);
}

/**
 * Apply a percentage tax to a subtotal.
 * @param subtotal  Pre-tax amount.
 * @param taxPct    Tax rate as a whole number (e.g. 11 for 11 %).
 */
export function calcTax(subtotal: number, taxPct: number): number {
  return Math.round((subtotal * taxPct) / 100);
}

/**
 * Calculate the grand total (after discount, then after tax).
 */
export function calcGrandTotal(
  subtotal: number,
  discountAmount: number,
  taxPct: number
): number {
  const afterDiscount = subtotal - discountAmount;
  const tax = calcTax(afterDiscount, taxPct);
  return afterDiscount + tax;
}

/** Cash change returned to the customer. */
export function calcChange(paidAmount: number, grandTotal: number): number {
  return paidAmount - grandTotal;
}

// ─── Profit / Loss ────────────────────────────────────────────────────────────

export interface SaleItemForPL {
  unit_price: number;
  cost_price: number;
  quantity: number;
}

/** Gross profit for a single sale item (revenue minus cost). */
export function calcItemGrossProfit(item: SaleItemForPL): number {
  return (item.unit_price - item.cost_price) * item.quantity;
}

/** Total gross profit across a list of sale items. */
export function calcTotalGrossProfit(items: SaleItemForPL[]): number {
  return items.reduce((acc, item) => acc + calcItemGrossProfit(item), 0);
}

/**
 * Net profit = Gross profit - total operating expenses.
 */
export function calcNetProfit(grossProfit: number, totalExpenses: number): number {
  return grossProfit - totalExpenses;
}

// ─── Discount ─────────────────────────────────────────────────────────────────

/**
 * Determine the effective selling price for a product.
 * If a discount_price is set (and > 0), use it; otherwise use sell_price.
 */
export function effectivePrice(sellPrice: number, discountPrice?: number | null): number {
  if (discountPrice != null && discountPrice > 0) {
    return discountPrice;
  }
  return sellPrice;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/** Format a number as Indonesian Rupiah string (e.g. 1.500.000). */
export function formatRupiah(amount: number): string {
  return amount.toLocaleString('id-ID');
}
