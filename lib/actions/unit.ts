"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Unit from "@/models/Unit";

export async function getUnits() {
  await connectToDatabase();
  const units = await Unit.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(units));
}

export async function getUnit(id: string) {
  await connectToDatabase();
  const unit = await Unit.findById(id);
  return JSON.parse(JSON.stringify(unit));
}

export async function createUnit(formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get("name") as string;
  const short_name = formData.get("short_name") as string;
  
  await Unit.create({ name, short_name });
  
  revalidatePath("/admin/units");
  redirect("/admin/units");
}

export async function updateUnit(id: string, formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get("name") as string;
  const short_name = formData.get("short_name") as string;
  
  await Unit.findByIdAndUpdate(id, { name, short_name });
  
  revalidatePath("/admin/units");
  redirect("/admin/units");
}

export async function deleteUnit(id: string) {
  await connectToDatabase();
  await Unit.findByIdAndDelete(id);
  revalidatePath("/admin/units");
}
