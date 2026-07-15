import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import Leave from "../models/leave.model.js";
import Payroll from "../models/payroll.model.js";
import Resignation from "../models/resignation.model.js";

dayjs.extend(utc);

// get analytics for dashboard (admin/hr only)
export const getDashboardStats = async (req, res) => {
  try {
    const today = dayjs.utc().startOf("day").toDate();
    const currentMonth = dayjs.utc().month() + 1;
    const currentYear = dayjs.utc().year();

    // 1. total headcount
    const totalEmployees = await User.countDocuments({ isActive: true });

    // 2. detailed attendance snapshot today
    const presentToday = await Attendance.countDocuments({
      date: today,
      status: { $in: ["PRESENT", "LATE", "EARLY_EXIT", "HALF_DAY"] },
    });

    const lateToday = await Attendance.countDocuments({
      date: today,
      status: "LATE"
    });

    const earlyExitToday = await Attendance.countDocuments({
      date: today,
      status: "EARLY_EXIT"
    });

    const halfDayToday = await Attendance.countDocuments({
      date: today,
      status: "HALF_DAY"
    });

    const onLeaveToday = await Leave.countDocuments({
      status: "APPROVED",
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);

    // 3. monthly payroll summary (processed/paid)
    const payrollSummary = await Payroll.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear,
          status: { $in: ["PROCESSED", "PAID"] },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenditure: { $sum: "$netSalary" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalExpenditure = payrollSummary.length > 0 ? payrollSummary[0].totalExpenditure : 0;

    // 4. monthly payroll trends (past 6 runs)
    const payrollTrends = await Payroll.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalPayout: { $sum: "$netSalary" },
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    // 5. resignation clearances summary
    const resignationCount = await Resignation.countDocuments();
    const pendingClearanceCount = await Resignation.countDocuments({ status: "PENDING" });
    const completedClearanceCount = await Resignation.countDocuments({ status: "APPROVED" });

    // 6. recent activities (last 5 leaves applied, last 5 check-ins)
    const recentLeaves = await Leave.find()
      .populate("employee", "firstName lastName employeeId")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCheckins = await Attendance.find({ date: today })
      .populate("employee", "firstName lastName employeeId")
      .sort({ checkIn: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        lateToday,
        earlyExitToday,
        halfDayToday,
        onLeaveToday,
        absentToday,
        monthlyPayrollExpenditure: totalExpenditure,
        resignationCount,
        pendingClearanceCount,
        completedClearanceCount
      },
      payrollTrends,
      recentActivities: {
        recentLeaves,
        recentCheckins,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
