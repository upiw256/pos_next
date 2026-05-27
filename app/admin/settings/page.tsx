"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/actions/setting";
import { Save, Store, MapPin, Phone, Receipt } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    receipt_footer: "",
    tax_percentage: 11,
    tax_id: ""
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setFormData({
        store_name: data.store_name || "",
        store_address: data.store_address || "",
        store_phone: data.store_phone || "",
        receipt_footer: data.receipt_footer || "",
        tax_percentage: data.tax_percentage || 11,
        tax_id: data.tax_id || ""
      });
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tax_percentage' ? parseFloat(value) : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      alert("Pengaturan berhasil disimpan!");
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Memuat Pengaturan...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pengaturan Toko</h1>
      
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Store className="w-4 h-4" /> Nama Toko
              </label>
              <input 
                type="text" 
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-indigo-600 focus:border-indigo-600 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="Ex: Toko Gemilang"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4" /> No. Telepon
              </label>
              <input 
                type="text" 
                name="store_phone"
                value={formData.store_phone}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-indigo-600 focus:border-indigo-600 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="Ex: 0812345678"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Alamat Toko
              </label>
              <textarea 
                name="store_address"
                value={formData.store_address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-indigo-600 focus:border-indigo-600 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="Ex: Jl. Raya Kemerdekaan No 123"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Catatan Kaki (Footer Struk)
              </label>
              <input 
                type="text" 
                name="receipt_footer"
                value={formData.receipt_footer}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-indigo-600 focus:border-indigo-600 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="Ex: Terima Kasih Atas Kunjungan Anda"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Persentase Pajak Default (%)
              </label>
              <input 
                type="number" 
                name="tax_percentage"
                value={formData.tax_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-indigo-600 focus:border-indigo-600 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> NPWP / Tax ID (Opsional)
              </label>
              <input 
                type="text" 
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-indigo-600 focus:border-indigo-600 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="Ex: 01.234.567.8-901.000"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
