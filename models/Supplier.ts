import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const SupplierSchema: Schema = new Schema({
  name: { type: String, required: true },
  contact_person: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema);
