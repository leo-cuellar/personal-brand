import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    varchar,
    jsonb,
} from "drizzle-orm/pg-core";
import { personalBrands } from "./personal-brand";

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

