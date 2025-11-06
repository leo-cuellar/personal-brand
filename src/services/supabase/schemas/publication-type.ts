import { pgTable, text, timestamp, uuid, boolean, varchar } from "drizzle-orm/pg-core";
import { persons } from "./person";

// Publication types table
export const publicationTypes = pgTable("publication_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
        .references(() => persons.id, { onDelete: "cascade" })
        .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type PublicationType = typeof publicationTypes.$inferSelect;
export type NewPublicationType = typeof publicationTypes.$inferInsert;

