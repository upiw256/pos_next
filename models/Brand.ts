import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
}

const BrandSchema: Schema = new Schema({
  name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
