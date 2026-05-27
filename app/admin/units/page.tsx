import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { getUnits, deleteUnit } from "@/lib/actions/unit";

export default async function UnitsPage() {
  const units = await getUnits();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Satuan Barang (Unit)</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar satuan fisik produk (Dus, Pcs, dll).</p>
        </div>
        <Link 
          href="/admin/units/create" 
          className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Satuan
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Satuan</th>
              <th scope="col" className="px-6 py-3">Singkatan (Short Name)</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {units.length > 0 ? (
              units.map((unit: any) => (
                <tr key={unit._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {unit.name}
                  </th>
                  <td className="px-6 py-4">
                    {unit.short_name}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link href={`/admin/units/${unit._id}/edit`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteUnit(unit._id);
                    }}>
                      <button type="submit" className="font-medium text-red-600 dark:text-red-500 hover:underline flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada satuan. Silakan tambahkan satuan baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
