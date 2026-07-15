import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

// protect dashboard routes to admin/hr only
router.get("/", protect, restrictTo("ADMIN", "HR"), getDashboardStats);

export default router;
