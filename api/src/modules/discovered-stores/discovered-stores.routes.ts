import type { FastifyInstance } from "fastify";
import {
  discoverStoresForMarket,
  getDiscoveredStoresForMarket
} from "./discovered-stores.service.js";

export async function discoveredStoresRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/markets/:marketId/discovered-stores",
    async (request, reply) => {
      const {
        marketId
      } = request.params as {
        marketId: string;
      };

      const stores =
        await getDiscoveredStoresForMarket(
          marketId
        );

      return reply.send({
        marketId,
        stores
      });
    }
  );

  app.post(
    "/api/markets/:marketId/discovered-stores/discover",
    async (request, reply) => {
      const {
        marketId
      } = request.params as {
        marketId: string;
      };

      const stores =
        await discoverStoresForMarket(
          marketId
        );

      return reply.send({
        marketId,
        stores,
        count: stores.length
      });
    }
  );
}
