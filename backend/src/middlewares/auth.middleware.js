import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// protect routes from unauthenticated users
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "not authorized, no token provided",
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check if user exists
    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "the user belonging to this token no longer exists",
      });
    }

    // check if user is active
    if (!currentUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "this user account has been deactivated",
      });
    }

    // grant access
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "not authorized, invalid token",
    });
  }
};

// restrict routes to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "you do not have permission to perform this action",
      });
    }
    next();
  };
};
