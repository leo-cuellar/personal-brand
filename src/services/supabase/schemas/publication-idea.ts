import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { persons } from "./person";

// Enum for idea source
export const ideaSourceEnum = pgEnum("idea_source", ["ai", "manual"]);

// Publication ideas table
export const publicationIdeas = pgTable("publication_ideas", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
        .references(() => persons.id, { onDelete: "cascade" })
        .notNull(),
    idea: text("idea").notNull(),
    description: text("description"),
    source: ideaSourceEnum("source").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type PublicationIdea = typeof publicationIdeas.$inferSelect;
export type NewPublicationIdea = typeof publicationIdeas.$inferInsert;
export type IdeaSource = (typeof ideaSourceEnum.enumValues)[number];

