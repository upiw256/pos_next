"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import PurchaseItem from "@/models/PurchaseItem";
import InventoryStock from "@/models/InventoryStock";
import StockMovement from "@/models/StockMovement";
import ProductPrice from "@/models/ProductPrice";
import { auth } from "@/auth";

export async function getPurchases() {
  await connectToDatabase();
  const purchases = await Purchase.find()
    .populate("supplier_id")
    .populate("user_id")
    .sort({ createdAt: -1 });
    
  return JSON.parse(JSON.stringify(purchases));
}

export async function getPurchase(id: string) {
  await connectToDatabase();
  const purchase = await Purchase.findById(id).populate("supplier_id");
  const items = await PurchaseItem.findById({ purchase_id: id }).populate("product_id").populate("variant_id");
  
  return JSON.parse(JSON.stringify({ ...purchase.toObject(), items }));
}

export async function createPurchase(data: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();
  
  const { supplier_id, date, note, items } = data;
  
  // Generate reference number: PO-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Purchase.countDocuments();
  const reference_no = `PO-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

  const total_amount = items.reduce((acc: number, item: any) => acc + (item.cost * item.quantity), 0);

  const purchase = await Purchase.create({
    reference_no,
    supplier_id,
    date: date || new Date(),
    status: 'PENDING',
    payment_status: 'UNPAID',
    total_amount,
    note,
    user_id: (session.user as any).id
  });

  for (const item of items) {
    await PurchaseItem.create({
      purchase_id: purchase._id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      cost: item.cost,
      quantity: item.quantity,
      subtotal: item.cost * item.quantity
    });
  }

  revalidatePath("/admin/purchases");
  return { success: true, id: purchase._id };
}

export async function receivePurchase(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();
  
  const purchase = await Purchase.findById(id);
  if (!purchase || purchase.status === 'RECEIVED') return { success: false, message: "Invalid purchase or already received" };

  const items = await PurchaseItem.find({ purchase_id: id });

  for (const item of items) {
    // 1. Update Inventory Stock
    await InventoryStock.findOneAndUpdate(
      { product_id: item.product_id, variant_id: item.variant_id },
      { $inc: { quantity: item.quantity } },
      { upsert: true }
    );

    // 2. Record Stock Movement
    await StockMovement.create({
      product_id: item.product_id,
      variant_id: item.variant_id,
      type: 'IN',
      qty: item.quantity,
      ref_type: 'PURCHASE',
      ref_id: purchase._id,
      note: `Received Purchase ${purchase.reference_no}`,
      user_id: (session.user as any).id
    });

    // 3. Update ProductPrice (Moving Average HPP Logic)
    const currentPrice = await ProductPrice.findOne({ product_id: item.product_id, variant_id: item.variant_id });
    const currentStock = await InventoryStock.findOne({ product_id: item.product_id, variant_id: item.variant_id });
    
    // Previous stock BEFORE this increment
    const oldQty = (currentStock?.quantity || 0) - item.quantity; 
    const oldCost = currentPrice?.base_cost || 0;
    
    let newAvgCost = item.cost;
    if (oldQty > 0) {
      newAvgCost = ((oldQty * oldCost) + (item.quantity * item.cost)) / (oldQty + item.quantity);
    }

    await ProductPrice.findOneAndUpdate(
      { product_id: item.product_id, variant_id: item.variant_id },
      { base_cost: Math.round(newAvgCost), active_from: new Date() },
      { upsert: true }
    );
  }

  purchase.status = 'RECEIVED';
  await purchase.save();

  revalidatePath("/admin/purchases");
  revalidatePath("/admin/inventory");
  return { success: true };
}
