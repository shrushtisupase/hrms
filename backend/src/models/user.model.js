const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication & Core Identity
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
  role: { 
    type: String, 
    enum: ['ADMIN', 'HR', 'EMPLOYEE'], 
    default: 'EMPLOYEE' 
  },

  // Enhanced Profile Details
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
  
  // Employment Details
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  joiningDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },

  // Base Payroll (Simplified to prevent duplication)
  basicSalary: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);