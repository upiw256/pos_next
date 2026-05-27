import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  reference_no: string;
  supplier_id: mongoose.Types.ObjectId;
  date: Date;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  payment_status: 'UNPAID' | 'PARTIAL' | 'PAID';
  total_amount: number;
  note?: string;
  user_id: mongoose.Types.ObjectId;
}

const PurchaseSchema: Schema = new Schema({
  reference_no: { type: String, required: true, unique: true },
  supplier_id: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'RECEIVED', 'CANCELLED'], default: 'PENDING' },
  payment_status: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID'], default: 'UNPAID' },
  total_amount: { type: Number, required: true, default: 0 },
  note: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);
