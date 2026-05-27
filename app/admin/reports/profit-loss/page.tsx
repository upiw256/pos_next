import { getProfitLossReport } from "@/lib/actions/report";
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowLeft,
  PieChart
} from "lucide-react";
import Link from "next/link";

export default async function ProfitLossPage({
  searchParams
}: {
  searchParams: { start?: string; end?: string }
}) {
  const startDate = searchParams.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const endDate = searchParams.end || new Date().toISOString().slice(0, 10);

  const report = await getProfitLossReport(startDate, endDate);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Laporan Laba Rugi</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Periode: {startDate} s/d {endDate}</p>
          </div>
        </div>
        
        <form className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
           <input 
             type="date" name="start" defaultValue={startDate}
             className="text-xs border-none bg-transparent focus:ring-0 font-bold text-gray-600 dark:text-gray-300"
           />
           <span className="text-gray-300">|</span>
           <input 
             type="date" name="end" defaultValue={endDate}
             className="text-xs border-none bg-transparent focus:ring-0 font-bold text-gray-600 dark:text-gray-300"
           />
           <button type="submit" className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">Filter</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Summary View */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
               <DollarSign className="text-indigo-600" />
               Ringkasan Keuangan
            </h2>
            
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                   <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pendapatan Kotor</div>
                   <div className="text-lg font-black text-gray-900 dark:text-white">Rp {report.revenue.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                   <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Harga Pokok (HPP)</div>
                   <div className="text-lg font-black text-red-600">(Rp {report.cogs.toLocaleString()})</div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                   <div className="text-sm font-black text-indigo-600 uppercase tracking-wider">Laba Kotor</div>
                   <div className="text-xl font-black text-indigo-600">Rp {report.grossProfit.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                   <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Pengeluaran</div>
                   <div className="text-lg font-black text-rose-600">(Rp {report.totalExpenses.toLocaleString()})</div>
                </div>
                <div className={`flex justify-between items-center p-6 rounded-3xl shadow-lg ${report.netProfit >= 0 ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-red-600 text-white shadow-red-600/30'}`}>
                   <div className="text-sm font-black uppercase tracking-widest">Laba Bersih</div>
                   <div className="text-2xl font-black">Rp {report.netProfit.toLocaleString()}</div>
                </div>
            </div>
         </div>

         {/* Breakdown View */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
               <PieChart className="text-rose-600" />
               Rincian Pengeluaran
            </h2>
            
            <div className="space-y-4">
               {Object.entries(report.expenseBreakdown).length > 0 ? (
                 Object.entries(report.expenseBreakdown).map(([name, amount], index) => (
                   <div key={index} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                         <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{name}</span>
                         <span className="font-black text-rose-600">Rp {Number(amount).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                         <div 
                           className="bg-rose-500 h-1.5 rounded-full" 
                           style={{ width: `${(Number(amount) / Math.max(report.totalExpenses, 1)) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-20 text-gray-400 italic text-sm">
                    Tidak ada data pengeluaran pada periode ini.
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
