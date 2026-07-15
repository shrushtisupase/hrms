import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const utcDate = z.preprocess((val) => {
  if (!val) return undefined;
  const parsed = dayjs.utc(val);
  return parsed.isValid() ? parsed.toDate() : new Date("invalid");
}, z.date({ invalid_type_error: "invalid date format" }));

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id format");

// schema for updating personal profile (allows optional body)
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "first name cannot be empty").optional(),
    lastName: z.string().min(1, "last name cannot be empty").optional(),
    dateOfBirth: utcDate.optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
  }).optional().default({}),
});

// schema for admin/hr to update employee records (allows optional body)
export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    role: z.enum(["ADMIN", "HR", "EMPLOYEE"]).optional(),
    dateOfBirth: utcDate.optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    department: objectId.optional(),
    designation: z.string().optional(),
    joiningDate: utcDate.optional(),
    isActive: z.boolean().optional(),
    basicSalary: z.number().nonnegative().optional(),
  }).optional().default({}),
  params: z.object({
    id: objectId,
  }),
});
