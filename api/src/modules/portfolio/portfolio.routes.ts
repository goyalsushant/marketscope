import type { FastifyInstance } from "fastify";
import {
  PortfolioParseError,
  parsePortfolioCsv
} from "./portfolio.parser.js";
import { validatePortfolioRows } from "./portfolio.validator.js";
import { createPortfolioUpload } from "./portfolio.service.js";

export async function portfolioRoutes(app: FastifyInstance) {
  app.post("/api/portfolio/uploads", async (request, reply) => {
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({
        message: "Portfolio file is required"
      });
    }

    if (!file.filename.toLowerCase().endsWith(".csv")) {
      return reply.status(400).send({
        message: "Only CSV files are currently supported"
      });
    }

    const content = await file.toBuffer();

    let records;

    try {
      records = parsePortfolioCsv(content.toString("utf-8"));
    } catch (error) {
      if (error instanceof PortfolioParseError) {
        return reply.status(400).send({
          message: error.message
        });
      }

      throw error;
    }

    const validation = validatePortfolioRows(records);

    if (validation.errors.length > 0) {
      return reply.status(400).send({
        message: "Portfolio validation failed",
        errors: validation.errors
      });
    }

    try {
      const result = await createPortfolioUpload(
        file.filename,
        validation.rows
      );

      return reply.status(201).send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("Unknown categories:")
      ) {
        return reply.status(400).send({
          message: error.message
        });
      }

      throw error;
    }
  });
}
