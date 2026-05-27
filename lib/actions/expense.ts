"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Expense from "@/models/Expense";
import ExpenseCategory from "@/models/ExpenseCategory";
import { auth } from "@/auth";

export async function getExpenseCategories() {
  await connectToDatabase();
  const cats = await ExpenseCategory.find().sort({ name: 1 });
  return JSON.parse(JSON.stringify(cats));
}

export async function createExpenseCategory(formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  await ExpenseCategory.create({ name });
  revalidatePath("/admin/expenses");
}

export async function getExpenses() {
  await connectToDatabase();
  await ExpenseCategory.find().limit(1); // ensure model registered
  const expenses = await Expense.find()
    .populate("category_id")
    .populate("user_id")
    .sort({ date: -1 });
  return JSON.parse(JSON.stringify(expenses));
}

export async function createExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  const amount = Number(formData.get("amount"));
  const category_id = formData.get("category_id") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;

  await Expense.create({
    category_id,
    amount,
    description,
    date: date ? new Date(date) : new Date(),
    user_id: (session.user as any).id,
  });

  revalidatePath("/admin/expenses");
  redirect("/admin/expenses");
}

export async function deleteExpense(id: string) {
  await connectToDatabase();
  await Expense.findByIdAndDelete(id);
  revalidatePath("/admin/expenses");
}
