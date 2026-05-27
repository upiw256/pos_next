"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import ProductPrice from "@/models/ProductPrice";
import Category from "@/models/Category";
import Unit from "@/models/Unit";
import Brand from "@/models/Brand";

export async function getProducts() {
  await connectToDatabase();
  // Ensure the models are registered
  await Category.find().limit(1);
  await Unit.find().limit(1);
  await Brand.find().limit(1);
  
  const products = await Product.find()
    .populate("category_id")
    .populate("unit_id")
    .populate("brand_id")
    .sort({ createdAt: -1 });
    
  return JSON.parse(JSON.stringify(products));
}

export async function getProduct(id: string) {
  await connectToDatabase();
  const product = await Product.findById(id)
    .populate("category_id")
    .populate("unit_id")
    .populate("brand_id");
  
  if (!product) return null;

  const variants = await ProductVariant.find({ product_id: id });
  const prices = await ProductPrice.find({ product_id: id });

  return JSON.parse(JSON.stringify({
    ...product.toObject(),
    variants,
    prices
  }));
}

export async function createProduct(data: any) {
  await connectToDatabase();
  
  const { 
    name, 
    sku, 
    barcode, 
    category_id, 
    brand_id, 
    unit_id, 
    is_variant, 
    image_url,
    base_cost,
    sell_price,
    discount_price,
    variants // Array of { name, sku_variant, barcode, base_cost, sell_price, discount_price }
  } = data;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const product = await Product.create({
    name,
    slug,
    sku,
    barcode,
    category_id,
    brand_id: brand_id || null,
    unit_id,
    is_variant,
    image_url
  });

  if (!is_variant) {
    // Create price for single product
    await ProductPrice.create({
      product_id: product._id,
      base_cost: Number(base_cost),
      sell_price: Number(sell_price),
      discount_price: discount_price ? Number(discount_price) : undefined,
      active_from: new Date()
    });
  } else {
    // Create variants and their prices
    for (const variantData of variants) {
      const variant = await ProductVariant.create({
        product_id: product._id,
        name: variantData.name,
        sku_variant: variantData.sku_variant,
        barcode: variantData.barcode
      });

      await ProductPrice.create({
        product_id: product._id,
        variant_id: variant._id,
        base_cost: Number(variantData.base_cost),
        sell_price: Number(variantData.sell_price),
        discount_price: variantData.discount_price ? Number(variantData.discount_price) : undefined,
        active_from: new Date()
      });
    }
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProduct(id: string, data: any) {
  await connectToDatabase();
  
  const { 
    name, 
    sku, 
    barcode, 
    category_id, 
    brand_id, 
    unit_id, 
    is_variant, 
    image_url,
    base_cost,
    sell_price,
    discount_price,
    variants 
  } = data;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await Product.findByIdAndUpdate(id, {
    name,
    slug,
    sku,
    barcode,
    category_id,
    brand_id: brand_id || null,
    unit_id,
    is_variant,
    image_url
  });

  // For simplicity in this initial implementation, we'll clear and recreate prices/variants
  // In a real app, you might want to sync them or keep history
  
  if (!is_variant) {
    // Remove old variants if it was variant before
    await ProductVariant.deleteMany({ product_id: id });
    
    // Update or create price
    await ProductPrice.findOneAndUpdate(
      { product_id: id, variant_id: { $exists: false } },
      { 
        base_cost: Number(base_cost), 
        sell_price: Number(sell_price),
        discount_price: discount_price ? Number(discount_price) : undefined,
        active_from: new Date() 
      },
      { upsert: true }
    );
  } else {
    // Handle variants update
    // Remove old price without variant
    await ProductPrice.deleteMany({ product_id: id, variant_id: { $exists: false } });
    
    // Here we might need a more complex sync logic. 
    // For now, let's delete and recreate variants/prices for simplicity 
    // unless you want to keep variant IDs stable.
    
    await ProductVariant.deleteMany({ product_id: id });
    await ProductPrice.deleteMany({ product_id: id, variant_id: { $ne: null } });

    for (const variantData of variants) {
      const variant = await ProductVariant.create({
        product_id: id,
        name: variantData.name,
        sku_variant: variantData.sku_variant,
        barcode: variantData.barcode
      });

      await ProductPrice.create({
        product_id: id,
        variant_id: variant._id,
        base_cost: Number(variantData.base_cost),
        sell_price: Number(variantData.sell_price),
        discount_price: variantData.discount_price ? Number(variantData.discount_price) : undefined,
        active_from: new Date()
      });
    }
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  await connectToDatabase();
  await Product.findByIdAndDelete(id);
  await ProductVariant.deleteMany({ product_id: id });
  await ProductPrice.deleteMany({ product_id: id });
  revalidatePath("/admin/products");
  return { success: true };
}
