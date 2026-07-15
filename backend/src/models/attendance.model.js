import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, 
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { 
    type: String, 
    enum: ["PRESENT", "ABSENT", "HALF_DAY", "LATE", "EARLY_EXIT", "LEAVE", "HOLIDAY"], 
    default: "PRESENT" 
  },
  hoursWorked: { type: Number, default: 0 } 
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);