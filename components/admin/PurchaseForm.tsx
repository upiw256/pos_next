"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, Search } from "lucide-react";
import { createPurchase } from "@/lib/actions/purchase";

interface PurchaseFormProps {
  suppliers: any[];
  products: any[];
}

export default function PurchaseForm({ suppliers, products }: PurchaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
    items: [] as any[]
  });

  const addItem = (product: any, variant: any = null) => {
    const item = {
      product_id: product._id,
      product_name: product.name,
      variant_id: variant?._id || null,
      variant_name: variant?.name || null,
      cost: 0,
      quantity: 1,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Harap tambahkan minimal satu item.");
      return;
    }
    setLoading(true);
    try {
      await createPurchase(formData);
      router.push("/admin/purchases");
      router.refresh();
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert("Terjadi kesalahan saat membuat pesanan pembelian.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Info Pesanan</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Supplier</label>
              <select 
                name="supplier_id" value={formData.supplier_id} onChange={(e) => setFormData({...formData, supplier_id: e.target.value})} required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Pilih Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tanggal</label>
              <input 
                type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Catatan</label>
              <textarea 
                value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}
                rows={3}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Total Items</span>
                <span className="font-bold">{formData.items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-bold text-indigo-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Barang</h2>
            
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <select 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 ps-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) => {
                  if (e.target.value) {
                    const [prodId, varId] = e.target.value.split('|');
                    const product = products.find(p => p._id === prodId);
                    const variant = product?.variants?.find((v: any) => v._id === varId);
                    addItem(product, variant);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Cari & Tambah Produk...</option>
                {products.map(p => (
                  p.is_variant ? (
                    p.variants?.map((v: any) => (
                      <option key={`${p._id}|${v._id}`} value={`${p._id}|${v._id}`}>
                        {p.name} - {v.name}
                      </option>
                    ))
                  ) : (
                    <option key={p._id} value={`${p._id}|`}>{p.name}</option>
                  )
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2">Nama Barang</th>
                  <th className="px-4 py-2 w-32">Harga Beli (Rp)</th>
                  <th className="px-4 py-2 w-24">Jumlah</th>
                  <th className="px-4 py-2 w-32">Subtotal</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <div className="font-medium text-gray-900 dark:text-white">{item.product_name}</div>
                      {item.variant_name && <div className="text-xs text-indigo-500">Varian: {item.variant_name}</div>}
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" value={item.cost} onChange={(e) => handleItemChange(index, 'cost', Number(e.target.value))}
                        className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </td>
                    <td className="p-2 font-medium">
                      Rp {(item.cost * item.quantity).toLocaleString('id-ID')}
                    </td>
                    <td className="p-2">
                      <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {formData.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 italic">Harap pilih produk menggunakan pencarian di atas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          type="button" onClick={() => router.back()}
          className="text-gray-500 bg-white hover:bg-gray-100 border border-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Batal
        </button>
        <button 
          type="submit" disabled={loading || formData.items.length === 0}
          className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center gap-2"
        >
          {loading ? "Memproses..." : <><Save className="w-4 h-4" /> Simpan Pesanan</>}
        </button>
      </div>
    </form>
  );
}
