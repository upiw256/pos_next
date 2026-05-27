import { getUser, updateUser } from "@/lib/actions/user";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  if (!user) notFound();

  const update = updateUser.bind(null, params.id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users" className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Perbarui data akun: {user.name}</p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <form action={update} className="space-y-5">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
              <input
                type="text" name="name" required defaultValue={user.name}
                className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email" name="email" required defaultValue={user.email}
                className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Baru <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>
              </label>
              <input
                type="password" name="password" minLength={6}
                placeholder="•••••••••"
                className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Role / Jabatan</label>
              <select
                name="role" required defaultValue={user.role}
                className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="cashier">Kasir</option>
                <option value="inventory_manager">Inventory Manager</option>
                <option value="manager">Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/admin/users" className="flex-1 py-3 text-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">
                Batal
              </Link>
              <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
