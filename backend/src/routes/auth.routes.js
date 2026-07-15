import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

// public login
router.post("/login", validate(loginSchema), loginUser);

// protected registration (admin/hr only)
router.post(
  "/register",
  protect,
  restrictTo("ADMIN", "HR"),
  validate(registerSchema),
  registerUser
);

export default router;