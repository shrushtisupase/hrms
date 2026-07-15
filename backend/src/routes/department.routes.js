import { Router } from "express";
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validators/department.validator.js";

const router = Router();

// protect all routes below
router.use(protect);

router.get("/", getAllDepartments);

// admin only modifications
router.post(
  "/",
  restrictTo("ADMIN"),
  validate(createDepartmentSchema),
  createDepartment
);

router.patch(
  "/:id",
  restrictTo("ADMIN"),
  validate(updateDepartmentSchema),
  updateDepartment
);

router.delete("/:id", restrictTo("ADMIN"), deleteDepartment);

export default router;
