import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
//signup handler
export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      profilePicture,
      dateOfBirth,
      gender,
      contactNumber,
      department,
      designation,
      joiningDate,
      isActive,
      basicSalary,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !joiningDate
    ) {
      return res.status(400).json({
        message: "Please provide all required fields.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }

    // Generate Employee ID
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

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      employeeId,
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE",
      firstName,
      lastName,
      profilePicture,
      dateOfBirth,
      gender,
      contactNumber,
      department,
      designation,
      joiningDate,
      isActive,
      basicSalary,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
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
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


//login handler


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({ email }).populate("department");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
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
      message: "Internal Server Error",
      error: error.message,
    });
  }
};