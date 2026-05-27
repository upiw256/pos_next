import mongoose, { Schema, Document } from "mongoose";

export interface IUnit extends Document {
  name: string; // Misal: Dus, Pcs
  short_name: string; // Misal: dus, pcs
}

const UnitSchema: Schema = new Schema({
  name: { type: String, required: true },
  short_name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Unit || mongoose.model<IUnit>("Unit", UnitSchema);
