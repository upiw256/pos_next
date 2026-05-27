import { getStocks } from "@/lib/actions/inventory";
import { Package, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import Link from "next/link";

export default async function InventoryPage() {
  const stocks = await getStocks();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Barang (Inventory)</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau jumlah stok barang yang tersedia di gudang.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/inventory/adjust" 
            className="flex items-center gap-2 text-white bg-amber-600 hover:bg-amber-700 font-medium rounded-lg text-sm px-4 py-2"
          >
            Penyesuaian Stok
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Item Stok</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stocks.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        {/* Add more widgets here later */}
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Produk / Varian</th>
              <th scope="col" className="px-6 py-3">Kategori</th>
              <th scope="col" className="px-6 py-3">Jumlah Stok</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length > 0 ? (
              stocks.map((stock: any) => (
                <tr key={stock._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div>
                      <div className="font-bold">{stock.product_id?.name}</div>
                      {stock.variant_id && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-normal">Varian: {stock.variant_id.name}</div>
                      )}
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    {stock.product_id?.category_id?.name || "-"}
                  </td>
                  <td className="px-6 py-4 font-bold text-lg">
                    {stock.quantity}
                  </td>
                  <td className="px-6 py-4">
                    {stock.quantity <= 5 ? (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                        Low Stock
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/inventory/history/${stock.product_id._id}${stock.variant_id ? `?variant=${stock.variant_id._id}` : ''}`} 
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                    >
                      <History className="w-4 h-4" /> Kartu Stok
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada data stok. Stok otomatis bertambah saat Transaksi Pembelian diterima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
