import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  category_id: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  user_id: mongoose.Types.ObjectId;
}

const ExpenseSchema: Schema = new Schema({
  category_id: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
  amount: { type: Number, required: true, default: 0 },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
