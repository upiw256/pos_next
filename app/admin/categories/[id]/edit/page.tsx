import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategory, updateCategory } from "@/lib/actions/category";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const category = await getCategory(resolvedParams.id);

  if (!category) {
    return <div>Kategori tidak ditemukan.</div>;
  }

  // Bind the ID to the update action
  const updateCategoryWithId = updateCategory.bind(null, resolvedParams.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Kategori</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-6">
        <form action={updateCategoryWithId} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Kategori</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              defaultValue={category.name}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" 
              required 
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
              Perbarui Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
