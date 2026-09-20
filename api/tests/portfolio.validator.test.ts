import { describe, expect, it } from "vitest";
import { parsePortfolioCsv } from "../src/modules/portfolio/portfolio.parser.js";
import { validatePortfolioRows } from "../src/modules/portfolio/portfolio.validator.js";

const validCsv = `store_name,address,city,state,country,category,latitude,longitude
FreshMart Koramangala,"80 Feet Road, Koramangala 4th Block",Bengaluru,Karnataka,India,Supermarket,12.9352,77.6245
BigBasket Hyperstore Whitefield,"ITPL Main Road, Whitefield",Bengaluru,Karnataka,India,Hypermarket,,`;

describe("portfolio parser", () => {
  it("parses quoted addresses containing commas", () => {
    const records = parsePortfolioCsv(validCsv);

    expect(records[0].address).toBe(
      "80 Feet Road, Koramangala 4th Block"
    );
  });

  it("rejects an empty CSV", () => {
    expect(() => parsePortfolioCsv("")).toThrow(
      "uploaded CSV file is empty"
    );
  });

  it("rejects missing headers", () => {
    const csv = `store_name,address,city,state,country,latitude,longitude
Store,Address,Bengaluru,Karnataka,India,12,77`;

    expect(() => parsePortfolioCsv(csv)).toThrow(
      "Missing required columns: category"
    );
  });
});

describe("portfolio validator", () => {
  it("accepts rows with missing coordinates", () => {
    const records = parsePortfolioCsv(validCsv);

    const result = validatePortfolioRows(records);

    expect(result.errors).toHaveLength(0);
    expect(result.rows[1].latitude).toBeNull();
    expect(result.rows[1].longitude).toBeNull();
  });

  it("rejects latitude without longitude", () => {
    const records = [
      {
        store_name: "Test Store",
        address: "Test Address",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        category: "Supermarket",
        latitude: "12.9",
        longitude: ""
      }
    ];

    const result = validatePortfolioRows(records);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe("latitude/longitude");
  });

  it("rejects invalid latitude", () => {
    const records = [
      {
        store_name: "Test Store",
        address: "Test Address",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        category: "Supermarket",
        latitude: "91",
        longitude: "77"
      }
    ];

    const result = validatePortfolioRows(records);

    expect(result.errors[0].message).toContain(
      "latitude must be between -90 and 90"
    );
  });

  it("rejects invalid longitude", () => {
    const records = [
      {
        store_name: "Test Store",
        address: "Test Address",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        category: "Supermarket",
        latitude: "12",
        longitude: "181"
      }
    ];

    const result = validatePortfolioRows(records);

    expect(result.errors[0].message).toContain(
      "longitude must be between -180 and 180"
    );
  });
});
