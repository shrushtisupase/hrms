import Resignation from "../models/resignation.model.js";
import User from "../models/user.model.js";
import dayjs from "dayjs";

// employee submits resignation application
export const submitResignation = async (req, res) => {
  try {
    const { lastWorkingDay, reason } = req.body;
    if (!lastWorkingDay || !reason) {
      return res.status(400).json({
        success: false,
        message: "last working day and explanation reason are required",
      });
    }

    const existing = await Resignation.findOne({ employee: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "resignation application already submitted",
      });
    }

    const resignation = await Resignation.create({
      employee: req.user.id,
      lastWorkingDay: dayjs(lastWorkingDay).toDate(),
      reason,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "resignation submitted successfully",
      resignation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get self resignation details
export const getMyResignation = async (req, res) => {
  try {
    const resignation = await Resignation.findOne({ employee: req.user.id });
    return res.status(200).json({
      success: true,
      resignation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// list all exit cases (admin/hr only)
export const getAllResignations = async (req, res) => {
  try {
    const list = await Resignation.find()
      .populate("employee", "firstName lastName employeeId email department designation basicSalary")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// update clearance checkpoints (admin/hr only)
export const updateResignationClearance = async (req, res) => {
  try {
    const { id } = req.params;
    const { dept, status, remarks } = req.body; // dept is 'it', 'finance', 'hr'

    if (!["it", "finance", "hr"].includes(dept)) {
      return res.status(400).json({
        success: false,
        message: "invalid clearance department node",
      });
    }

    const resignation = await Resignation.findById(id).populate("employee");
    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "resignation record not found",
      });
    }

    // update clearance status
    resignation.clearanceDetails[dept].status = status;
    resignation.clearanceDetails[dept].remarks = remarks || "";

    // compute auto f&f if all clearance nodes are CLEARED
    const itClr = resignation.clearanceDetails.it.status === "CLEARED";
    const finClr = resignation.clearanceDetails.finance.status === "CLEARED";
    const hrClr = resignation.clearanceDetails.hr.status === "CLEARED";

    if (itClr && finClr && hrClr) {
      const basic = resignation.employee?.basicSalary || 0;
      resignation.ffSettlement.netPayout = basic;
      resignation.ffSettlement.calculations = `Base payout matching final monthly wage rate: $${basic.toFixed(2)}. Deductions: None. Clearance complete.`;
    } else {
      resignation.ffSettlement.netPayout = 0;
      resignation.ffSettlement.calculations = "clearance pending approval";
    }

    await resignation.save();

    return res.status(200).json({
      success: true,
      message: "clearance checkpoint updated",
      resignation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// approve/reject resignation status (admin/hr only)
export const updateResignationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const resignation = await Resignation.findById(id);
    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "resignation record not found",
      });
    }

    resignation.status = status;
    await resignation.save();

    return res.status(200).json({
      success: true,
      message: `resignation request status updated to ${status.toLowerCase()}`,
      resignation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// finalize exit clearance and mark employee inactive (admin/hr only)
export const finalizeResignationExit = async (req, res) => {
  try {
    const { id } = req.params;
    const resignation = await Resignation.findById(id).populate("employee");
    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "resignation record not found",
      });
    }

    const itClr = resignation.clearanceDetails.it.status === "CLEARED";
    const finClr = resignation.clearanceDetails.finance.status === "CLEARED";
    const hrClr = resignation.clearanceDetails.hr.status === "CLEARED";

    if (!itClr || !finClr || !hrClr) {
      return res.status(400).json({
        success: false,
        message: "clearances pending IT/Finance/HR signoff",
      });
    }

    resignation.ffSettlement.status = "PAID";
    resignation.ffSettlement.paymentDate = dayjs().toDate();

    await User.findByIdAndUpdate(resignation.employee._id, { isActive: false });
    await resignation.save();

    return res.status(200).json({
      success: true,
      message: "exit clearances finalized. employee marked inactive.",
      resignation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
