import { getSales } from "@/lib/actions/sale";
import { ShoppingCart, Eye, Calendar, User, Banknote, CreditCard, QrCode } from "lucide-react";
import Link from "next/link";

export default async function SalesPage() {
  const sales = await getSales();

  const getPaymentIcon = (method: string) => {
    if (method === 'CASH') return <Banknote className="w-4 h-4" />;
    if (method === 'TRANSFER') return <CreditCard className="w-4 h-4" />;
    if (method === 'QRIS') return <QrCode className="w-4 h-4" />;
    return <Banknote className="w-4 h-4" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Penjualan</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau semua transaksi yang dilakukan melalui kasir.</p>
        </div>
        <Link 
          href="/admin/cashier" 
          className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-4 py-2"
        >
          Buka Kasir
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">No. Invoice</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Waktu</th>
              <th scope="col" className="px-6 py-3">Metode</th>
              <th scope="col" className="px-6 py-3 text-right">Grand Total</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sales.length > 0 ? (
              sales.map((sale: any) => (
                <tr key={sale._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                    {sale.reference_no}
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                        <User className="w-3 h-3" />
                         {sale.customer_id?.name || "Umum (Walk-in)"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sale.createdAt).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit text-xs font-medium">
                       {getPaymentIcon(sale.payment_method)}
                       {sale.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600 text-lg">
                    Rp {sale.grand_total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/sales/${sale._id}`} className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" /> Detail
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada transaksi penjualan yang tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
