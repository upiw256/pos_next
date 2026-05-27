import { getProducts } from "@/lib/actions/product";
import { getCustomers } from "@/lib/actions/customer";
import { getSettings } from "@/lib/actions/setting";
import CashierView from "@/components/admin/CashierView";
import Product from "@/models/Product";
import ProductPrice from "@/models/ProductPrice";
import ProductVariant from "@/models/ProductVariant";
import Category from "@/models/Category";
import Unit from "@/models/Unit";
import Brand from "@/models/Brand";
import connectToDatabase from "@/lib/mongodb";

export default async function CashierPage() {
  await connectToDatabase();
  
  // Force register all related models to prevent Next.js from throwing MissingSchemaError
  await Category.find().limit(1);
  await Unit.find().limit(1);
  await Brand.find().limit(1);
  
  // Custom fetch to get products with prices more efficiently for POS
  // We need the data structure expected by CashierView
  const productsRaw = await Product.find()
    .populate("category_id")
    .sort({ name: 1 });
    
  const products = await Promise.all(productsRaw.map(async (p) => {
    const variants = await ProductVariant.find({ product_id: p._id });
    const prices = await ProductPrice.find({ product_id: p._id });
    return {
      ...p.toObject(),
      variants: JSON.parse(JSON.stringify(variants)),
      prices: JSON.parse(JSON.stringify(prices))
    };
  }));

  const customers = await getCustomers();
  const settings = await getSettings();

  return (
    <div className="-mt-4"> {/* Adjust margin because of admin layout padding */}
      <CashierView 
        products={JSON.parse(JSON.stringify(products))} 
        customers={JSON.parse(JSON.stringify(customers))} 
        settings={JSON.parse(JSON.stringify(settings))}
      />
    </div>
  );
}
