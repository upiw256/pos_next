"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { auth } from "@/auth";

export async function getSettings() {
  await connectToDatabase();
  const setting = await Setting.findOne({});
  if (!setting) {
    // Return default fallback if not created yet
    return {
      store_name: "POS SYSTEM",
      store_address: "Alamat Toko Default",
      store_phone: "0812345678",
      receipt_footer: "Terima Kasih Atas Kunjungan Anda",
      tax_percentage: 11,
      tax_id: ""
    };
  }
  return JSON.parse(JSON.stringify(setting));
}

export async function updateSettings(data: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  // Basic RBAC server-side protection - assume super admin needed for settings
  if ((session.user as any)?.role !== 'super_admin') {
    throw new Error("Forbidden: Super Admin only");
  }

  await connectToDatabase();
  
  const setting = await Setting.findOneAndUpdate(
    {}, 
    { $set: data }, 
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Bust cache since settings affect multiple components
  revalidatePath("/", "layout");
  return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
}
