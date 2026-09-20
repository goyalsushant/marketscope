import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, {
  schema
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function checkPostgis(): Promise<string> {
  const result = await pool.query<{ version: string }>(
    "SELECT PostGIS_Version() AS version"
  );

  return result.rows[0]?.version ?? "unknown";
}
