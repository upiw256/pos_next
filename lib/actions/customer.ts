"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function getCustomers() {
  await connectToDatabase();
  const customers = await Customer.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(customers));
}

export async function getCustomer(id: string) {
  await connectToDatabase();
  const customer = await Customer.findById(id);
  return JSON.parse(JSON.stringify(customer));
}

export async function createCustomer(formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  
  await Customer.create({ name, phone, email, address });
  
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  await connectToDatabase();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  
  await Customer.findByIdAndUpdate(id, { name, phone, email, address });
  
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string) {
  await connectToDatabase();
  await Customer.findByIdAndDelete(id);
  revalidatePath("/admin/customers");
}
