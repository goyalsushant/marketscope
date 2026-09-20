import z from "zod";

export const marketIdParamsSchema = z.object({
  marketId: z.string().uuid()
});
