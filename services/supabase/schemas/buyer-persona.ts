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

// Enum for knowledge level
export const knowledgeLevelEnum = pgEnum("knowledge_level", ["low", "medium", "high"]);

// Buyer personas table
export const buyerPersonas = pgTable("buyer_personas", {
    id: uuid("id").primaryKey().defaultRandom(),
    personalBrandId: uuid("personal_brand_id")
        .references(() => personalBrands.id, { onDelete: "cascade" })
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    goals: jsonb("goals").notNull().default("[]"),
    frustrations: jsonb("frustrations").notNull().default("[]"),
    desires: jsonb("desires").notNull().default("[]"),
    knowledgeLevel: knowledgeLevelEnum("knowledge_level").notNull().default("medium"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type BuyerPersona = Omit<typeof buyerPersonas.$inferSelect, "goals" | "frustrations" | "desires"> & {
    goals: string[];
    frustrations: string[];
    desires: string[];
};
export type NewBuyerPersona = Omit<typeof buyerPersonas.$inferInsert, "goals" | "frustrations" | "desires"> & {
    goals?: string[];
    frustrations?: string[];
    desires?: string[];
};
export type KnowledgeLevel = (typeof knowledgeLevelEnum.enumValues)[number];

