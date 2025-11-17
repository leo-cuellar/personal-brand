import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    pgEnum,
    varchar,
    jsonb,
} from "drizzle-orm/pg-core";
import { personalBrands } from "./personal-brand";
import { inspirationSourceEnum } from "./inspiration";

// Enum for idea status
export const ideaStatusEnum = pgEnum("idea_status", ["in_review", "accepted", "rejected", "used", "incomplete"]);

// Publication ideas table
export const publicationIdeas = pgTable("publication_ideas", {
    id: uuid("id").primaryKey().defaultRandom(),
    personalBrandId: uuid("personal_brand_id")
        .references(() => personalBrands.id, { onDelete: "cascade" })
        .notNull(),
    title: text("title").notNull(),
    description: text("description"),
    link: varchar("link", { length: 500 }),
    status: ideaStatusEnum("status").notNull().default("in_review"),
    source: inspirationSourceEnum("source"), // Optional source field
    sourceSummary: text("source_summary"),
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
export type PublicationIdea = typeof publicationIdeas.$inferSelect;
export type NewPublicationIdea = typeof publicationIdeas.$inferInsert;
export type IdeaStatus = (typeof ideaStatusEnum.enumValues)[number];

