import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { countries } from "../../db/schema/countries.js";
import { states } from "../../db/schema/states.js";
import { cities } from "../../db/schema/cities.js";

export async function getCountries() {
  return db
    .select({
      id: countries.id,
      name: countries.name,
      code: countries.code
    })
    .from(countries)
    .orderBy(countries.name);
}

export async function getStates(countryId: string) {
  return db
    .select({
      id: states.id,
      name: states.name,
      code: states.code
    })
    .from(states)
    .where(eq(states.countryId, countryId))
    .orderBy(states.name);
}

export async function getCities(stateId: string) {
  return db
    .select({
      id: cities.id,
      name: cities.name
    })
    .from(cities)
    .where(eq(cities.stateId, stateId))
    .orderBy(cities.name);
}
