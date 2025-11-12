import { pgTable, text, timestamp, uuid, boolean, varchar, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { persons } from "./person";

// Enum for inspiration source
export const inspirationSourceEnum = pgEnum("inspiration_source", ["manual", "trend_scanner", "linkedin"]);

// Inspirations table
// This table stores inspiration content that can range from short ideas to full LinkedIn posts
export const inspirations = pgTable("inspirations", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
        .references(() => persons.id, { onDelete: "cascade" })
        .notNull(),
    text: text("text").notNull(),
    link: varchar("link", { length: 500 }),
    source: inspirationSourceEnum("source").notNull().default("manual"),
    metadata: jsonb("metadata"), // JSON field for source-specific metadata
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type Inspiration = typeof inspirations.$inferSelect;
export type NewInspiration = typeof inspirations.$inferInsert;

