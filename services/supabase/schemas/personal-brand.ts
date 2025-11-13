import { pgTable, timestamp, uuid, boolean, varchar, jsonb } from "drizzle-orm/pg-core";

// Personal brands table
// This table stores personal brands used for content generation, following a structured narrative framework
// Designed to support multiple personal brands in the future
export const personalBrands = pgTable("personal_brands", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Basic information
    name: varchar("name", { length: 255 }).notNull(),
    linkedinProfile: varchar("linkedin_profile", { length: 500 }),

    brandNarrative: jsonb("brand_narrative").notNull(),
    strongOpinions: jsonb("strong_opinions").notNull().default("[]"),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// Brand narrative type definition
export interface BrandNarrative {
    immediateCredibility: string;
    professionalProblemOrChallenge: string;
    internalStruggles: string;
    externalContext: string;
    keyMicrotransitions: string;
    insightOrSpark: string;
    process: string;
    resultOrTransformation: string;
    sharedBeliefs: string;
    currentVisionOrPersonalMission: string;
    socialProofOrValidation: string;
    callToAction: string;
}

// TypeScript types derived from schema
export type PersonalBrand = Omit<typeof personalBrands.$inferSelect, "brandNarrative" | "strongOpinions"> & {
    brandNarrative: BrandNarrative;
    strongOpinions: string[];
};
export type NewPersonalBrand = Omit<typeof personalBrands.$inferInsert, "brandNarrative" | "strongOpinions"> & {
    brandNarrative?: BrandNarrative;
    strongOpinions?: string[];
};

// Legacy table alias for backward compatibility during migration
export const persons = personalBrands;

