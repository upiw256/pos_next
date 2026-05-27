import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/actions/category";
import { getUnits } from "@/lib/actions/unit";
import { getBrands } from "@/lib/actions/brand";

export default async function CreateProductPage() {
  const [categories, units, brands] = await Promise.all([
    getCategories(),
    getUnits(),
    getBrands()
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Produk Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Masukkan detail produk untuk menambahkannya ke stok.</p>
      </div>

      <ProductForm 
        categories={categories} 
        units={units} 
        brands={brands} 
      />
    </div>
  );
}
