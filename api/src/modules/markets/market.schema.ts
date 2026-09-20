import { z } from "zod";

export const boundingBoxSchema = z
  .object({
    south: z.number().min(-90).max(90),
    west: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180)
  })
  .refine(
    (value) => value.south < value.north,
    {
      message: "south must be less than north",
      path: ["south"]
    }
  )
  .refine(
    (value) => value.west < value.east,
    {
      message: "west must be less than east",
      path: ["west"]
    }
  );

export const createMarketSchema = z.object({
  cityId: z.string().uuid(),
  portfolioUploadId: z.string().uuid(),
  categoryIds: z
    .array(z.string().uuid())
    .min(1, "At least one category is required"),
  boundary: boundingBoxSchema
});

export type CreateMarketInput =
  z.infer<typeof createMarketSchema>;
