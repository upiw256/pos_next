"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import Sale from "@/models/Sale";
import SaleItem from "@/models/SaleItem";
import InventoryStock from "@/models/InventoryStock";
import StockMovement from "@/models/StockMovement";
import ProductPrice from "@/models/ProductPrice";
import Customer from "@/models/Customer";
import User from "@/models/User";
import { auth } from "@/auth";

export async function getSales() {
  await connectToDatabase();
  const sales = await Sale.find()
    .populate("customer_id")
    .populate("user_id")
    .sort({ createdAt: -1 });
    
  return JSON.parse(JSON.stringify(sales));
}

export async function createSale(data: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();
  
  const { customer_id, total_price, tax, discount, grand_total, payment_method, paid_amount, change_amount, payment_provider, note, items } = data;
  
  // Generate reference number: INV-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Sale.countDocuments();
  const reference_no = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

  const sale = await Sale.create({
    reference_no,
    user_id: (session.user as any).id,
    customer_id: customer_id || null,
    total_price,
    tax,
    discount,
    grand_total,
    payment_method,
    payment_status: 'PAID',
    status: 'COMPLETED',
    paid_amount,
    change_amount,
    payment_provider,
    note
  });

  for (const item of items) {
    // 1. Get latest cost for this item
    const priceData = await ProductPrice.findOne({ product_id: item.product_id, variant_id: item.variant_id });
    const cost_price = priceData?.base_cost || 0;

    // 2. Create Sale Item
    await SaleItem.create({
      sale_id: sale._id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      unit_price: item.unit_price,
      cost_price,
      quantity: item.quantity,
      subtotal: item.unit_price * item.quantity
    });

    // 3. Deduct Inventory Stock
    await InventoryStock.findOneAndUpdate(
      { product_id: item.product_id, variant_id: item.variant_id },
      { $inc: { quantity: -item.quantity } },
      { upsert: true }
    );

    // 4. Record Stock Movement
    await StockMovement.create({
      product_id: item.product_id,
      variant_id: item.variant_id,
      type: 'OUT',
      qty: item.quantity,
      ref_type: 'SALE',
      ref_id: sale._id,
      note: `Sales Transaction ${sale.reference_no}`,
      user_id: (session.user as any).id
    });
  }

  revalidatePath("/admin/sales");
  revalidatePath("/admin/inventory");
  return { 
    success: true, 
    id: sale._id.toString(), 
    reference_no: sale.reference_no,
    sale: JSON.parse(JSON.stringify(sale))
  };
}
