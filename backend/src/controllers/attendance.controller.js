import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Attendance from "../models/attendance.model.js";

dayjs.extend(utc);

// employee daily check-in
export const checkIn = async (req, res) => {
  try {
    const today = dayjs.utc().startOf("day").toDate();
    const checkInTime = dayjs.utc().toDate();

    // check if already checked in
    const existing = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "already checked in for today",
      });
    }

    const attendance = await Attendance.create({
      employee: req.user.id,
      date: today,
      checkIn: checkInTime,
      status: "PRESENT",
    });

    return res.status(201).json({
      success: true,
      message: "checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// employee daily check-out
export const checkOut = async (req, res) => {
  try {
    const today = dayjs.utc().startOf("day").toDate();
    const checkOutTime = dayjs.utc().toDate();

    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "no check-in record found for today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "already checked out for today",
      });
    }

    // calculate hours worked
    const diffMs = dayjs(checkOutTime).diff(dayjs(attendance.checkIn));
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // update status based on hours
    let status = "PRESENT";
    if (hoursWorked < 4) {
      status = "HALF_DAY";
    }

    attendance.checkOut = checkOutTime;
    attendance.hoursWorked = hoursWorked;
    attendance.status = status;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "checked out successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get self attendance history
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { employee: req.user.id };

    const start = startDate
      ? dayjs.utc(startDate).startOf("day").toDate()
      : dayjs.utc().subtract(30, "days").startOf("day").toDate();
    const end = endDate
      ? dayjs.utc(endDate).endOf("day").toDate()
      : dayjs.utc().endOf("day").toDate();

    filter.date = { $gte: start, $lte: end };

    const history = await Attendance.find(filter).sort({ date: -1 });
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

// get general attendance report (admin/hr only)
export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const filter = {};

    if (employeeId) filter.employee = employeeId;

    const start = startDate
      ? dayjs.utc(startDate).startOf("day").toDate()
      : dayjs.utc().startOf("day").toDate();
    const end = endDate
      ? dayjs.utc(endDate).endOf("day").toDate()
      : dayjs.utc().endOf("day").toDate();

    filter.date = { $gte: start, $lte: end };

    const records = await Attendance.find(filter)
      .populate("employee", "firstName lastName employeeId email department designation")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
