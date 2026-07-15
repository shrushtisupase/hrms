import { Router } from "express";
import {
  checkIn,
  checkOut,
  getMyAttendanceHistory,
  getAttendanceReport,
} from "../controllers/attendance.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  checkInSchema,
  checkOutSchema,
  attendanceQuerySchema,
} from "../validators/attendance.validator.js";

const router = Router();

// protect all attendance routes
router.use(protect);

router.post("/checkin", validate(checkInSchema), checkIn);
router.post("/checkout", validate(checkOutSchema), checkOut);
router.get("/my-history", validate(attendanceQuerySchema), getMyAttendanceHistory);

// admin/hr report
router.get(
  "/report",
  restrictTo("ADMIN", "HR"),
  validate(attendanceQuerySchema),
  getAttendanceReport
);

export default router;
