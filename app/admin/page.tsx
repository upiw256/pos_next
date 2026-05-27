import { getDashboardStats, getWeeklySales } from "@/lib/actions/report";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Wallet, 
  Activity,
  ArrowUpRight,
  Users,
  Package,
  BarChart2
} from "lucide-react";
import Link from "next/link";
import SalesChart from "@/components/admin/SalesChart";

export default async function AdminDashboard() {
  const [stats, weeklySales] = await Promise.all([
    getDashboardStats(),
    getWeeklySales(),
  ]);

  const isProfit = stats.netProfit >= 0;

  const cards = [
    { 
      title: "Pendapatan Bulan Ini", 
      value: `Rp ${stats.totalSales.toLocaleString("id-ID")}`, 
      icon: DollarSign, 
      color: "blue",
      badge: `${stats.transactionCount} Transaksi`,
      badgeColor: "blue"
    },
    { 
      title: "Laba Kotor", 
      value: `Rp ${stats.grossProfit.toLocaleString("id-ID")}`, 
      icon: TrendingUp, 
      color: "emerald",
      badge: "Setelah HPP",
      badgeColor: "emerald"
    },
    { 
      title: "Total Pengeluaran", 
      value: `Rp ${stats.totalExpenses.toLocaleString("id-ID")}`, 
      icon: Wallet, 
      color: "rose",
      badge: "Biaya Operasional",
      badgeColor: "rose"
    },
    { 
      title: "Laba Bersih", 
      value: `Rp ${stats.netProfit.toLocaleString("id-ID")}`, 
      icon: Activity, 
      color: "indigo",
      badge: isProfit ? "Untung 🎉" : "Rugi ⚠️",
      badgeColor: isProfit ? "indigo" : "rose",
      isHighlight: true
    },
  ];

  const shortcuts = [
    { href: "/admin/cashier",          icon: ShoppingCart, label: "POS Kasir",    desc: "Mulai transaksi" },
    { href: "/admin/inventory",        icon: Package,      label: "Cek Stok",    desc: "Lihat inventori" },
    { href: "/admin/purchases/create", icon: ArrowUpRight, label: "Beli Stok",   desc: "Tambah pembelian" },
    { href: "/admin/customers",        icon: Users,        label: "Pelanggan",   desc: "Kelola customer" },
    { href: "/admin/sales",            icon: BarChart2,    label: "Penjualan",   desc: "Riwayat transaksi" },
    { href: "/admin/reports/profit-loss", icon: TrendingUp, label: "Laporan",   desc: "Laba rugi" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-xs font-semibold uppercase tracking-widest">
            Overview Kinerja Bisnis — Real Time
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 ${
                card.isHighlight
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${card.isHighlight ? "bg-white/20" : "bg-gray-50 dark:bg-gray-900"}`}>
                  <Icon className={`w-5 h-5 ${card.isHighlight ? "text-white" : "text-indigo-500"}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  card.isHighlight
                    ? "bg-white/20 text-white"
                    : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                }`}>
                  {card.badge}
                </span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${card.isHighlight ? "text-indigo-200" : "text-gray-400"}`}>
                {card.title}
              </p>
              <h3 className={`text-xl font-black leading-tight ${card.isHighlight ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {card.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Chart + Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Grafik Penjualan 7 Hari
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Total pendapatan harian</p>
            </div>
            <Link
              href="/admin/reports/profit-loss"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
            >
              Laporan Lengkap →
            </Link>
          </div>
          <SalesChart data={weeklySales} />
        </div>

        {/* Quick Access Shortcuts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Akses Cepat
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {shortcuts.map((s, i) => {
              const Icon = s.icon;
              return (
                <Link
                  key={i}
                  href={s.href}
                  className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group"
                >
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1 transition-colors" />
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-center leading-tight">
                    {s.label}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5 hidden group-hover:block">
                    {s.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
