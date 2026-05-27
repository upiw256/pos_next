/**
 * @vitest-environment node
 *
 * Mongoose model schema tests — validates schema definitions without a DB connection.
 * Uses validateSync() on in-memory documents only.
 */
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

// Register all models (import side-effects register schemas)
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Unit from '@/models/Unit';
import Supplier from '@/models/Supplier';

// ─── Helper ──────────────────────────────────────────────────────────────────
function getValidationErrorKeys(doc: mongoose.Document): string[] {
  const err = doc.validateSync();
  if (!err) return [];
  return Object.keys(err.errors);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Customer
// ─────────────────────────────────────────────────────────────────────────────
describe('Customer Model Schema', () => {
  it('is valid with only required name', () => {
    const doc = new Customer({ name: 'Budi Santoso' });
    expect(getValidationErrorKeys(doc)).toHaveLength(0);
  });

  it('fails when name is missing', () => {
    const doc = new Customer({ phone: '081234567890' });
    expect(getValidationErrorKeys(doc)).toContain('name');
  });

  it('defaults total_points to 0', () => {
    expect(new Customer({ name: 'X' }).total_points).toBe(0);
  });

  it('defaults debt_balance to 0', () => {
    expect(new Customer({ name: 'X' }).debt_balance).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Category
// ─────────────────────────────────────────────────────────────────────────────
describe('Category Model Schema', () => {
  it('is valid with a name and slug', () => {
    const doc = new Category({ name: 'Minuman', slug: 'minuman' });
    expect(getValidationErrorKeys(doc)).toHaveLength(0);
  });

  it('fails when name is missing', () => {
    expect(getValidationErrorKeys(new Category({}))).toContain('name');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Brand
// ─────────────────────────────────────────────────────────────────────────────
describe('Brand Model Schema', () => {
  it('is valid with a name', () => {
    expect(getValidationErrorKeys(new Brand({ name: 'Indofood' }))).toHaveLength(0);
  });

  it('fails when name is missing', () => {
    expect(getValidationErrorKeys(new Brand({}))).toContain('name');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Unit
// ─────────────────────────────────────────────────────────────────────────────
describe('Unit Model Schema', () => {
  it('is valid with name and short_name', () => {
    expect(getValidationErrorKeys(new Unit({ name: 'Pieces', short_name: 'pcs' }))).toHaveLength(0);
  });

  it('fails when name is missing', () => {
    expect(getValidationErrorKeys(new Unit({ short_name: 'kg' }))).toContain('name');
  });

  it('fails when short_name is missing', () => {
    expect(getValidationErrorKeys(new Unit({ name: 'Kilogram' }))).toContain('short_name');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Supplier
// ─────────────────────────────────────────────────────────────────────────────
describe('Supplier Model Schema', () => {
  it('is valid with only name', () => {
    expect(getValidationErrorKeys(new Supplier({ name: 'PT Makmur' }))).toHaveLength(0);
  });

  it('fails when name is missing', () => {
    expect(getValidationErrorKeys(new Supplier({}))).toContain('name');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Product
// ─────────────────────────────────────────────────────────────────────────────
describe('Product Model Schema', () => {
  const catId = new mongoose.Types.ObjectId();
  const unitId = new mongoose.Types.ObjectId();

  it('is valid with all required fields', () => {
    const doc = new Product({
      name: 'Indomie Goreng',
      slug: 'indomie-goreng',
      sku: 'SKU-001',
      category_id: catId,
      unit_id: unitId,
    });
    expect(getValidationErrorKeys(doc)).toHaveLength(0);
  });

  it('fails when name is missing', () => {
    const doc = new Product({ slug: 'x', sku: 'SKU-002', category_id: catId, unit_id: unitId });
    expect(getValidationErrorKeys(doc)).toContain('name');
  });

  it('fails when slug is missing', () => {
    const doc = new Product({ name: 'X', sku: 'SKU-003', category_id: catId, unit_id: unitId });
    expect(getValidationErrorKeys(doc)).toContain('slug');
  });

  it('defaults is_variant to false', () => {
    const doc = new Product({ name: 'Y', slug: 'y', sku: 'SKU-004', category_id: catId, unit_id: unitId });
    expect(doc.is_variant).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Sale
// ─────────────────────────────────────────────────────────────────────────────
describe('Sale Model Schema', () => {
  const userId = new mongoose.Types.ObjectId();

  const validBase = () => ({
    reference_no: 'INV-20260527-0001',
    user_id: userId,
    total_price: 50000,
    grand_total: 55000,
  });

  it('is valid with all required fields', () => {
    expect(getValidationErrorKeys(new Sale(validBase()))).toHaveLength(0);
  });

  it('fails when reference_no is missing', () => {
    const { reference_no, ...rest } = validBase();
    expect(getValidationErrorKeys(new Sale(rest))).toContain('reference_no');
  });

  it('defaults status to COMPLETED', () => {
    expect(new Sale(validBase()).status).toBe('COMPLETED');
  });

  it('defaults payment_method to CASH', () => {
    expect(new Sale(validBase()).payment_method).toBe('CASH');
  });

  it('defaults payment_status to PAID', () => {
    expect(new Sale(validBase()).payment_status).toBe('PAID');
  });

  it('rejects invalid payment_method', () => {
    const doc = new Sale({ ...validBase(), payment_method: 'BITCOIN' });
    expect(getValidationErrorKeys(doc)).toContain('payment_method');
  });

  it('accepts all valid payment methods', () => {
    for (const method of ['CASH', 'TRANSFER', 'QRIS']) {
      const doc = new Sale({ ...validBase(), reference_no: `INV-${method}`, payment_method: method });
      expect(getValidationErrorKeys(doc)).toHaveLength(0);
    }
  });

  it('rejects invalid status', () => {
    const doc = new Sale({ ...validBase(), status: 'PENDING' });
    expect(getValidationErrorKeys(doc)).toContain('status');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Expense
// ─────────────────────────────────────────────────────────────────────────────
describe('Expense Model Schema', () => {
  const catId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  const validBase = () => ({
    category_id: catId,
    amount: 150000,
    description: 'Bayar listrik',
    date: new Date(),
    user_id: userId,
  });

  it('is valid with all required fields', () => {
    expect(getValidationErrorKeys(new Expense(validBase()))).toHaveLength(0);
  });

  it('fails when category_id is missing', () => {
    const { category_id, ...rest } = validBase();
    expect(getValidationErrorKeys(new Expense(rest))).toContain('category_id');
  });

  it('fails when description is missing', () => {
    const { description, ...rest } = validBase();
    expect(getValidationErrorKeys(new Expense(rest))).toContain('description');
  });

  it('fails when user_id is missing', () => {
    const { user_id, ...rest } = validBase();
    expect(getValidationErrorKeys(new Expense(rest))).toContain('user_id');
  });
});
