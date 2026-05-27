import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem extends Document {
  sale_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  unit_price: number;
  cost_price: number; // For profit calculation
  quantity: number;
  subtotal: number;
}

const SaleItemSchema: Schema = new Schema({
  sale_id: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  unit_price: { type: Number, required: true },
  cost_price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.SaleItem || mongoose.model<ISaleItem>("SaleItem", SaleItemSchema);
