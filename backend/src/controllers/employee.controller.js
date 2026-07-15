import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import Leave from "../models/leave.model.js";
import Payroll from "../models/payroll.model.js";

// get self profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("department");
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// update self profile details
export const updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, contactNumber, address, bankAccount, bankName, ifscCode } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
        ...(contactNumber && { contactNumber }),
        ...(address && { address }),
        ...(bankAccount && { bankAccount }),
        ...(bankName && { bankName }),
        ...(ifscCode && { ifscCode }),
      },
      { new: true }
    ).populate("department");

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// change self password
export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "current and new passwords are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "new password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "incorrect current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get all employees (admin/hr only)
export const getAllEmployees = async (req, res) => {
  try {
    const { department, designation, isActive } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const employees = await User.find(filter)
      .populate("department")
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get single employee details (admin/hr only)
export const getEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id).populate("department").select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// update employee record (admin/hr only)
export const updateEmployeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // if changing password, hash it
    if (updates.password) {
      if (updates.password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "password must be at least 8 characters long",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true })
      .populate("department")
      .select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "employee record updated successfully",
      employee: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// delete employee record (admin/hr only)
export const deleteEmployeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }

    // cascade delete all related database records
    await Attendance.deleteMany({ employee: id });
    await Leave.deleteMany({ employee: id });
    await Payroll.deleteMany({ employee: id });

    return res.status(200).json({
      success: true,
      message: "employee deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
