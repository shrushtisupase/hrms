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

// apply leave schema
export const applyLeaveSchema = z.object({
  body: z.object({
    leaveType: z.enum(["SICK", "CASUAL", "ANNUAL", "UNPAID"]),
    startDate: utcDate,
    endDate: utcDate,
    reason: z.string().min(1, "reason is required"),
  }),
});

// approve or reject leave schema
export const approveRejectLeaveSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    remarks: z.string().optional(),
  }),
});
