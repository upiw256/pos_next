/**
 * Seed script: creates a default Super Admin user.
 * Run: node scripts/seed.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "cashier" },
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existing = await User.findOne({ email: "admin@pos.test" });
  if (existing) {
    console.log("ℹ️  Super Admin already exists:", existing.email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash("password", 10);
  await User.create({
    name: "Super Admin",
    email: "admin@pos.test",
    password: hashed,
    role: "super_admin",
  });

  console.log("✅ Super Admin created!");
  console.log("   Email   : admin@pos.test");
  console.log("   Password: password");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
