import { pgTable, text, timestamp, uuid, boolean, varchar } from "drizzle-orm/pg-core";

// Publication topics table
export const publicationTopics = pgTable("publication_topics", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
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
export type PublicationTopic = typeof publicationTopics.$inferSelect;
export type NewPublicationTopic = typeof publicationTopics.$inferInsert;

