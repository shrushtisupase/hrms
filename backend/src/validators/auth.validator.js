import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

// helper to parse date to utc date object
const utcDate = z.preprocess((val) => {
  if (!val) return undefined;
  const parsed = dayjs.utc(val);
  return parsed.isValid() ? parsed.toDate() : new Date("invalid");
}, z.date({ invalid_type_error: "invalid date format" }));

// register validation schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("invalid email address"),
    password: z.string().min(8, "password must be at least 8 characters long"),
    role: z.enum(["ADMIN", "HR", "EMPLOYEE"]).optional(),
    firstName: z.string().min(1, "first name is required"),
    lastName: z.string().min(1, "last name is required"),
    dateOfBirth: utcDate.optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    department: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid department id").optional(),
    designation: z.string().optional(),
    joiningDate: utcDate,
    basicSalary: z.number().nonnegative("basic salary must be non-negative").optional(),
  }),
});

// login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("invalid email address"),
    password: z.string().min(1, "password is required"),
  }),
});
