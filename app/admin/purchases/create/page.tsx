import PurchaseForm from "@/components/admin/PurchaseForm";
import { getSuppliers } from "@/lib/actions/supplier";
import { getProducts } from "@/lib/actions/product";

export default async function CreatePurchasePage() {
  const [suppliers, products] = await Promise.all([
    getSuppliers(),
    getProducts()
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Pesanan Pembelian (PO)</h1>
        <p className="text-sm text-gray-500 mt-1">Buat pesanan baru ke supplier untuk menambah stok barang.</p>
      </div>

      <PurchaseForm suppliers={suppliers} products={products} />
    </div>
  );
}
