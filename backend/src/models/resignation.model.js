import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resignationDate: { type: Date, default: Date.now },
  lastWorkingDay: { type: Date, required: true },
  reason: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ["PENDING", "APPROVED", "REJECTED"], 
    default: "PENDING" 
  },

  // clearance status trackers per department node
  clearanceDetails: {
    it: {
      status: { type: String, enum: ["PENDING", "CLEARED"], default: "PENDING" },
      remarks: { type: String, default: "" }
    },
    finance: {
      status: { type: String, enum: ["PENDING", "CLEARED"], default: "PENDING" },
      remarks: { type: String, default: "" }
    },
    hr: {
      status: { type: String, enum: ["PENDING", "CLEARED"], default: "PENDING" },
      remarks: { type: String, default: "" }
    }
  },

  // full and final payout calculation status
  ffSettlement: {
    netPayout: { type: Number, default: 0 },
    calculations: { type: String, default: "" },
    status: { type: String, enum: ["UNPAID", "PAID"], default: "UNPAID" },
    paymentDate: { type: Date }
  }
}, { timestamps: true });

resignationSchema.index({ employee: 1 }, { unique: true });

export default mongoose.model("Resignation", resignationSchema);
