import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Check if super admin exists
  const existingAdmin = await User.findOne({ email: "admin@pos.test" });
  if (existingAdmin) {
    console.log("Super Admin already exists.");
  } else {
    const hashedPassword = await bcrypt.hash("password", 10);
    const superAdmin = new User({
      name: "Super Admin",
      email: "admin@pos.test",
      password: hashedPassword,
      role: "super_admin",
    });

    await superAdmin.save();
    console.log("Super Admin created successfully: admin@pos.test / password");
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch(console.error);
