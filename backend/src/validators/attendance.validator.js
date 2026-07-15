import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const utcDate = z.preprocess((val) => {
  if (!val || val === "") return undefined;
  const parsed = dayjs.utc(val);
  return parsed.isValid() ? parsed.toDate() : new Date("invalid");
}, z.date({ invalid_type_error: "invalid date format" }).optional());

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id format");

// check-in validator (allows optional body)
export const checkInSchema = z.object({
  body: z.object({
    checkIn: utcDate.optional(),
  }).optional().default({}),
});

// check-out validator (allows optional body)
export const checkOutSchema = z.object({
  body: z.object({
    checkOut: utcDate.optional(),
  }).optional().default({}),
});

// query filters validator
export const attendanceQuerySchema = z.object({
  query: z.object({
    startDate: utcDate.optional(),
    endDate: utcDate.optional(),
    employeeId: objectId.optional(),
  }),
});
