import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  leaveType: { 
    type: String, 
    enum: ["SICK", "CASUAL", "ANNUAL", "UNPAID"], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true }, // total number of days requested
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["PENDING", "APPROVED", "REJECTED"], 
    default: "PENDING" 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  remarks: { type: String } 
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);