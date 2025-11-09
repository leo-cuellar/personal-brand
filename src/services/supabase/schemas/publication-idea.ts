import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { persons } from "./person";

// Enum for idea status
export const ideaStatusEnum = pgEnum("idea_status", ["in_review", "accepted", "rejected", "used"]);

// Publication ideas table
export const publicationIdeas = pgTable("publication_ideas", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
        .references(() => persons.id, { onDelete: "cascade" })
        .notNull(),
    idea: text("idea").notNull(),
    description: text("description"),
    status: ideaStatusEnum("status").notNull().default("in_review"),
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
export type IdeaStatus = (typeof ideaStatusEnum.enumValues)[number];

