/**
 * @vitest-environment node
 *
 * Integration-style tests for Server Action: createSale.
 * MongoDB calls are fully mocked — no real DB needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── vi.hoisted() ensures these refs are created BEFORE vi.mock() factories ──
const mocks = vi.hoisted(() => ({
  saleCreate: vi.fn(),
  saleCountDocuments: vi.fn(),
  saleItemCreate: vi.fn(),
  inventoryStockFindOneAndUpdate: vi.fn(),
  stockMovementCreate: vi.fn(),
  productPriceFindOne: vi.fn(),
  revalidatePath: vi.fn(),
  auth: vi.fn(),
}));

// ── Mocks (hoisted to top by Vitest automatically) ───────────────────────────
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/mongodb', () => ({ default: vi.fn().mockResolvedValue(true) }));
vi.mock('@/models/Customer', () => ({ default: {} }));
vi.mock('@/models/User', () => ({ default: {} }));
vi.mock('@/models/Sale', () => ({
  default: {
    create: mocks.saleCreate,
    countDocuments: mocks.saleCountDocuments,
  },
}));
vi.mock('@/models/SaleItem', () => ({ default: { create: mocks.saleItemCreate } }));
vi.mock('@/models/InventoryStock', () => ({
  default: { findOneAndUpdate: mocks.inventoryStockFindOneAndUpdate },
}));
vi.mock('@/models/StockMovement', () => ({ default: { create: mocks.stockMovementCreate } }));
vi.mock('@/models/ProductPrice', () => ({ default: { findOne: mocks.productPriceFindOne } }));

import { createSale } from '@/lib/actions/sale';

// ─────────────────────────────────────────────────────────────────────────────
// Shared test data
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_ID = '507f1f77bcf86cd799439012';

const buildPayload = (overrides: Record<string, unknown> = {}) => ({
  customer_id: null,
  total_price: 30000,
  tax: 0,
  discount: 0,
  grand_total: 30000,
  payment_method: 'CASH',
  paid_amount: 30000,
  change_amount: 0,
  payment_provider: null,
  note: '',
  items: [{ product_id: PRODUCT_ID, variant_id: null, unit_price: 10000, quantity: 3 }],
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup defaults before each test
// ─────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  mocks.auth.mockResolvedValue({ user: { id: '507f1f77bcf86cd799439011', name: 'Admin' } });
  mocks.saleCountDocuments.mockResolvedValue(0);
  mocks.productPriceFindOne.mockResolvedValue({ base_cost: 8000 });
  mocks.saleCreate.mockResolvedValue({
    _id: { toString: () => 'sale-id-001' },
    reference_no: 'INV-20260527-0001',
  });
  mocks.saleItemCreate.mockResolvedValue({});
  mocks.inventoryStockFindOneAndUpdate.mockResolvedValue({});
  mocks.stockMovementCreate.mockResolvedValue({});
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('createSale Server Action', () => {
  it('calls Sale.create with correct core fields', async () => {
    await createSale(buildPayload());

    expect(mocks.saleCreate).toHaveBeenCalledOnce();
    const args = mocks.saleCreate.mock.calls[0][0];
    expect(args.total_price).toBe(30000);
    expect(args.grand_total).toBe(30000);
    expect(args.payment_method).toBe('CASH');
    expect(args.status).toBe('COMPLETED');
    expect(args.payment_status).toBe('PAID');
  });

  it('creates one SaleItem per cart item', async () => {
    const payload = buildPayload({
      items: [
        { product_id: PRODUCT_ID, variant_id: null, unit_price: 10000, quantity: 2 },
        { product_id: PRODUCT_ID, variant_id: null, unit_price: 5000, quantity: 1 },
      ],
    });
    await createSale(payload);
    expect(mocks.saleItemCreate).toHaveBeenCalledTimes(2);
  });

  it('deducts inventory quantity for each item', async () => {
    await createSale(buildPayload());

    expect(mocks.inventoryStockFindOneAndUpdate).toHaveBeenCalledOnce();
    const updateArg = mocks.inventoryStockFindOneAndUpdate.mock.calls[0][1];
    expect(updateArg).toEqual({ $inc: { quantity: -3 } });
  });

  it('records a StockMovement with type OUT and ref_type SALE', async () => {
    await createSale(buildPayload());

    expect(mocks.stockMovementCreate).toHaveBeenCalledOnce();
    const mvt = mocks.stockMovementCreate.mock.calls[0][0];
    expect(mvt.type).toBe('OUT');
    expect(mvt.ref_type).toBe('SALE');
  });

  it('uses cost_price from ProductPrice for the SaleItem', async () => {
    mocks.productPriceFindOne.mockResolvedValue({ base_cost: 5500 });
    await createSale(buildPayload());

    const saleItemArgs = mocks.saleItemCreate.mock.calls[0][0];
    expect(saleItemArgs.cost_price).toBe(5500);
  });

  it('falls back to cost_price=0 when ProductPrice is not found', async () => {
    mocks.productPriceFindOne.mockResolvedValue(null);
    await createSale(buildPayload());

    const saleItemArgs = mocks.saleItemCreate.mock.calls[0][0];
    expect(saleItemArgs.cost_price).toBe(0);
  });

  it('returns success:true with reference_no on success', async () => {
    const result = await createSale(buildPayload());
    expect(result.success).toBe(true);
    expect(result.reference_no).toBe('INV-20260527-0001');
  });

  it('throws Unauthorized when user is not authenticated', async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(createSale(buildPayload())).rejects.toThrow('Unauthorized');
  });

  it('calls revalidatePath for /admin/sales after success', async () => {
    await createSale(buildPayload());
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/sales');
  });
});
