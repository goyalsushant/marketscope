import {
    pgTable,
    uuid,
    varchar,
    timestamp
} from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
        length: 100
    }).notNull(),

    code: varchar("code", {
        length: 10
    }).notNull().unique(),

    createdAt: timestamp("created_at", {
        withTimezone: true
    }).defaultNow().notNull()
});
