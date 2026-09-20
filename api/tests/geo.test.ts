import { describe, expect, it } from "vitest";
import { db } from "../src/db/client.js";
import { sql } from "drizzle-orm";

describe("PostGIS", () => {
  it("supports WGS84 geography points", async () => {
    const result = await db.execute(sql`
      SELECT ST_AsText(
        ST_SetSRID(
          ST_MakePoint(77.6245, 12.9352),
          4326
        )::geography
      ) AS point
    `);

    expect(result.rows[0].point).toBe(
      "POINT(77.6245 12.9352)"
    );
  });
});
