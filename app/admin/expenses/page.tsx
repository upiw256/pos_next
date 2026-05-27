import Link from "next/link";
import { PlusCircle, Trash2, Wallet, Tags, Calendar, FileText } from "lucide-react";
import { getExpenses, getExpenseCategories, deleteExpense, createExpense, createExpenseCategory } from "@/lib/actions/expense";

export default async function ExpensesPage() {
  const [expenses, categories] = await Promise.all([getExpenses(), getExpenseCategories()]);

  const totalMonth = expenses
    .filter((e: any) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc: number, e: any) => acc + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengeluaran Operasional</h1>
          <p className="text-sm text-gray-500 mt-1">Catat biaya operasional (listrik, gaji, transport, dll).</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-rose-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-rose-600/20">
        <div>
          <p className="text-rose-100 text-sm font-bold uppercase tracking-widest">Total Pengeluaran Bulan Ini</p>
          <h2 className="text-4xl font-black mt-1">Rp {totalMonth.toLocaleString("id-ID")}</h2>
        </div>
        <Wallet className="w-20 h-20 opacity-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Expense Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" /> Tambah Pengeluaran
            </h2>
            <form action={createExpense} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                <select name="category_id" required className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Pilih Kategori</option>
                  {categories.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah (Rp)</label>
                <input type="number" name="amount" required min={0} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="50000" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan</label>
                <input type="text" name="description" required className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Bayar listrik bulan Mei" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm">
                Simpan Pengeluaran
              </button>
            </form>
          </div>

          {/* Add Category Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Tags className="w-5 h-5 text-amber-500" /> Tambah Kategori
            </h2>
            <form action={createExpenseCategory} className="flex gap-2">
              <input type="text" name="name" required placeholder="Misal: Listrik" className="flex-1 p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <button type="submit" className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm whitespace-nowrap">
                + Tambah
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c: any) => (
                <span key={c._id} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {expenses.length > 0 ? (
                  expenses.map((exp: any) => (
                    <tr key={exp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(exp.date).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-amber-900 dark:text-amber-300">
                          {exp.category_id?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{exp.description}</td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600">
                        Rp {exp.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <form action={async () => {
                          "use server";
                          await deleteExpense(exp._id);
                        }}>
                          <button type="submit" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic">
                      Belum ada pengeluaran tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
