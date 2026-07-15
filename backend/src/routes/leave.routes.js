import { Router } from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveRejectLeave,
} from "../controllers/leave.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  applyLeaveSchema,
  approveRejectLeaveSchema,
} from "../validators/leave.validator.js";

const router = Router();

// protect all leave routes
router.use(protect);

router.post("/", validate(applyLeaveSchema), applyLeave);
router.get("/my-history", getMyLeaves);

// admin/hr only management
router.get("/", restrictTo("ADMIN", "HR"), getAllLeaves);
router.patch(
  "/:id/approve",
  restrictTo("ADMIN", "HR"),
  validate(approveRejectLeaveSchema),
  approveRejectLeave
);

export default router;
