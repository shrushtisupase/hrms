import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import User from "../src/models/user.model.js";
import Department from "../src/models/department.model.js";
import Attendance from "../src/models/attendance.model.js";
import Leave from "../src/models/leave.model.js";
import Payroll from "../src/models/payroll.model.js";

// seed script entry point
const seedDB = async () => {
  try {
    console.log("connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("db connected. cleaning existing data...");

    // delete existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});

    console.log("collections cleared.");

    // create department
    const dept = await Department.create({
      name: "engineering",
      description: "engineering and technology department",
    });
    console.log("department created.");

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // create admin
    const admin = await User.create({
      employeeId: "EMP0001",
      email: "admin@hrms.com",
      password: hashedPassword,
      role: "ADMIN",
      firstName: "admin",
      lastName: "user",
      joiningDate: new Date(),
      department: dept._id,
      designation: "system administrator",
      basicSalary: 8000,
    });

    // create hr
    const hr = await User.create({
      employeeId: "EMP0002",
      email: "hr@hrms.com",
      password: hashedPassword,
      role: "HR",
      firstName: "hr",
      lastName: "manager",
      joiningDate: new Date(),
      department: dept._id,
      designation: "hr head",
      basicSalary: 6000,
    });

    // create employee
    const employee = await User.create({
      employeeId: "EMP0003",
      email: "employee@hrms.com",
      password: hashedPassword,
      role: "EMPLOYEE",
      firstName: "regular",
      lastName: "employee",
      joiningDate: new Date(),
      department: dept._id,
      designation: "software engineer",
      basicSalary: 5000,
    });

    console.log("users seeded successfully:");
    console.log(`admin: ${admin.email}`);
    console.log(`hr: ${hr.email}`);
    console.log(`employee: ${employee.email}`);

    await mongoose.disconnect();
    console.log("disconnected from db.");
    process.exit(0);
  } catch (error) {
    console.error("error during seeding:", error);
    process.exit(1);
  }
};

seedDB();
