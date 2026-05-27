import { describe, it, expect } from 'vitest';
import {
  generateReferenceNo,
  calcItemSubtotal,
  calcCartTotal,
  calcTax,
  calcGrandTotal,
  calcChange,
  calcItemGrossProfit,
  calcTotalGrossProfit,
  calcNetProfit,
  effectivePrice,
  formatRupiah,
  type CartItem,
  type SaleItemForPL,
} from '@/lib/posUtils';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Reference Number
// ─────────────────────────────────────────────────────────────────────────────
describe('generateReferenceNo', () => {
  it('should produce INV-YYYYMMDD-XXXX format', () => {
    const date = new Date('2026-05-27T00:00:00Z');
    const ref = generateReferenceNo(0, date);
    expect(ref).toBe('INV-20260527-0001');
  });

  it('should zero-pad the sequential number', () => {
    const date = new Date('2026-05-27T00:00:00Z');
    expect(generateReferenceNo(99, date)).toBe('INV-20260527-0100');
    expect(generateReferenceNo(999, date)).toBe('INV-20260527-1000');
  });

  it('should increment count by 1', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    expect(generateReferenceNo(4, date)).toBe('INV-20260101-0005');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Cart Calculations
// ─────────────────────────────────────────────────────────────────────────────
describe('calcItemSubtotal', () => {
  it('should return unit_price * quantity', () => {
    const item: CartItem = { product_id: 'p1', name: 'Item A', unit_price: 5000, quantity: 3 };
    expect(calcItemSubtotal(item)).toBe(15000);
  });

  it('should return 0 when quantity is 0', () => {
    const item: CartItem = { product_id: 'p1', name: 'Item A', unit_price: 5000, quantity: 0 };
    expect(calcItemSubtotal(item)).toBe(0);
  });
});

describe('calcCartTotal', () => {
  it('should sum all item subtotals correctly', () => {
    const items: CartItem[] = [
      { product_id: 'p1', name: 'A', unit_price: 10000, quantity: 2 },
      { product_id: 'p2', name: 'B', unit_price: 5000, quantity: 3 },
    ];
    // 10000*2 + 5000*3 = 20000 + 15000 = 35000
    expect(calcCartTotal(items)).toBe(35000);
  });

  it('should return 0 for an empty cart', () => {
    expect(calcCartTotal([])).toBe(0);
  });
});

describe('calcTax', () => {
  it('should calculate 11% tax correctly', () => {
    expect(calcTax(100000, 11)).toBe(11000);
  });

  it('should return 0 for 0% tax', () => {
    expect(calcTax(100000, 0)).toBe(0);
  });

  it('should round fractional tax', () => {
    // 10001 * 11% = 1100.11 → rounds to 1100
    expect(calcTax(10001, 11)).toBe(1100);
  });
});

describe('calcGrandTotal', () => {
  it('should apply discount then tax', () => {
    // subtotal=100000, discount=10000, taxPct=10%
    // afterDiscount = 90000, tax = 9000, grand = 99000
    expect(calcGrandTotal(100000, 10000, 10)).toBe(99000);
  });

  it('should work with no discount and no tax', () => {
    expect(calcGrandTotal(50000, 0, 0)).toBe(50000);
  });

  it('should work with full discount (free item)', () => {
    expect(calcGrandTotal(50000, 50000, 11)).toBe(0);
  });
});

describe('calcChange', () => {
  it('should return correct change amount', () => {
    expect(calcChange(100000, 75000)).toBe(25000);
  });

  it('should return exact 0 when paid equals grand total', () => {
    expect(calcChange(50000, 50000)).toBe(0);
  });

  it('should return negative when under-paid (validation concern)', () => {
    expect(calcChange(40000, 50000)).toBe(-10000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Profit / Loss
// ─────────────────────────────────────────────────────────────────────────────
describe('calcItemGrossProfit', () => {
  it('should calculate (sell - cost) * qty', () => {
    const item: SaleItemForPL = { unit_price: 15000, cost_price: 10000, quantity: 4 };
    expect(calcItemGrossProfit(item)).toBe(20000); // 5000 * 4
  });

  it('should return negative profit if cost > sell price', () => {
    const item: SaleItemForPL = { unit_price: 8000, cost_price: 10000, quantity: 2 };
    expect(calcItemGrossProfit(item)).toBe(-4000);
  });
});

describe('calcTotalGrossProfit', () => {
  it('should sum all item gross profits', () => {
    const items: SaleItemForPL[] = [
      { unit_price: 15000, cost_price: 10000, quantity: 2 }, // profit 10000
      { unit_price: 20000, cost_price: 12000, quantity: 3 }, // profit 24000
    ];
    expect(calcTotalGrossProfit(items)).toBe(34000);
  });

  it('should return 0 for empty list', () => {
    expect(calcTotalGrossProfit([])).toBe(0);
  });
});

describe('calcNetProfit', () => {
  it('should subtract total expenses from gross profit', () => {
    expect(calcNetProfit(500000, 150000)).toBe(350000);
  });

  it('should return negative when expenses exceed gross profit', () => {
    expect(calcNetProfit(100000, 200000)).toBe(-100000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Discount / Effective Price
// ─────────────────────────────────────────────────────────────────────────────
describe('effectivePrice', () => {
  it('should return discount_price when it is set and > 0', () => {
    expect(effectivePrice(20000, 15000)).toBe(15000);
  });

  it('should fall back to sell_price when discount_price is null', () => {
    expect(effectivePrice(20000, null)).toBe(20000);
  });

  it('should fall back to sell_price when discount_price is undefined', () => {
    expect(effectivePrice(20000, undefined)).toBe(20000);
  });

  it('should fall back to sell_price when discount_price is 0', () => {
    expect(effectivePrice(20000, 0)).toBe(20000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Formatting
// ─────────────────────────────────────────────────────────────────────────────
describe('formatRupiah', () => {
  it('should format thousands with dots (id-ID locale)', () => {
    // id-ID uses '.' as thousands separator
    expect(formatRupiah(1500000)).toBe('1.500.000');
  });

  it('should handle zero', () => {
    expect(formatRupiah(0)).toBe('0');
  });

  it('should handle values below 1000', () => {
    expect(formatRupiah(999)).toBe('999');
  });
});
