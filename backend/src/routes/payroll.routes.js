import { Router } from "express";
import {
  generateMonthlyPayroll,
  getMyPayrollHistory,
  getAllPayrolls,
  updatePayrollStatus,
  downloadPayslip,
  downloadBankFile,
} from "../controllers/payroll.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  generatePayrollSchema,
  updatePayrollStatusSchema,
} from "../validators/payroll.validator.js";

const router = Router();

// protect all payroll routes
router.use(protect);

router.get("/bank-file", restrictTo("ADMIN", "HR"), downloadBankFile);
router.get("/my-history", getMyPayrollHistory);
router.get("/:id/payslip", downloadPayslip);

// admin/hr only management
router.post(
  "/generate",
  restrictTo("ADMIN", "HR"),
  validate(generatePayrollSchema),
  generateMonthlyPayroll
);
router.get("/", restrictTo("ADMIN", "HR"), getAllPayrolls);
router.patch(
  "/:id/status",
  restrictTo("ADMIN", "HR"),
  validate(updatePayrollStatusSchema),
  updatePayrollStatus
);

export default router;
