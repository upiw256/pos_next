import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/actions/category";
import { getUnits } from "@/lib/actions/unit";
import { getBrands } from "@/lib/actions/brand";
import { getProduct } from "@/lib/actions/product";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [product, categories, units, brands] = await Promise.all([
    getProduct(resolvedParams.id),
    getCategories(),
    getUnits(),
    getBrands()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Produk</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui detail produk Anda.</p>
      </div>

      <ProductForm 
        categories={categories} 
        units={units} 
        brands={brands} 
        initialData={product}
      />
    </div>
  );
}
