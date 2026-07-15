import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id format");

// create department validator
export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "department name is required"),
    description: z.string().trim().optional(),
  }),
});

// update department validator
export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});
