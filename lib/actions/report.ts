"use server";

import connectToDatabase from "@/lib/mongodb";
import Sale from "@/models/Sale";
import SaleItem from "@/models/SaleItem";
import Expense from "@/models/Expense";
import Purchase from "@/models/Purchase";

export async function getDashboardStats() {
  await connectToDatabase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Total Sales (Monthly)
  const sales = await Sale.find({ 
    status: 'COMPLETED',
    createdAt: { $gte: startOfMonth }
  });
  const totalSales = sales.reduce((acc, sale) => acc + sale.grand_total, 0);

  // 2. Total HPP (Cost of Goods Sold)
  // We need to sum up cost_price * quantity from SaleItems of these sales
  const saleIds = sales.map(s => s._id);
  const saleItems = await SaleItem.find({ sale_id: { $in: saleIds } });
  const totalHPP = saleItems.reduce((acc, item) => acc + (item.cost_price * item.quantity), 0);

  // 3. Gross Profit
  const grossProfit = totalSales - totalHPP;

  // 4. Total Expenses
  const expenses = await Expense.find({
    date: { $gte: startOfMonth }
  });
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // 5. Net Profit
  const netProfit = grossProfit - totalExpenses;

  // 6. Transaction Count
  const transactionCount = sales.length;

  return JSON.parse(JSON.stringify({
    totalSales,
    totalHPP,
    grossProfit,
    totalExpenses,
    netProfit,
    transactionCount
  }));
}

export async function getWeeklySales() {
  await connectToDatabase();

  const days: { date: string; total: number; transactions: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      status: "COMPLETED",
      createdAt: { $gte: start, $lte: end },
    });

    days.push({
      date: day.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      total: sales.reduce((acc, s) => acc + s.grand_total, 0),
      transactions: sales.length,
    });
  }

  return days;
}

export async function getProfitLossReport(startDate: string, endDate: string) {
  await connectToDatabase();

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const sales = await Sale.find({ 
    status: 'COMPLETED',
    createdAt: { $gte: start, $lte: end }
  });
  
  const saleIds = sales.map(s => s._id);
  const saleItems = await SaleItem.find({ sale_id: { $in: saleIds } });

  const revenue = sales.reduce((acc, s) => acc + s.grand_total, 0);
  const cogs = saleItems.reduce((acc, item) => acc + (item.cost_price * item.quantity), 0);
  const grossProfit = revenue - cogs;

  const expenses = await Expense.find({
    date: { $gte: start, $lte: end }
  }).populate("category_id");

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Group expenses by category
  const expenseBreakdown: Record<string, number> = {};
  expenses.forEach((e: any) => {
    const catName = e.category_id?.name || "Lainnya";
    expenseBreakdown[catName] = (expenseBreakdown[catName] || 0) + e.amount;
  });

  return JSON.parse(JSON.stringify({
    revenue,
    cogs,
    grossProfit,
    totalExpenses,
    netProfit,
    expenseBreakdown,
    transactionCount: sales.length
  }));
}
