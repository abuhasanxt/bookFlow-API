import z from "zod";

export const createAmenityZodSchema=z.object({
     name: z
        .string("Name is required and must be string")
        .min(5, "Name must be at least 5 characters")
        .max(30, "Name must be at most 30 characters"),
})
export const updateAmenityZodSchema=z.object({
     name: z
        .string("Name is required and must be string")
        .min(5, "Name must be at least 5 characters")
        .max(30, "Name must be at most 30 characters"),
})