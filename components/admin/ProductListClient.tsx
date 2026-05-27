"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Package, Printer } from "lucide-react";
import Image from "next/image";
import { deleteProduct } from "@/lib/actions/product";
import { useRouter } from "next/navigation";

export default function ProductListClient({ products }: { products: any[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrintLabels = () => {
    if (selectedIds.length === 0) return;
    const url = `/admin/products/print?ids=${selectedIds.join(",")}`;
    window.open(url, "_blank");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      await deleteProduct(id);
      router.refresh();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola stok dan harga produk Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handlePrintLabels}
              className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
            >
              <Printer className="w-4 h-4" />
              Cetak Label ({selectedIds.length})
            </button>
          )}
          <Link 
            href="/admin/products/create" 
            className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4 w-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={products.length > 0 && selectedIds.length === products.length}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
              </th>
              <th scope="col" className="px-6 py-3">Produk</th>
              <th scope="col" className="px-6 py-3">SKU / Barcode</th>
              <th scope="col" className="px-6 py-3">Kategori</th>
              <th scope="col" className="px-6 py-3">Satuan</th>
              <th scope="col" className="px-6 py-3">Tipe</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(product._id)}
                        onChange={() => handleSelect(product._id)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                      />
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <div className="w-10 h-10 rounded overflow-hidden relative border border-gray-200">
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold cursor-pointer" onClick={() => handleSelect(product._id)}>{product.name}</div>
                        <div className="text-xs text-gray-500">{product.brand_id?.name || "-"}</div>
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono">{product.sku}</div>
                    <div className="text-xs text-gray-400">{product.barcode || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {product.category_id?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.unit_id?.name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {product.is_variant ? (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                        Variant
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                        Simple
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link href={`/admin/products/${product._id}/edit`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(product._id)} 
                      className="font-medium text-red-600 dark:text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada produk. Silakan tambahkan produk baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
