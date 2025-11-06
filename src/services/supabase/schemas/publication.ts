import {
    pgTable,
    text,
    boolean,
    timestamp,
    uuid,
    varchar,
    pgEnum,
} from "drizzle-orm/pg-core";

// Enum para estado de publicación
export const publicationStatusEnum = pgEnum("publication_status", [
    "draft",
    "scheduled",
    "published",
]);

// Publication platform enum
export const publicationPlatformEnum = pgEnum("publication_platform", [
    "linkedin"
]);

// Publications table
export const publications = pgTable("publications", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }),
    content: text("content").notNull(),
    status: publicationStatusEnum("status").notNull().default("draft"),
    platform: publicationPlatformEnum("platform")
        .notNull()
        .default("linkedin"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isDeleted: boolean("is_deleted").notNull().default(false),
});

// Tipos TypeScript derivados del schema
export type Publication = typeof publications.$inferSelect;
export type NewPublication = typeof publications.$inferInsert;
export type PublicationStatus =
    (typeof publicationStatusEnum.enumValues)[number];
export type PublicationPlatform =
    (typeof publicationPlatformEnum.enumValues)[number];

