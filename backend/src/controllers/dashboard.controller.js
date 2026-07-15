import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import Leave from "../models/leave.model.js";
import Payroll from "../models/payroll.model.js";

dayjs.extend(utc);

// get analytics for dashboard (admin/hr only)
export const getDashboardStats = async (req, res) => {
  try {
    const today = dayjs.utc().startOf("day").toDate();
    const currentMonth = dayjs.utc().month() + 1;
    const currentYear = dayjs.utc().year();

    // 1. total headcount
    const totalEmployees = await User.countDocuments({ isActive: true });

    // 2. present headcount today
    const presentToday = await Attendance.countDocuments({
      date: today,
      status: { $in: ["PRESENT", "LATE", "HALF_DAY"] },
    });

    // 3. on-leave headcount today
    const onLeaveToday = await Attendance.countDocuments({
      date: today,
      status: "LEAVE",
    });

    // 4. monthly payroll summary (processed/paid)
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

    // 5. recent activities (last 5 leaves applied, last 5 check-ins)
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
        onLeaveToday,
        monthlyPayrollExpenditure: totalExpenditure,
      },
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
