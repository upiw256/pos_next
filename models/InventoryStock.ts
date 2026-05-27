import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryStock extends Document {
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  outlet_id?: mongoose.Types.ObjectId; // Optional for now, useful for multi-outlet
  quantity: number;
  location?: string;
}

const InventoryStockSchema: Schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  outlet_id: { type: Schema.Types.ObjectId, ref: 'Outlet' },
  quantity: { type: Number, required: true, default: 0 },
  location: { type: String },
}, { timestamps: true });

// Ensure uniqueness per product/variant per outlet
InventoryStockSchema.index({ product_id: 1, variant_id: 1, outlet_id: 1 }, { unique: true });

export default mongoose.models.InventoryStock || mongoose.model<IInventoryStock>("InventoryStock", InventoryStockSchema);
