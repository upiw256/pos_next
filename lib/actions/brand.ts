"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Brand from "@/models/Brand";

export async function getBrands() {
  await connectToDatabase();
  const brands = await Brand.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(brands));
}

export async function getBrand(id: string) {
  await connectToDatabase();
  const brand = await Brand.findById(id);
  return JSON.parse(JSON.stringify(brand));
}

export async function createBrand(formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  await Brand.create({ name });
  
  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function updateBrand(id: string, formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  await Brand.findByIdAndUpdate(id, { name });
  
  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrand(id: string) {
  await connectToDatabase();
  await Brand.findByIdAndDelete(id);
  revalidatePath("/admin/brands");
}
