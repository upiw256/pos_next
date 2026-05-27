"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, RefreshCcw, Search } from "lucide-react";
import { adjustStock } from "@/lib/actions/inventory";

interface AdjustStockPageProps {
  products: any[];
}

export default function AdjustStockForm({ products }: { products: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    variant_id: "",
    qty: 0,
    type: "ADJUSTMENT",
    note: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) {
      alert("Pilih produk terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      await adjustStock(formData);
      router.push("/admin/inventory");
      router.refresh();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Terjadi kesalahan saat menyimpan penyesuaian stok.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p._id === formData.product_id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <RefreshCcw className="w-5 h-5 text-amber-500" />
          Form Penyesuaian Stok
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pilih Produk</label>
            <select 
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value, variant_id: ""})}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {selectedProduct?.is_variant && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pilih Varian</label>
              <select 
                value={formData.variant_id}
                onChange={(e) => setFormData({...formData, variant_id: e.target.value})}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Pilih Varian --</option>
                {selectedProduct.variants?.map((v: any) => (
                  <option key={v._id} value={v._id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Jumlah Perubahan</label>
              <input 
                type="number" 
                value={formData.qty} 
                onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Contoh: 10 atau -5"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Gunakan angka negatif untuk mengurangi stok.</p>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipe Pergerakan</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ADJUSTMENT">Adjustment (Opname)</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Catatan / Alasan</label>
            <textarea 
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              rows={3}
              placeholder="Contoh: Barang rusak, salah hitung, dll"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" onClick={() => router.back()}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="submit" disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Penyesuaian</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
