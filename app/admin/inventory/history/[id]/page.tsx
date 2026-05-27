import { getStockHistory } from "@/lib/actions/inventory";
import { getProduct } from "@/lib/actions/product";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCcw, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StockHistoryPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { variant?: string } 
}) {
  const [product, history] = await Promise.all([
    getProduct(params.id),
    getStockHistory(params.id, searchParams.variant)
  ]);

  if (!product) notFound();

  const variant = product.variants?.find((v: any) => v._id === searchParams.variant);

  const getIcon = (type: string, ref_type: string) => {
    if (ref_type === 'PURCHASE') return <Truck className="w-4 h-4 text-blue-500" />;
    if (ref_type === 'SALE') return <ShoppingBag className="w-4 h-4 text-green-500" />;
    if (ref_type === 'ADJUSTMENT') return <RefreshCcw className="w-4 h-4 text-amber-500" />;
    return type === 'IN' ? <ArrowUpRight className="w-4 h-4 text-blue-500" /> : <ArrowDownLeft className="w-4 h-4 text-red-500" />;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/inventory" className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kartu Stok (Histori Pergerakan)</h1>
          <p className="text-sm text-gray-500 mt-1">
            {product.name} {variant ? `- Varian: ${variant.name}` : ''}
          </p>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Waktu</th>
              <th scope="col" className="px-6 py-3">Tipe</th>
              <th scope="col" className="px-6 py-3">Referensi</th>
              <th scope="col" className="px-6 py-3">Jumlah</th>
              <th scope="col" className="px-6 py-3">User</th>
              <th scope="col" className="px-6 py-3">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.length > 0 ? (
              history.map((move: any) => (
                <tr key={move._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(move.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getIcon(move.type, move.ref_type)}
                      <span className={`font-medium ${move.type === 'IN' ? 'text-blue-600' : move.type === 'OUT' ? 'text-red-600' : 'text-amber-600'}`}>
                        {move.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                      {move.ref_type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold text-lg ${move.type === 'IN' ? 'text-blue-600' : move.type === 'OUT' ? 'text-red-600' : 'text-amber-600'}`}>
                    {move.type === 'OUT' ? '-' : '+'}{move.qty}
                  </td>
                  <td className="px-6 py-4">
                    {move.user_id?.name || "System"}
                  </td>
                  <td className="px-6 py-4 italic text-xs">
                    {move.note || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada pergerakan stok untuk barang ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
