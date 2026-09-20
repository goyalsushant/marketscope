import type { FastifyInstance } from "fastify";
import { createMarket, getBoundaryPreview, getMarketPortfolio, MarketValidationError } from "./market.service.js";
import { createMarketSchema } from "./market.schema.js";
import { markets } from "../../db/schema/markets.js";

export async function marketRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: {
      cityId?: string;
    };
  }>(
    "/api/markets/boundary-preview",
    async (request, reply) => {
      const { cityId } = request.query;

      if (!cityId) {
        return reply.status(400).send({
          message: "cityId is required"
        });
      }

      try {
        return await getBoundaryPreview(cityId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "City not found"
        ) {
          return reply.status(404).send({
            message: error.message
          });
        }

        if (
          error instanceof Error &&
          error.message.includes(
            "Unable to determine boundary"
          )
        ) {
          return reply.status(502).send({
            message: error.message
          });
        }

        throw error;
      }
    }
  );

  app.post(
    "/api/markets",
    async (request, reply) => {
      const parsed =
        createMarketSchema.safeParse(
          request.body
        );

      if (!parsed.success) {
        return reply.status(400).send({
          message:
            "Invalid market configuration",
          errors:
            parsed.error.flatten()
        });
      }

      try {
        const market =
          await createMarket(parsed.data);

        return reply
          .status(201)
          .send({
            market
          });
      } catch (error) {
        if (
          error instanceof
          MarketValidationError
        ) {
          return reply
            .status(400)
            .send({
              message: error.message
            });
        }

        request.log.error(
          error,
          "Failed to create market"
        );

        return reply
          .status(500)
          .send({
            message:
              "Failed to create market"
          });
      }
    }
  );

  app.get<{
    Params: {
      marketId: string;
    };
  }>(
    "/api/markets/:marketId/portfolio",
    async (request, reply) => {
      const {
        marketId
      } = request.params
      const result =
        await getMarketPortfolio(
          marketId
        );

      if (!result) {
        return reply
          .code(404)
          .send({
            message:
              "Market not found"
          });
      }

      return reply.send(result);
    }
  );

}
