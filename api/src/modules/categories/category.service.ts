import { db } from "../../db/client.js";
import { categories } from "../../db/schema/categories.js";

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug
    })
    .from(categories);
}
