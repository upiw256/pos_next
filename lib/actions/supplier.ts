"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Supplier from "@/models/Supplier";

export async function getSuppliers() {
  await connectToDatabase();
  const suppliers = await Supplier.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(suppliers));
}

export async function getSupplier(id: string) {
  await connectToDatabase();
  const supplier = await Supplier.findById(id);
  return JSON.parse(JSON.stringify(supplier));
}

export async function createSupplier(formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  
  await Supplier.create({ name, contact_person, phone, email, address });
  
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function updateSupplier(id: string, formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  
  await Supplier.findByIdAndUpdate(id, { name, contact_person, phone, email, address });
  
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function deleteSupplier(id: string) {
  await connectToDatabase();
  await Supplier.findByIdAndDelete(id);
  revalidatePath("/admin/suppliers");
}
