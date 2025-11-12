import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    jsonb,
    varchar,
} from "drizzle-orm/pg-core";
import { persons } from "./person";

// Publication structures table
// This table stores flexible publication structures as JSON
export const publicationStructures = pgTable("publication_structures", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
        .references(() => persons.id, { onDelete: "cascade" })
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    structure: jsonb("structure").notNull(), // JSON object with dynamic fields
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type PublicationStructure = typeof publicationStructures.$inferSelect;
export type NewPublicationStructure = typeof publicationStructures.$inferInsert;

