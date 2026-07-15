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

// generate payroll validator
export const generatePayrollSchema = z.object({
  body: z.object({
    month: z.number().min(1).max(12, "month must be between 1 and 12"),
    year: z.number().min(2000, "year must be 2000 or greater"),
  }),
});

// update payroll status validator
export const updatePayrollStatusSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    status: z.enum(["DRAFT", "PROCESSED", "PAID"]),
    paymentDate: utcDate.optional(),
  }),
});
