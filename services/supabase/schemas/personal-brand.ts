import { pgTable, timestamp, uuid, boolean, varchar, jsonb } from "drizzle-orm/pg-core";

// Personal brands table
// This table stores personal brands used for content generation, following a structured narrative framework
// Designed to support multiple personal brands in the future
export const personalBrands = pgTable("personal_brands", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Basic information
    name: varchar("name", { length: 255 }).notNull(),
    socialAccounts: jsonb("social_accounts").notNull().default("{}"),

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

// Social account type definition
export interface SocialAccount {
    profile_url: string;
    profile_name: string; // Without the @ symbol
}

export interface SocialAccounts {
    linkedin?: SocialAccount;
    twitter?: SocialAccount;
    instagram?: SocialAccount;
    // Add more social platforms as needed
}

// TypeScript types derived from schema
export type PersonalBrand = Omit<typeof personalBrands.$inferSelect, "brandNarrative" | "strongOpinions" | "socialAccounts"> & {
    brandNarrative: BrandNarrative;
    strongOpinions: string[];
    socialAccounts: SocialAccounts;
};
export type NewPersonalBrand = Omit<typeof personalBrands.$inferInsert, "brandNarrative" | "strongOpinions" | "socialAccounts"> & {
    brandNarrative?: BrandNarrative;
    strongOpinions?: string[];
    socialAccounts?: SocialAccounts;
};

// Legacy table alias for backward compatibility during migration
export const persons = personalBrands;

