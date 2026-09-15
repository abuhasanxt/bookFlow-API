import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createResourceValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Resource name must be at least 2 characters")
    .max(30, "Resource name cannot exceed 30 characters"),

  type: z.enum(["ROOM", "DESK", "EQUIPMENT"]),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(100, "Description cannot exceed 100 characters")
    .optional(),

  capacity: z
    .number()
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than 0"),

  priceCentsPerHour: z
    .number()
    .int("Price must be an integer")
    .nonnegative("Price cannot be negative"),

  amenityIds: z
    .array(z.string().uuid("Invalid amenity ID"))
    .optional(),
});

export const updateResourceValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Resource name must be at least 2 characters")
    .max(30, "Resource name cannot exceed 30 characters")
    .optional(),

    type: z
    .enum(["ROOM", "DESK", "EQUIPMENT"])
    .optional(),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(100, "Description cannot exceed 100 characters")
    .optional(),

  capacity: z
    .number()
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than 0")
    .optional(),

  priceCentsPerHour: z
    .number()
    .int("Price must be an integer")
    .nonnegative("Price cannot be negative")
    .optional(),

  isActive: z.boolean().optional(),
  amenityIds: z
    .array(z.string().uuid("Invalid amenity ID"))
    .optional(),
});

export const updateResourceHoursSchema = z.object({
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: z.string().regex(timeRegex, "Invalid open time"),
        closeTime: z.string().regex(timeRegex, "Invalid close time"),
      }),
    )
    .min(1),
});