import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // authentication & core identity
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
  role: { 
    type: String, 
    enum: ['ADMIN', 'HR', 'EMPLOYEE'], 
    default: 'EMPLOYEE' 
  },

  // enhanced profile details
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: { type: String }, 
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] 
  },
  contactNumber: { type: String },
  address: { type: String },
  
  // employment details
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  joiningDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },

  // base payroll 
  basicSalary: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);