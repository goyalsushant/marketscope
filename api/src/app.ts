import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { checkDatabaseConnection, checkPostgis } from "./db/client.js";
import { locationRoutes } from "./modules/locations/location.routes.js";
import { categoryRoutes } from "./modules/categories/category.routes.js";
import { portfolioRoutes } from "./modules/portfolio/portfolio.routes.js";
import { marketRoutes } from "./modules/markets/market.routes.js";
import {
  discoveredStoresRoutes
} from "./modules/discovered-stores/discovered-stores.routes.js";


export function buildApp() {
  const app = Fastify({
    logger: true
  });
  app.register(multipart);

  app.register(cors, {
    origin: true
  });
  app.register(locationRoutes);
  app.register(categoryRoutes);
  app.register(portfolioRoutes);
  app.register(marketRoutes);
  app.register(discoveredStoresRoutes);

  app.get("/api/health", async (_request, reply) => {
    try {
      await checkDatabaseConnection();

      const postgisVersion = await checkPostgis();

      return reply.send({
        status: "ok",
        database: "connected",
        postgis: {
          available: true,
          version: postgisVersion
        }
      });
    } catch (error) {
      app.log.error(error);

      return reply.status(503).send({
        status: "degraded",
        database: "unavailable",
        postgis: {
          available: false
        }
      });
    }
  });

  return app;
}
