import {
  REQUIRED_VALUE_HEADERS
} from "./portfolio.constants.js";

import type {
  PortfolioRow,
  PortfolioValidationError,
  PortfolioValidationResult
} from "./portfolio.types.js";

function parseCoordinate(
  value: string | undefined,
  field: "latitude" | "longitude",
  row: number,
  errors: PortfolioValidationError[]
): number | null {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    errors.push({
      row,
      field,
      message: `${field} must be a valid number`
    });

    return null;
  }

  if (field === "latitude" && (parsed < -90 || parsed > 90)) {
    errors.push({
      row,
      field,
      message: "latitude must be between -90 and 90"
    });

    return null;
  }

  if (field === "longitude" && (parsed < -180 || parsed > 180)) {
    errors.push({
      row,
      field,
      message: "longitude must be between -180 and 180"
    });

    return null;
  }

  return parsed;
}

export function validatePortfolioRows(
  records: Record<string, string>[]
): PortfolioValidationResult {
  const rows: PortfolioRow[] = [];
  const errors: PortfolioValidationError[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2;

    for (const field of REQUIRED_VALUE_HEADERS) {
      if (!record[field]?.trim()) {
        errors.push({
          row: rowNumber,
          field,
          message: `${field} is required`
        });
      }
    }

    const latitude = parseCoordinate(
      record.latitude,
      "latitude",
      rowNumber,
      errors
    );

    const longitude = parseCoordinate(
      record.longitude,
      "longitude",
      rowNumber,
      errors
    );

    const hasLatitude = latitude !== null;
    const hasLongitude = longitude !== null;

    if (hasLatitude !== hasLongitude) {
      errors.push({
        row: rowNumber,
        field: "latitude/longitude",
        message:
          "latitude and longitude must either both be provided or both be empty"
      });
    }

    rows.push({
      storeName: record.store_name?.trim() ?? "",
      address: record.address?.trim() ?? "",
      city: record.city?.trim() ?? "",
      state: record.state?.trim() ?? "",
      country: record.country?.trim() ?? "",
      category: record.category?.trim() ?? "",
      latitude,
      longitude
    });
  });

  return {
    rows,
    errors
  };
}
