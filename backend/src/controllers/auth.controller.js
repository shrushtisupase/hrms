import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

// generate token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// register employee
export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      department,
      designation,
      joiningDate,
      isActive,
      basicSalary,
    } = req.body;

    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "user already exists",
      });
    }

    // generate auto-incremented employee id
    const lastUser = await User.findOne()
      .sort({ createdAt: -1 })
      .select("employeeId");

    let employeeId = "EMP0001";
    if (lastUser?.employeeId) {
      const lastNumber = parseInt(
        lastUser.employeeId.replace("EMP", ""),
        10
      );
      employeeId = `EMP${String(lastNumber + 1).padStart(4, "0")}`;
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create employee record
    const user = await User.create({
      employeeId,
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE",
      firstName,
      lastName,
      profilePicture: "",
      dateOfBirth,
      gender,
      contactNumber,
      address,
      department,
      designation,
      joiningDate,
      isActive: isActive ?? true,
      basicSalary: basicSalary || 0,
    });

    return res.status(201).json({
      success: true,
      message: "user registered successfully",
      user: {
        id: user._id,
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email }).populate("department");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    // check if active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "your account has been deactivated",
      });
    }

    // compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        profilePicture: user.profilePicture,
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