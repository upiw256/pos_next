import mongoose from "mongoose";
import "@/models/Customer";
import "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then(async (mongooseInstance) => {
      // Auto-seed admin user if missing
      try {
        const User = mongooseInstance.models.User || mongooseInstance.model("User", new mongooseInstance.Schema({
          name: String,
          email: { type: String, unique: true },
          password: String,
          role: { type: String, default: "cashier" },
        }, { timestamps: true }));
        
        const existing = await User.findOne({ email: "admin@pos.test" });
        if (!existing) {
          const bcryptjs = require("bcryptjs");
          const hashed = await bcryptjs.hash("password", 10);
          await User.create({
            name: "Super Admin",
            email: "admin@pos.test",
            password: hashed,
            role: "super_admin",
          });
          console.log("✅ Super Admin seed inserted successfully via connection.");
        }
      } catch (err) {
        console.error("Failed to seed admin:", err);
      }

      return mongooseInstance;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
