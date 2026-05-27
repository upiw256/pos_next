"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import InventoryStock from "@/models/InventoryStock";
import StockMovement from "@/models/StockMovement";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { auth } from "@/auth";

export async function getStocks() {
  await connectToDatabase();
  // Ensure models are registered
  await Product.find().limit(1);
  await ProductVariant.find().limit(1);
  
  const stocks = await InventoryStock.find()
    .populate("product_id")
    .populate("variant_id")
    .sort({ updatedAt: -1 });
    
  return JSON.parse(JSON.stringify(stocks));
}

export async function getStockHistory(productId: string, variantId?: string) {
  await connectToDatabase();
  const query: any = { product_id: productId };
  if (variantId) query.variant_id = variantId;
  
  const history = await StockMovement.find(query)
    .populate("user_id")
    .sort({ createdAt: -1 });
    
  return JSON.parse(JSON.stringify(history));
}

export async function adjustStock(data: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();
  
  const { product_id, variant_id, qty, type, note } = data;

  // Update or create inventory stock level
  const query = { product_id, variant_id };
  const update = { $inc: { quantity: Number(qty) } };
  const options = { upsert: true, new: true };
  
  const stock = await InventoryStock.findOneAndUpdate(query, update, options);

  // Record movement
  await StockMovement.create({
    product_id,
    variant_id,
    type: type || (qty > 0 ? 'IN' : 'OUT'),
    qty: Math.abs(qty),
    ref_type: 'ADJUSTMENT',
    note: note || "Manual Adjustment",
    user_id: (session.user as any).id
  });

  revalidatePath("/admin/inventory");
  return { success: true, newQuantity: stock.quantity };
}
