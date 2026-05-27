import mongoose, { Schema, Document } from "mongoose";

export interface IPurchaseItem extends Document {
  purchase_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  cost: number;
  quantity: number;
  subtotal: number;
}

const PurchaseItemSchema: Schema = new Schema({
  purchase_id: { type: Schema.Types.ObjectId, ref: 'Purchase', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  cost: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.PurchaseItem || mongoose.model<IPurchaseItem>("PurchaseItem", PurchaseItemSchema);
