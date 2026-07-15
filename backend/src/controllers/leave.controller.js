import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Leave from "../models/leave.model.js";
import Attendance from "../models/attendance.model.js";

dayjs.extend(utc);

// apply for a leave
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = dayjs.utc(startDate).startOf("day");
    const end = dayjs.utc(endDate).startOf("day");

    if (end.isBefore(start)) {
      return res.status(400).json({
        success: false,
        message: "end date cannot be before start date",
      });
    }

    // calculate total days inclusive
    const days = end.diff(start, "day") + 1;

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate: start.toDate(),
      endDate: end.toDate(),
      days,
      reason,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "leave request submitted successfully",
      leave,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// view personal leave requests
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// view all leave requests (admin/hr only)
export const getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (employeeId) filter.employee = employeeId;

    const leaves = await Leave.find(filter)
      .populate("employee", "firstName lastName employeeId email department designation")
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// approve or reject leave request (admin/hr only, using transaction)
export const approveRejectLeave = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const leave = await Leave.findById(id).session(session);
    if (!leave) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "leave request not found",
      });
    }

    if (leave.status !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `leave request has already been processed: status is ${leave.status}`,
      });
    }

    // update leave details
    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.remarks = remarks;
    await leave.save({ session });

    // if approved, upsert attendance entries for dates
    if (status === "APPROVED") {
      const start = dayjs.utc(leave.startDate);
      const end = dayjs.utc(leave.endDate);
      const totalDays = end.diff(start, "day") + 1;

      for (let i = 0; i < totalDays; i++) {
        const currentDate = start.add(i, "day").toDate();

        // upsert attendance record for each date as leave status
        await Attendance.findOneAndUpdate(
          { employee: leave.employee, date: currentDate },
          {
            $set: {
              status: "LEAVE",
              hoursWorked: 0,
            },
            $setOnInsert: {
              employee: leave.employee,
              date: currentDate,
            },
          },
          { upsert: true, session, new: true }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `leave request ${status.toLowerCase()} successfully`,
      leave,
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
