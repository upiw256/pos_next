import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  category_id: mongoose.Types.ObjectId;
  brand_id?: mongoose.Types.ObjectId;
  unit_id: mongoose.Types.ObjectId;
  is_variant: boolean;
  image_url?: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },
  unit_id: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  is_variant: { type: Boolean, default: false },
  image_url: { type: String },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
