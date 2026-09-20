import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  HOST: z.string().default("localhost"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  DATABASE_URL: z.string().min(1),

  NOMINATIM_BASE_URL: z
    .string()
    .url()
    .default("https://nominatim.openstreetmap.org"),

  OVERPASS_BASE_URL: z
    .string()
    .url()
    .default("https://overpass-api.de/api/interpreter")
});

export const env = envSchema.parse(process.env);
