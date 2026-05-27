import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  store_name: string;
  store_address: string;
  store_phone: string;
  receipt_footer?: string;
  tax_percentage: number;
  tax_id?: string;
}

const SettingSchema: Schema = new Schema({
  store_name: { type: String, required: true, default: "POS SYSTEM" },
  store_address: { type: String, required: true, default: "Alamat Toko Default" },
  store_phone: { type: String, required: true, default: "0812345678" },
  receipt_footer: { type: String, default: "Terima Kasih Atas Kunjungan Anda" },
  tax_percentage: { type: Number, default: 11 },
  tax_id: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
