import mongoose, { Schema, Document } from "mongoose";

export interface IStockMovement extends Document {
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  qty: number; // Positive for IN/ADJ, Negative for OUT (or handle via type)
  ref_type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER';
  ref_id?: mongoose.Types.ObjectId;
  note?: string;
  user_id: mongoose.Types.ObjectId;
}

const StockMovementSchema: Schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  qty: { type: Number, required: true },
  ref_type: { type: String, enum: ['PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER'], required: true },
  ref_id: { type: Schema.Types.ObjectId },
  note: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.StockMovement || mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
