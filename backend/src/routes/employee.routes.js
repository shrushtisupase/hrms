import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getAllEmployees,
  getEmployeeDetails,
  updateEmployeeRecord,
  deleteEmployeeRecord,
} from "../controllers/employee.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  updateEmployeeSchema,
} from "../validators/employee.validator.js";

const router = Router();

// protect all employee routes
router.use(protect);

// self service endpoints
router.get("/profile", getMyProfile);
router.patch("/profile", validate(updateProfileSchema), updateMyProfile);
router.patch("/change-password", changeMyPassword);

// management endpoints (admin/hr only)
router.get("/", restrictTo("ADMIN", "HR"), getAllEmployees);
router.get("/:id", restrictTo("ADMIN", "HR"), getEmployeeDetails);
router.patch(
  "/:id",
  restrictTo("ADMIN", "HR"),
  validate(updateEmployeeSchema),
  updateEmployeeRecord
);
router.delete("/:id", restrictTo("ADMIN", "HR"), deleteEmployeeRecord);

export default router;
