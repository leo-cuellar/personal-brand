import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { persons } from "./person";

// Strong opinions table
export const strongOpinions = pgTable("strong_opinions", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
        .references(() => persons.id, { onDelete: "cascade" })
        .notNull(),
    opinion: text("opinion").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type StrongOpinion = typeof strongOpinions.$inferSelect;
export type NewStrongOpinion = typeof strongOpinions.$inferInsert;

