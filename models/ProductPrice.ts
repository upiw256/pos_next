import mongoose, { Schema, Document } from "mongoose";

export interface IProductPrice extends Document {
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  base_cost: number;
  sell_price: number;
  discount_price?: number;
  active_from: Date;
}

const ProductPriceSchema: Schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
  base_cost: { type: Number, required: true, default: 0 },
  sell_price: { type: Number, required: true, default: 0 },
  discount_price: { type: Number },
  active_from: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.ProductPrice || mongoose.model<IProductPrice>("ProductPrice", ProductPriceSchema);
