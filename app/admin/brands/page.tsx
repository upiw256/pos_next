import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { getBrands, deleteBrand } from "@/lib/actions/brand";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Merk (Brand)</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar merk atau brand produk.</p>
        </div>
        <Link 
          href="/admin/brands/create" 
          className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Merk
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Merk</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {brands.length > 0 ? (
              brands.map((brand: any) => (
                <tr key={brand._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {brand.name}
                  </th>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link href={`/admin/brands/${brand._id}/edit`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteBrand(brand._id);
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
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada merk. Silakan tambahkan merk baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
