import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import PDFDocument from "pdfkit";
import Payroll from "../models/payroll.model.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import Leave from "../models/leave.model.js";

dayjs.extend(utc);

// generate monthly payroll (admin/hr only, using transaction)
export const generateMonthlyPayroll = async (req, res) => {
  const { month, year } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const startDate = dayjs.utc().year(year).month(month - 1).startOf("month").toDate();
    const endDate = dayjs.utc().year(year).month(month - 1).endOf("month").toDate();
    const workingDays = dayjs.utc(startDate).daysInMonth();

    // fetch all active employees
    const employees = await User.find({ isActive: true }).session(session);

    const generatedPayrolls = [];

    for (const employee of employees) {
      // count attendance records for this month
      const attendance = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate },
      }).session(session);

      let presentDays = 0;
      let halfDays = 0;

      attendance.forEach((record) => {
        if (record.status === "PRESENT" || record.status === "LATE") {
          presentDays += 1;
        } else if (record.status === "HALF_DAY") {
          halfDays += 1;
        }
      });

      // calculate present snapshot
      const totalPresentDays = presentDays + halfDays * 0.5;

      // count leaves in this month
      const leaves = await Leave.find({
        employee: employee._id,
        status: "APPROVED",
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      }).session(session);

      let paidLeaves = 0;
      let unpaidLeaves = 0;

      leaves.forEach((leave) => {
        // calculate overlapping days within this month
        const start = dayjs.max ? dayjs.max(dayjs(leave.startDate), dayjs(startDate)) : dayjs(leave.startDate);
        const end = dayjs.min ? dayjs.min(dayjs(leave.endDate), dayjs(endDate)) : dayjs(leave.endDate);
        
        let overlapDays = 0;
        if (dayjs(leave.startDate).isBefore(endDate) && dayjs(leave.endDate).isAfter(startDate)) {
          const s = dayjs(leave.startDate).isBefore(startDate) ? dayjs(startDate) : dayjs(leave.startDate);
          const e = dayjs(leave.endDate).isAfter(endDate) ? dayjs(endDate) : dayjs(leave.endDate);
          overlapDays = e.diff(s, "day") + 1;
        }

        if (leave.leaveType === "UNPAID") {
          unpaidLeaves += overlapDays;
        } else {
          paidLeaves += overlapDays;
        }
      });

      // calculate undocumented absences
      const documentedDays = totalPresentDays + paidLeaves + unpaidLeaves;
      const undocumentedAbsences = Math.max(0, workingDays - documentedDays);
      const totalUnpaidDays = unpaidLeaves + undocumentedAbsences;

      // basic salary
      const basic = employee.basicSalary || 0;

      // calculate daily rate and deductions
      const dailyRate = workingDays > 0 ? basic / workingDays : 0;
      const absencesDeduction = Math.round(totalUnpaidDays * dailyRate * 100) / 100;
      
      const grossEarnings = Math.max(0, Math.round((basic - absencesDeduction) * 100) / 100);
      const basicComponent = Math.round(grossEarnings * 0.5 * 100) / 100;
      const hra = Math.round(grossEarnings * 0.3 * 100) / 100;
      const specialAllowance = Math.max(0, Math.round((grossEarnings - basicComponent - hra) * 100) / 100);
      
      // deductions
      const pf = Math.round(basicComponent * 0.12 * 100) / 100;
      const pt = grossEarnings > 0 ? 200 : 0;
      const tds = Math.round(grossEarnings * 0.1 * 100) / 100;
      const taxDeductions = Math.round((pf + pt + tds) * 100) / 100;
      
      const totalDeductions = Math.round((absencesDeduction + taxDeductions) * 100) / 100;
      const netSalary = Math.max(0, Math.round((grossEarnings - taxDeductions) * 100) / 100);

      // upsert payroll record for employee
      const payroll = await Payroll.findOneAndUpdate(
        { employee: employee._id, month, year },
        {
          workingDays,
          presentDays: totalPresentDays,
          paidLeaves,
          unpaidLeaves: totalUnpaidDays,
          basicSalary: basic,
          hra,
          specialAllowance,
          pf,
          pt,
          tds,
          absencesDeduction,
          allowances: 0,
          deductions: totalDeductions,
          netSalary,
          status: "DRAFT",
        },
        { upsert: true, new: true, session }
      );

      generatedPayrolls.push(payroll);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: `payroll generated successfully for ${month}/${year}`,
      count: generatedPayrolls.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get self payroll history
export const getMyPayrollHistory = async (req, res) => {
  try {
    const history = await Payroll.find({ employee: req.user.id }).sort({ year: -1, month: -1 });
    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// view payroll records for all (admin/hr only)
export const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const filter = {};

    if (month) filter.month = parseInt(month, 10);
    if (year) filter.year = parseInt(year, 10);
    if (employeeId) filter.employee = employeeId;

    const payrolls = await Payroll.find(filter)
      .populate("employee", "firstName lastName employeeId email department designation")
      .sort({ year: -1, month: -1 });

    return res.status(200).json({
      success: true,
      payrolls,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// update payroll status (admin/hr only)
export const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentDate } = req.body;

    const updated = await Payroll.findByIdAndUpdate(
      id,
      {
        status,
        ...(paymentDate && { paymentDate: dayjs.utc(paymentDate).toDate() }),
        ...(status === "PAID" && !paymentDate && { paymentDate: dayjs.utc().toDate() }),
      },
      { new: true }
    ).populate("employee", "firstName lastName employeeId");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "payroll record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "payroll status updated successfully",
      payroll: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// download payslip pdf
export const downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id).populate("employee");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "payroll record not found",
      });
    }

    // restrict access to owner or admin/hr
    if (
      req.user.role === "EMPLOYEE" &&
      payroll.employee._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "not authorized to access this payslip",
      });
    }

    // create a new pdf document
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip-${payroll.employee.employeeId}-${payroll.month}-${payroll.year}.pdf`
    );

    doc.pipe(res);

    // document branding
    doc.fontSize(22).text("hrms systems inc.", { align: "center" });
    doc.fontSize(10).text("123 corporate blvd, suite 400", { align: "center" });
    doc.moveDown(2);

    // title
    doc.fontSize(16).text(`payslip for the month: ${payroll.month}/${payroll.year}`, { align: "center", underline: true });
    doc.moveDown(2);

    // employee info table
    const col1X = 50;
    const col2X = 300;
    let currentY = doc.y;

    doc.fontSize(11).text(`employee id: ${payroll.employee.employeeId}`, col1X, currentY);
    doc.text(`employee name: ${payroll.employee.firstName} ${payroll.employee.lastName}`, col1X, currentY + 20);
    doc.text(`email: ${payroll.employee.email}`, col1X, currentY + 40);

    doc.text(`basic salary: Rs. ${payroll.basicSalary.toFixed(2)}`, col2X, currentY);
    doc.text(`working days: ${payroll.workingDays}`, col2X, currentY + 20);
    doc.text(`present days: ${payroll.presentDays}`, col2X, currentY + 40);

    doc.moveDown(4);
    currentY = doc.y;

    // breakdown
    doc.fontSize(12).text("earnings", 50, currentY, { underline: true });
    doc.text("deductions", 300, currentY, { underline: true });
    doc.moveDown(1);
    currentY = doc.y;

    doc.fontSize(10);
    const baseVal = payroll.basicSalary * 0.5;
    doc.text(`basic pay (50%): Rs. ${(payroll.hra ? baseVal : payroll.basicSalary).toFixed(2)}`, 50, currentY);
    doc.text(`hra (30%): Rs. ${(payroll.hra || 0).toFixed(2)}`, 50, currentY + 20);
    doc.text(`special allowance (20%): Rs. ${(payroll.specialAllowance || 0).toFixed(2)}`, 50, currentY + 40);

    doc.text(`unpaid absences: Rs. ${(payroll.absencesDeduction || 0).toFixed(2)}`, 300, currentY);
    doc.text(`provident fund (pf 12%): Rs. ${(payroll.pf || 0).toFixed(2)}`, 300, currentY + 20);
    doc.text(`professional tax (pt): Rs. ${(payroll.pt || 0).toFixed(2)}`, 300, currentY + 40);
    doc.text(`income tax (tds 10%): Rs. ${(payroll.tds || 0).toFixed(2)}`, 300, currentY + 60);

    doc.moveDown(5);

    doc.moveDown(4);
    currentY = doc.y;

    // divider
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    doc.moveDown(1);
    currentY = doc.y;

    // total
    doc.fontSize(12).text(`net payable: Rs. ${payroll.netSalary.toFixed(2)}`, 50, currentY, { bold: true });
    doc.text(`payment status: ${payroll.status.toLowerCase()}`, 300, currentY);

    if (payroll.paymentDate) {
      doc.text(`payment date: ${dayjs(payroll.paymentDate).format("yyyy-mm-dd")}`, 300, currentY + 20);
    }

    doc.end();
  } catch (error) {
    console.error(error);
    // write json error if headers not sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
      });
    }
  }
};

// download bank dispatch file (admin/hr only)
export const downloadBankFile = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year query parameters are required",
      });
    }

    const filter = {
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };

    const payrolls = await Payroll.find(filter)
      .populate("employee", "firstName lastName employeeId email bankAccount bankName ifscCode");

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no payroll records found for the specified period",
      });
    }

    // compile csv lines
    let csvContent = "Employee ID,Employee Name,Bank Name,Bank Account,IFSC Code,Net Salary,Status\n";
    
    payrolls.forEach((p) => {
      const emp = p.employee || {};
      const empId = emp.employeeId || "N/A";
      const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
      const bankName = emp.bankName || "Mock National Bank";
      const bankAcc = emp.bankAccount || "MOCK-BANK-123456";
      const ifsc = emp.ifscCode || "MOCK0001234";
      const netPay = p.netSalary.toFixed(2);
      const status = p.status;
      
      csvContent += `"${empId}","${name}","${bankName}","${bankAcc}","${ifsc}",${netPay},"${status}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payroll-bank-file-${month}-${year}.csv`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
