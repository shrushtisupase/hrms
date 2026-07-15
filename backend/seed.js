import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { connectDB } from "./src/config/db.js";

// models imports
import User from "./src/models/user.model.js";
import Department from "./src/models/department.model.js";
import Leave from "./src/models/leave.model.js";
import Attendance from "./src/models/attendance.model.js";
import Resignation from "./src/models/resignation.model.js";

const runSeeder = async () => {
  try {
    await connectDB();
    console.log("database connection initialized");

    // clean up non admin entries
    console.log("purging existing employee master databases...");
    await Leave.deleteMany({});
    await Attendance.deleteMany({});
    await Resignation.deleteMany({});
    await Department.deleteMany({});

    // we keep admin if exists or create new
    let admin = await User.findOne({ role: "ADMIN" });
    const commonPasswordHash = await bcrypt.hash("password123123123", 10);

    if (!admin) {
      console.log("seeding default admin account...");
      admin = await User.create({
        employeeId: "EMP-001",
        email: "admin@hrms.com",
        password: commonPasswordHash,
        role: "ADMIN",
        firstName: "Vikrant",
        lastName: "Mehta",
        designation: "Managing Director",
        joiningDate: dayjs("2020-01-01").toDate(),
        basicSalary: 150000,
        bankAccount: "900010101234",
        bankName: "HDFC Bank",
        ifscCode: "HDFC0000001",
      });
    }

    // delete other users to refresh seeding data
    await User.deleteMany({ _id: { $ne: admin._id } });

    // seed departments
    console.log("seeding corporate departments...");
    const engDept = await Department.create({ name: "Engineering", description: "Product Development & QA" });
    const hrDept = await Department.create({ name: "Human Resources", description: "Talent Acquisition & Employee Success" });
    const salesDept = await Department.create({ name: "Sales & Marketing", description: "Client Relations & Acquisitions" });
    const finDept = await Department.create({ name: "Finance", description: "Accounts & Financial Planning" });

    // seed 1 HR officer and 4 employees
    console.log("seeding employee profiles...");

    const hrUser = await User.create({
      employeeId: "EMP-002",
      email: "hr@hrms.com",
      password: commonPasswordHash,
      role: "HR",
      firstName: "Sneha",
      lastName: "Reddy",
      gender: "FEMALE",
      contactNumber: "9876543210",
      address: "12, Gachibowli, Hyderabad",
      department: hrDept._id,
      designation: "HR Officer",
      joiningDate: dayjs("2024-03-01").toDate(),
      basicSalary: 55000,
      bankAccount: "30012345678",
      bankName: "State Bank of India",
      ifscCode: "SBIN0001234",
    });

    const emp1 = await User.create({
      employeeId: "EMP-003",
      email: "emp1@hrms.com",
      password: commonPasswordHash,
      role: "EMPLOYEE",
      firstName: "Rahul",
      lastName: "Sharma",
      gender: "MALE",
      contactNumber: "9123456780",
      address: "45, Saket, New Delhi",
      department: engDept._id,
      designation: "Software Engineer",
      joiningDate: dayjs("2024-01-15").toDate(),
      basicSalary: 75000,
      bankAccount: "50098765432",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0000456",
    });

    const emp2 = await User.create({
      employeeId: "EMP-004",
      email: "emp2@hrms.com",
      password: commonPasswordHash,
      role: "EMPLOYEE",
      firstName: "Priya",
      lastName: "Patel",
      gender: "FEMALE",
      contactNumber: "9234567890",
      address: "88, Juhu, Mumbai",
      department: engDept._id,
      designation: "QA Analyst",
      joiningDate: dayjs("2024-02-10").toDate(),
      basicSalary: 45000,
      bankAccount: "40011223344",
      bankName: "ICICI Bank",
      ifscCode: "ICIC0000789",
    });

    const emp3 = await User.create({
      employeeId: "EMP-005",
      email: "emp3@hrms.com",
      password: commonPasswordHash,
      role: "EMPLOYEE",
      firstName: "Amit",
      lastName: "Verma",
      gender: "MALE",
      contactNumber: "9345678901",
      address: "102, Indiranagar, Bengaluru",
      department: salesDept._id,
      designation: "Sales Executive",
      joiningDate: dayjs("2024-04-01").toDate(),
      basicSalary: 60000,
      bankAccount: "90055667788",
      bankName: "Axis Bank",
      ifscCode: "UTIB0000123",
    });

    const emp4 = await User.create({
      employeeId: "EMP-006",
      email: "emp4@hrms.com",
      password: commonPasswordHash,
      role: "EMPLOYEE",
      firstName: "Vikram",
      lastName: "Malhotra",
      gender: "MALE",
      contactNumber: "9456789012",
      address: "67, Salt Lake, Kolkata",
      department: finDept._id,
      designation: "Finance Analyst",
      joiningDate: dayjs("2023-09-01").toDate(),
      basicSalary: 80000,
      bankAccount: "60022334455",
      bankName: "Kotak Mahindra Bank",
      ifscCode: "KKBK0000678",
    });

    // seed leave requests
    console.log("seeding leave ledgers...");
    
    // rahul sharma (emp1) - 1 approved, 1 pending
    await Leave.create({
      employee: emp1._id,
      leaveType: "SICK",
      startDate: dayjs().subtract(5, "day").toDate(),
      endDate: dayjs().subtract(4, "day").toDate(),
      days: 2,
      reason: "recovery from severe fever",
      status: "APPROVED",
      remarks: "cleared by manager",
    });
    await Leave.create({
      employee: emp1._id,
      leaveType: "CASUAL",
      startDate: dayjs().add(5, "day").toDate(),
      endDate: dayjs().add(7, "day").toDate(),
      days: 3,
      reason: "family relocation support",
      status: "PENDING",
    });

    // priya patel (emp2) - 1 approved, 1 rejected
    await Leave.create({
      employee: emp2._id,
      leaveType: "CASUAL",
      startDate: dayjs().subtract(10, "day").toDate(),
      endDate: dayjs().subtract(10, "day").toDate(),
      days: 1,
      reason: "personal banking works",
      status: "APPROVED",
      remarks: "authorized",
    });
    await Leave.create({
      employee: emp2._id,
      leaveType: "SICK",
      startDate: dayjs().subtract(12, "day").toDate(),
      endDate: dayjs().subtract(11, "day").toDate(),
      days: 2,
      reason: "minor checkup logs",
      status: "REJECTED",
      remarks: "rejected due to team bandwidth constraints",
    });

    // amit verma (emp3) - 1 approved
    await Leave.create({
      employee: emp3._id,
      leaveType: "ANNUAL",
      startDate: dayjs().subtract(3, "day").toDate(),
      endDate: dayjs().subtract(1, "day").toDate(),
      days: 3,
      reason: "personal annual travel trip",
      status: "APPROVED",
      remarks: "enjoy your travel",
    });

    // seed attendance histories (late arrivals and early exits checkins)
    console.log("seeding daily attendance checks...");

    const checkinDays = [4, 3, 2, 1, 0]; // last 5 days
    for (const d of checkinDays) {
      const targetDate = dayjs().subtract(d, "day").startOf("day");

      // rahul (emp1) - check in late on day 2
      const isLate = d === 2;
      const checkinTime = targetDate.hour(isLate ? 10 : 9).minute(isLate ? 15 : 20); // 10:15 am is late, 9:20 am is normal
      const checkoutTime = targetDate.hour(18).minute(0); // 6:00 pm checkout

      await Attendance.create({
        employee: emp1._id,
        date: targetDate.toDate(),
        checkIn: checkinTime.toDate(),
        checkOut: checkoutTime.toDate(),
        hoursWorked: isLate ? 7.75 : 8.67,
        status: isLate ? "PRESENT" : "PRESENT", // late exception flag evaluated on backend
      });

      // priya (emp2) - early exit on day 3 (worked only 5 hours)
      const isEarlyExit = d === 3;
      const checkinPriya = targetDate.hour(9).minute(15);
      const checkoutPriya = targetDate.hour(isEarlyExit ? 14 : 17).minute(15);

      await Attendance.create({
        employee: emp2._id,
        date: targetDate.toDate(),
        checkIn: checkinPriya.toDate(),
        checkOut: checkoutPriya.toDate(),
        hoursWorked: isEarlyExit ? 5.0 : 8.0,
        status: "PRESENT",
      });

      // amit (emp3) - normal attendance
      await Attendance.create({
        employee: emp3._id,
        date: targetDate.toDate(),
        checkIn: targetDate.hour(9).minute(10).toDate(),
        checkOut: targetDate.hour(17).minute(45).toDate(),
        hoursWorked: 8.58,
        status: "PRESENT",
      });
    }

    // seed a resignation request for vikram malhotra (emp4)
    console.log("seeding active resignation requests...");
    await Resignation.create({
      employee: emp4._id,
      resignationDate: dayjs().subtract(5, "day").toDate(),
      lastWorkingDay: dayjs().add(25, "day").toDate(),
      reason: "moving out of state to pursue MBA program full-time",
      status: "PENDING",
      clearanceDetails: {
        it: { status: "PENDING", remarks: "" },
        finance: { status: "PENDING", remarks: "" },
        hr: { status: "PENDING", remarks: "" },
      },
      ffSettlement: {
        status: "UNPAID",
        netPayout: 80000,
        calculations: "base rate salary component: 1 month default base settlement calculation.",
      },
    });

    console.log("database seeding successfully finished!");
    mongoose.connection.close();
  } catch (err) {
    console.error("error during database seeding execution:", err);
    mongoose.connection.close();
  }
};

runSeeder();
