import mongoose, { Schema, Document } from "mongoose";
import "@/models/Customer";
import "@/models/User";

export interface ISale extends Document {
  reference_no: string;
  user_id: mongoose.Types.ObjectId;
  customer_id?: mongoose.Types.ObjectId;
  total_price: number;
  tax: number;
  discount: number;
  grand_total: number;
  status: 'COMPLETED' | 'CANCELLED';
  payment_method: 'CASH' | 'TRANSFER' | 'QRIS';
  payment_status: 'PAID' | 'UNPAID';
  paid_amount?: number;
  change_amount?: number;
  payment_provider?: string;
  note?: string;
}

const SaleSchema: Schema = new Schema({
  reference_no: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer' },
  total_price: { type: Number, required: true, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grand_total: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
  payment_method: { type: String, enum: ['CASH', 'TRANSFER', 'QRIS'], default: 'CASH' },
  payment_status: { type: String, enum: ['PAID', 'UNPAID'], default: 'PAID' },
  paid_amount: { type: Number },
  change_amount: { type: Number },
  payment_provider: { type: String },
  note: { type: String },
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
