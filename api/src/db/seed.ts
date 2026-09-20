import { db } from "./client.js";
import { countries } from "./schema/countries.js";
import { states } from "./schema/states.js";
import { cities } from "./schema/cities.js";
import { categories } from "./schema/categories.js";

async function seed() {
  console.log("Seeding MarketScope database...");

  const [india] = await db
    .insert(countries)
    .values({
      name: "India",
      code: "IN"
    })
    .onConflictDoNothing()
    .returning();

  if (!india) {
    throw new Error("Unable to create or retrieve India");
  }

  const [karnataka] = await db
    .insert(states)
    .values({
      countryId: india.id,
      name: "Karnataka",
      code: "KA"
    })
    .onConflictDoNothing()
    .returning();

  const [maharashtra] = await db
    .insert(states)
    .values({
      countryId: india.id,
      name: "Maharashtra",
      code: "MH"
    })
    .onConflictDoNothing()
    .returning();

  const [delhi] = await db
    .insert(states)
    .values({
      countryId: india.id,
      name: "Delhi",
      code: "DL"
    })
    .onConflictDoNothing()
    .returning();

  if (!karnataka || !maharashtra || !delhi) {
    throw new Error("Unable to create states");
  }

  await db
    .insert(cities)
    .values([
      {
        stateId: karnataka.id,
        name: "Bengaluru"
      },
      {
        stateId: maharashtra.id,
        name: "Mumbai"
      },
      {
        stateId: delhi.id,
        name: "New Delhi"
      }
    ])
    .onConflictDoNothing();

  await db
    .insert(categories)
    .values([
      {
        name: "Supermarket",
        slug: "supermarket"
      },
      {
        name: "Pharmacy",
        slug: "pharmacy"
      },
      {
        name: "Hypermarket",
        slug: "hypermarket"
      },
      {
        name: "Grocery Store",
        slug: "grocery-store"
      },
      {
        name: "Convenience Store",
        slug: "convenience-store"
      }
    ])
    .onConflictDoNothing();

  console.log("Seed completed successfully.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { pool } = await import("./client.js");
    await pool.end();
  });
