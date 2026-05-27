import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  total_points: number;
  debt_balance: number;
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  total_points: { type: Number, default: 0 },
  debt_balance: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
