import { getProducts } from "@/lib/actions/product";
import AdjustStockForm from "@/components/admin/AdjustStockForm";

export default async function AdjustStockPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penyesuaian Stok Barang</h1>
        <p className="text-sm text-gray-500 mt-1">Gunakan formulir ini untuk menyesuaikan jumlah stok secara manual.</p>
      </div>

      <AdjustStockForm products={products} />
    </div>
  );
}
