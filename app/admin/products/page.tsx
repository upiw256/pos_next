import { getProducts } from "@/lib/actions/product";
import ProductListClient from "@/components/admin/ProductListClient";

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductListClient products={products} />;
}
