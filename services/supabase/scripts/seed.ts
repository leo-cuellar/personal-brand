import { config } from "dotenv";

config({ path: ".env.local" });

import { getPostgresClient } from "../index";
import { mockPublicationTypes } from "../mocks/publication-types";
import { mockPublicationCategories } from "../mocks/publication-categories";
import { mockPublicationIdeas } from "../mocks/publication-ideas";
import { mockPublicationStructures } from "../mocks/publication-structures";
import { mockPersons } from "../mocks/personal-brands";
import { mockInspirations } from "../mocks/inspirations";

const pg = () => getPostgresClient();

// TODO: Configure Row Level Security (RLS) for all tables in the future
// This should include policies for SELECT, INSERT, UPDATE, and DELETE operations

async function seedPublicationTypes() {
    console.log("🌱 Seeding publication types...");

    try {
        const client = pg();

        // Insert publication types one by one using direct SQL
        for (const publicationType of mockPublicationTypes) {
            await client`
                INSERT INTO public.publication_types (
                    id, personal_brand_id, name, description, created_at, updated_at, is_archived
                ) VALUES (
                    ${publicationType.id}::uuid,
                    ${publicationType.personalBrandId}::uuid,
                    ${publicationType.name},
                    ${publicationType.description},
                    ${new Date(publicationType.createdAt)},
                    ${new Date(publicationType.updatedAt)},
                    ${publicationType.isArchived}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPublicationTypes.length} publication types inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding publication types:", error);
        throw error;
    }
}

async function seedPublicationCategories() {
    console.log("🌱 Seeding publication categories...");

    try {
        const client = pg();

        // Insert publication categories one by one using direct SQL
        for (const publicationCategory of mockPublicationCategories) {
            await client`
                INSERT INTO public.publication_categories (
                    id, personal_brand_id, name, description, created_at, updated_at, is_archived, use_for_search
                ) VALUES (
                    ${publicationCategory.id}::uuid,
                    ${publicationCategory.personalBrandId}::uuid,
                    ${publicationCategory.name},
                    ${publicationCategory.description},
                    ${new Date(publicationCategory.createdAt)},
                    ${new Date(publicationCategory.updatedAt)},
                    ${publicationCategory.isArchived},
                    ${publicationCategory.useForSearch}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPublicationCategories.length} publication categories inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding publication categories:", error);
        throw error;
    }
}

async function seedPublicationIdeas() {
    console.log("🌱 Seeding publication ideas...");

    try {
        const client = pg();

        // Insert publication ideas one by one using direct SQL
        for (const publicationIdea of mockPublicationIdeas) {
            await client`
                INSERT INTO public.publication_ideas (
                    id, personal_brand_id, idea, description, link, status, created_at, updated_at, is_archived
                ) VALUES (
                    ${publicationIdea.id}::uuid,
                    ${publicationIdea.personalBrandId}::uuid,
                    ${publicationIdea.idea},
                    ${publicationIdea.description || null},
                    ${publicationIdea.link || null},
                    ${publicationIdea.status}::idea_status,
                    ${new Date(publicationIdea.createdAt)},
                    ${new Date(publicationIdea.updatedAt)},
                    ${publicationIdea.isArchived}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPublicationIdeas.length} publication ideas inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding publication ideas:", error);
        throw error;
    }
}

async function seedPersonalBrands() {
    console.log("🌱 Seeding personal brands...");

    try {
        const client = pg();

        // Insert personal brands one by one using direct SQL
        for (const person of mockPersons) {
            // Use brandNarrative object directly
            const brandNarrative = person.brandNarrative;
            const strongOpinions = person.strongOpinions || [];

            const values = person.values || [];

            await client`
                INSERT INTO public.personal_brands (
                    id, name, username, niche, social_accounts, brand_narrative, strong_opinions, values,
                    created_at, updated_at, is_archived
                ) VALUES (
                    ${person.id}::uuid,
                    ${person.name},
                    ${person.username},
                    ${person.niche || null},
                    ${JSON.stringify(person.socialAccounts || {})}::jsonb,
                    ${JSON.stringify(brandNarrative)}::jsonb,
                    ${JSON.stringify(strongOpinions)}::jsonb,
                    ${JSON.stringify(values)}::jsonb,
                    ${new Date(person.createdAt)},
                    ${new Date(person.updatedAt)},
                    ${person.isArchived}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPersons.length} personal brands inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding personal brands:", error);
        throw error;
    }
}

async function seedInspirations() {
    console.log("🌱 Seeding inspirations...");

    try {
        const client = pg();

        // Insert inspirations one by one using direct SQL
        for (const inspiration of mockInspirations) {
            await client`
                INSERT INTO public.inspirations (
                    id, personal_brand_id, text, link, source, created_at, updated_at, is_archived
                ) VALUES (
                    ${inspiration.id}::uuid,
                    ${inspiration.personalBrandId}::uuid,
                    ${inspiration.text},
                    ${inspiration.link || null},
                    ${inspiration.source || "trend_scanner"}::inspiration_source,
                    ${new Date(inspiration.createdAt)},
                    ${new Date(inspiration.updatedAt)},
                    ${inspiration.isArchived}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockInspirations.length} inspirations inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding inspirations:", error);
        throw error;
    }
}

async function seedPublicationStructures() {
    console.log("🌱 Seeding publication structures...");

    try {
        const client = pg();

        // Insert publication structures one by one using direct SQL
        for (const structure of mockPublicationStructures) {
            await client`
                INSERT INTO public.publication_structures (
                    id, personal_brand_id, name, description, structure, created_at, updated_at, is_archived
                ) VALUES (
                    ${structure.id}::uuid,
                    ${structure.personalBrandId}::uuid,
                    ${structure.name},
                    ${structure.description || null},
                    ${JSON.stringify(structure.structure)}::jsonb,
                    ${new Date(structure.createdAt)},
                    ${new Date(structure.updatedAt)},
                    ${structure.isArchived}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPublicationStructures.length} publication structures inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding publication structures:", error);
        throw error;
    }
}

async function main() {
    console.log("🚀 Starting seed process...");

    try {
        await seedPersonalBrands();
        await seedPublicationIdeas();
        await seedPublicationCategories();
        await seedPublicationTypes();
        await seedPublicationStructures();
        await seedInspirations();
        console.log("🎉 Seed completed successfully!");
    } catch (error) {
        console.error("💥 Error in seed process:", error);
        process.exit(1);
    } finally {
        // Force process exit
        process.exit(0);
    }
}

// Execute if called directly
if (require.main === module) {
    main();
}

export {
    seedPublicationTypes,
    seedPublicationCategories,
    seedPublicationIdeas,
    seedPublicationStructures,
    seedPersonalBrands,
    seedInspirations,
};
