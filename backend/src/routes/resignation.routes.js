import { Router } from "express";
import {
  submitResignation,
  getMyResignation,
  getAllResignations,
  updateResignationClearance,
  updateResignationStatus,
  finalizeResignationExit,
} from "../controllers/resignation.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/", submitResignation);
router.get("/my", getMyResignation);

// admin/hr only endpoints
router.get("/", restrictTo("ADMIN", "HR"), getAllResignations);
router.patch("/:id/clearance", restrictTo("ADMIN", "HR"), updateResignationClearance);
router.patch("/:id/status", restrictTo("ADMIN", "HR"), updateResignationStatus);
router.patch("/:id/finalize", restrictTo("ADMIN", "HR"), finalizeResignationExit);

export default router;
