import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true }, 
  year: { type: Number, required: true },  
  
  // attendance summary
  workingDays: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  paidLeaves: { type: Number, default: 0 },
  unpaidLeaves: { type: Number, default: 0 },

  // financial snapshot
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  pt: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  absencesDeduction: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  
  // tracking
  status: { 
    type: String, 
    enum: ["DRAFT", "PROCESSED", "PAID"], 
    default: "DRAFT" 
  },
  paymentDate: { type: Date }
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);