"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function getUsers() {
  await connectToDatabase();
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function getUser(id: string) {
  await connectToDatabase();
  const user = await User.findById(id).select("-password");
  return JSON.parse(JSON.stringify(user));
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email sudah digunakan");

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  const updateData: any = { name, email, role };
  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await User.findByIdAndUpdate(id, updateData);

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "super_admin") {
    throw new Error("Unauthorized");
  }
  // Prevent deleting self
  if ((session.user as any).id === id) throw new Error("Tidak dapat menghapus akun sendiri");

  await connectToDatabase();
  await User.findByIdAndDelete(id);
  revalidatePath("/admin/users");
}
