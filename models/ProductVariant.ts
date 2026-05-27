import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariant extends Document {
  product_id: mongoose.Types.ObjectId;
  name: string; // Misal: Merah - XL
  sku_variant: string;
  barcode?: string;
}

const ProductVariantSchema: Schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku_variant: { type: String, required: true, unique: true },
  barcode: { type: String },
}, { timestamps: true });

export default mongoose.models.ProductVariant || mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);
