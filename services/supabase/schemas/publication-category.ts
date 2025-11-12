import { pgTable, text, timestamp, uuid, boolean, varchar } from "drizzle-orm/pg-core";
import { personalBrands } from "./personal-brand";

// Publication categories table
export const publicationCategories = pgTable("publication_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    personalBrandId: uuid("personal_brand_id")
        .references(() => personalBrands.id, { onDelete: "cascade" })
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
    useForSearch: boolean("use_for_search").notNull().default(false),
});

// TypeScript types derived from schema
export type PublicationCategory = typeof publicationCategories.$inferSelect;
export type NewPublicationCategory = typeof publicationCategories.$inferInsert;

