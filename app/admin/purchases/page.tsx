import Link from "next/link";
import { PlusCircle, FileText, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { getPurchases, receivePurchase } from "@/lib/actions/purchase";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pembelian (Procurement)</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola pesanan pembelian ke supplier dan penerimaan stok.</p>
        </div>
        <Link 
          href="/admin/purchases/create" 
          className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800"
        >
          <PlusCircle className="w-4 h-4" />
          Buat PO Baru
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">No. Referensi</th>
              <th scope="col" className="px-6 py-3">Supplier</th>
              <th scope="col" className="px-6 py-3">Tanggal</th>
              <th scope="col" className="px-6 py-3">Total Amount</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((purchase: any) => (
                <tr key={purchase._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                    {purchase.reference_no}
                  </th>
                  <td className="px-6 py-4">
                    {purchase.supplier_id?.name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(purchase.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    Rp {purchase.total_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    {purchase.status === 'RECEIVED' ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 flex items-center w-fit gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Diterima
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-amber-900 dark:text-amber-300 flex items-center w-fit gap-1">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link href={`/admin/purchases/${purchase._id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-1">
                      <Eye className="w-4 h-4" /> Detail
                    </Link>
                    {purchase.status === 'PENDING' && (
                      <form action={async () => {
                        "use server";
                        await receivePurchase(purchase._id);
                      }}>
                        <button type="submit" className="font-medium text-green-600 dark:text-green-500 hover:underline flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Terima Barang
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada pesanan pembelian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
