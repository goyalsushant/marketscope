import type { FastifyInstance } from "fastify";
import { getCategories } from "./category.service.js";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/api/categories", async () => {
    return getCategories();
  });
}
