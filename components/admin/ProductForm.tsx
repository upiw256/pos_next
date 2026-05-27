"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, Package } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/actions/product";

interface ProductFormProps {
  categories: any[];
  units: any[];
  brands: any[];
  initialData?: any;
}

export default function ProductForm({ categories, units, brands, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    category_id: initialData?.category_id?._id || initialData?.category_id || "",
    brand_id: initialData?.brand_id?._id || initialData?.brand_id || "",
    unit_id: initialData?.unit_id?._id || initialData?.unit_id || "",
    is_variant: initialData?.is_variant || false,
    image_url: initialData?.image_url || "",
    base_cost: initialData?.prices?.find((p: any) => !p.variant_id)?.base_cost || 0,
    sell_price: initialData?.prices?.find((p: any) => !p.variant_id)?.sell_price || 0,
    discount_price: initialData?.prices?.find((p: any) => !p.variant_id)?.discount_price || 0,
    variants: initialData?.variants?.map((v: any) => {
      const price = initialData.prices.find((p: any) => p.variant_id === v._id);
      return {
        _id: v._id,
        name: v.name,
        sku_variant: v.sku_variant,
        barcode: v.barcode,
        base_cost: price?.base_cost || 0,
        sell_price: price?.sell_price || 0,
        discount_price: price?.discount_price || 0,
      };
    }) || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: "", sku_variant: "", barcode: "", base_cost: 0, sell_price: 0, discount_price: 0 }
      ]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [name]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?._id) {
        await updateProduct(initialData._id, formData);
      } else {
        await createProduct(formData);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informasi Dasar</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Produk</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Contoh: Kopi Susu Gula Aren"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">SKU Utama</label>
                <input 
                  type="text" name="sku" value={formData.sku} onChange={handleChange} required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="KSGA-001"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Barcode (Opsional)</label>
                <input 
                  type="text" name="barcode" value={formData.barcode} onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">URL Gambar</label>
                <input 
                  type="text" name="image_url" value={formData.image_url} onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classification Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Klasifikasi & Satuan</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kategori</label>
              <select 
                name="category_id" value={formData.category_id} onChange={handleChange} required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Merk (Opsional)</label>
                <select 
                  name="brand_id" value={formData.brand_id} onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Pilih Merk</option>
                  {brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Satuan</label>
                <select 
                  name="unit_id" value={formData.unit_id} onChange={handleChange} required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Pilih Satuan</option>
                  {units.map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center mt-6">
              <input 
                id="is_variant" type="checkbox" name="is_variant" checked={formData.is_variant} onChange={handleChange}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="is_variant" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Produk Memiliki Varian (Warna, Ukuran, dsb)</label>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing / Variants Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {!formData.is_variant ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Harga Produk (Simple)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Harga Modal / HPP</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">Rp</span>
                  <input 
                    type="number" name="base_cost" value={formData.base_cost} onChange={handleChange}
                    className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Harga Jual</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">Rp</span>
                  <input 
                    type="number" name="sell_price" value={formData.sell_price} onChange={handleChange}
                    className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Harga Diskon (Opsional)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">Rp</span>
                  <input 
                    type="number" name="discount_price" value={formData.discount_price} onChange={handleChange}
                    className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Varian Produk</h2>
              <button 
                type="button" onClick={addVariant}
                className="flex items-center gap-1 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-xs px-3 py-1.5"
              >
                <Plus className="w-3 h-3" /> Tambah Varian
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Nama Varian</th>
                    <th className="px-4 py-2">SKU Varian</th>
                    <th className="px-4 py-2">Barcode</th>
                    <th className="px-4 py-2">HPP (Rp)</th>
                    <th className="px-4 py-2">Jual (Rp)</th>
                    <th className="px-4 py-2">Diskon (Rp)</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {formData.variants.map((variant: any, index: number) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input 
                          type="text" name="name" value={variant.name} onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Misal: Merah, XL"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" name="sku_variant" value={variant.sku_variant} onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" name="barcode" value={variant.barcode} onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" name="base_cost" value={variant.base_cost} onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" name="sell_price" value={variant.sell_price} onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" name="discount_price" value={variant.discount_price} onChange={(e) => handleVariantChange(index, e)}
                          className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.variants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-400 italic">Klik tombol "Tambah Varian" untuk memulai.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end items-center gap-3">
        <button 
          type="button" onClick={() => router.back()}
          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 border border-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        >
          Batal
        </button>
        <button 
          type="submit" disabled={loading}
          className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center gap-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {initialData ? "Simpan Perubahan" : "Tambah Produk"}
        </button>
      </div>
    </form>
  );
}
