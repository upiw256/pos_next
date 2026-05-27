"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";

export async function getCategories() {
  await connectToDatabase();
  const categories = await Category.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(categories));
}

export async function getCategory(id: string) {
  await connectToDatabase();
  const category = await Category.findById(id);
  return JSON.parse(JSON.stringify(category));
}

export async function createCategory(formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  await Category.create({ name, slug });
  
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  await Category.findByIdAndUpdate(id, { name, slug });
  
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  await Category.findByIdAndDelete(id);
  revalidatePath("/admin/categories");
}
