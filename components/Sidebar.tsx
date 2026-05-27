"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, Package, Tags, Layers, Users, Truck,
  Settings, ShoppingCart, Wallet, BarChart2, Shield
} from "lucide-react";

const ROLE_LEVELS: Record<string, number> = {
  cashier: 1,
  inventory_manager: 2,
  manager: 3,
  super_admin: 4,
};

const menuItems = [
  { name: "Dashboard",         href: "/admin",                         icon: LayoutDashboard, minLevel: 1 },
  // --- Master Data ---
  { name: "Master Data",       href: "#",  icon: Layers,         isHeader: true, minLevel: 3 },
  { name: "Kategori",          href: "/admin/categories",              icon: Layers,         minLevel: 3 },
  { name: "Satuan (Unit)",     href: "/admin/units",                   icon: Tags,           minLevel: 3 },
  { name: "Merk (Brand)",      href: "/admin/brands",                  icon: Tags,           minLevel: 3 },
  { name: "Produk",            href: "/admin/products",                icon: Package,        minLevel: 2 },
  { name: "Supplier",          href: "/admin/suppliers",               icon: Truck,          minLevel: 3 },
  { name: "Customer",          href: "/admin/customers",               icon: Users,          minLevel: 3 },
  // --- Inventory ---
  { name: "Inventory",         href: "#",  icon: Package,        isHeader: true, minLevel: 2 },
  { name: "Stok Barang",       href: "/admin/inventory",               icon: Package,        minLevel: 2 },
  { name: "Pembelian",         href: "/admin/purchases",               icon: ShoppingCart,   minLevel: 2 },
  // --- Sales & Finance ---
  { name: "Sales & Finance",   href: "#",  icon: ShoppingCart,   isHeader: true, minLevel: 1 },
  { name: "Kasir (POS)",       href: "/admin/cashier",                 icon: ShoppingCart,   minLevel: 1 },
  { name: "Riwayat Penjualan", href: "/admin/sales",                   icon: ShoppingCart,   minLevel: 3 },
  { name: "Pengeluaran",       href: "/admin/expenses",                icon: Wallet,         minLevel: 3 },
  // --- Laporan ---
  { name: "Laporan",           href: "#",  icon: BarChart2,      isHeader: true, minLevel: 3 },
  { name: "Laba Rugi",         href: "/admin/reports/profit-loss",     icon: BarChart2,      minLevel: 3 },
  // --- Admin ---
  { name: "Admin",             href: "#",  icon: Shield,         isHeader: true, minLevel: 4 },
  { name: "Pengguna",          href: "/admin/users",                   icon: Shield,         minLevel: 4 },
  { name: "Pengaturan",        href: "/admin/settings",                icon: Settings,       minLevel: 4 },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role ?? "cashier";
  const userLevel = ROLE_LEVELS[role] ?? 1;

  const visible = menuItems.filter(item => (item.minLevel ?? 1) <= userLevel);

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-6 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-1 font-medium">
          {visible.map((item: any, index: number) => {
            const Icon = item.icon;
            if (item.isHeader) {
              return (
                <li key={index} className="pt-5 pb-1">
                  <span className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest dark:text-gray-500">
                    {item.name}
                  </span>
                </li>
              );
            }
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2.5 rounded-xl group transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white"}`} />
                  <span className="ms-3 text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
