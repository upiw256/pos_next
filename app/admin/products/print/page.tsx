import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import ProductPrice from "@/models/ProductPrice";
import PrintLabelsClient from "./PrintLabelsClient"; // TS Server fix

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PrintLabelsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const idsParam = resolvedParams.ids;
  
  if (!idsParam || typeof idsParam !== 'string') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-medium text-gray-500">Tidak ada produk yang dipilih.</div>
      </div>
    );
  }

  const ids = idsParam.split(",");

  await connectToDatabase();
  
  const products = await Product.find({ _id: { $in: ids } });
  const labels = [];

  for (const product of products) {
    if (product.is_variant) {
      const variants = await ProductVariant.find({ product_id: product._id });
      for (const variant of variants) {
        // Find price
        const price = await ProductPrice.findOne({ product_id: product._id, variant_id: variant._id });
        labels.push({
          id: variant._id.toString(),
          name: product.name,
          variant_name: variant.name,
          barcode: variant.barcode || variant.sku_variant,
          price: price?.sell_price || 0,
          discount_price: price?.discount_price || 0,
        });
      }
    } else {
      const price = await ProductPrice.findOne({ product_id: product._id, variant_id: { $exists: false } });
      labels.push({
        id: product._id.toString(),
        name: product.name,
        barcode: product.barcode || product.sku,
        price: price?.sell_price || 0,
        discount_price: price?.discount_price || 0,
      });
    }
  }

  return <PrintLabelsClient labels={labels} />;
}
