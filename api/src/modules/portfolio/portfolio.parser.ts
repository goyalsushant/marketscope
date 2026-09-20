import { parse } from "csv-parse/sync";
import {
  PORTFOLIO_HEADERS
} from "./portfolio.constants.js";

export class PortfolioParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortfolioParseError";
  }
}

export function parsePortfolioCsv(content: string): Record<string, string>[] {
  if (!content.trim()) {
    throw new PortfolioParseError("The uploaded CSV file is empty.");
  }

  let records: Record<string, string>[];

  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
  } catch (error) {
    throw new PortfolioParseError(
      `Unable to parse CSV file: ${
        error instanceof Error ? error.message : "invalid CSV"
      }`
    );
  }

  if (records.length === 0) {
    throw new PortfolioParseError(
      "The uploaded CSV does not contain any data rows."
    );
  }

  const headers = Object.keys(records[0]);

  const missingHeaders = PORTFOLIO_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    throw new PortfolioParseError(
      `Missing required columns: ${missingHeaders.join(", ")}`
    );
  }

  return records;
}
