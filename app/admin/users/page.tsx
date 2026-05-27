import Link from "next/link";
import { PlusCircle, Edit, Trash2, Shield, User as UserIcon } from "lucide-react";
import { getUsers, deleteUser } from "@/lib/actions/user";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin:       { label: "Super Admin",       color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  manager:           { label: "Manager",           color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  inventory_manager: { label: "Inventory Manager", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  cashier:           { label: "Kasir",             color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna dan hak akses sistem.</p>
        </div>
        <Link
          href="/admin/users/create"
          className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-4 py-2"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Pengguna
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: any) => {
          const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: "bg-gray-100 text-gray-800" };
          return (
            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Shield className="w-4 h-4 text-gray-300" />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <form action={async () => {
                    "use server";
                    await deleteUser(user._id);
                  }}>
                    <button type="submit" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 text-gray-400 italic">Belum ada pengguna.</div>
      )}
    </div>
  );
}
