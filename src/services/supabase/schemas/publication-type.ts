import { pgTable, text, timestamp, uuid, boolean, varchar } from "drizzle-orm/pg-core";

// Publication types table
export const publicationTypes = pgTable("publication_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isDeleted: boolean("is_deleted").notNull().default(false),
});

// TypeScript types derived from schema
export type PublicationType = typeof publicationTypes.$inferSelect;
export type NewPublicationType = typeof publicationTypes.$inferInsert;

