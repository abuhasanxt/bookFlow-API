import z from "zod";

export const createBookingZodSchema = z.object({
  resourceId: z
    .string("Resource ID is required")
    .uuid("Resource ID must be a valid UUID"),

  startTime: z
    .string("Start time is required")
    .min(1, "Start time is required"),

  endTime: z.string("End time is required").min(1, "End time is required"),
});
export const updateBookingZodSchema = z.object({
  startTime: z
    .string("Start time is required")
    .min(1, "Start time is required"),

  endTime: z
    .string("End time is required")
    .min(1, "End time is required"),
});