import { config } from "dotenv";

config({ path: ".env.local" });

import { getPostgresClient } from "../index";
import { mockPublications } from "../mocks/publications";
import { mockStrongOpinions } from "../mocks/strong-opinions";
import { mockPublicationTypes } from "../mocks/publication-types";

const pg = () => getPostgresClient();

// TODO: Configure Row Level Security (RLS) for all tables in the future
// This should include policies for SELECT, INSERT, UPDATE, and DELETE operations

async function seedPublications() {
    console.log("🌱 Seeding publications...");

    try {
        const client = pg();

        // Insert publications one by one using direct SQL
        for (const publication of mockPublications) {
            await client`
                INSERT INTO public.publications (
                    id, title, content, status, platform, 
                    scheduled_at, published_at, 
                    created_at, updated_at, is_deleted
                ) VALUES (
                    ${publication.id}::uuid,
                    ${publication.title || null},
                    ${publication.content},
                    ${publication.status}::publication_status,
                    ${publication.platform}::publication_platform,
                    ${publication.scheduledAt ? new Date(publication.scheduledAt) : null},
                    ${publication.publishedAt ? new Date(publication.publishedAt) : null},
                    ${new Date(publication.createdAt)},
                    ${new Date(publication.updatedAt)},
                    ${publication.isDeleted}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPublications.length} publications inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding publications:", error);
        throw error;
    }
}

async function seedStrongOpinions() {
    console.log("🌱 Seeding strong opinions...");

    try {
        const client = pg();

        // Insert strong opinions one by one using direct SQL
        for (const opinion of mockStrongOpinions) {
            await client`
                INSERT INTO public.strong_opinions (
                    id, opinion, created_at, updated_at, is_deleted
                ) VALUES (
                    ${opinion.id}::uuid,
                    ${opinion.opinion},
                    ${new Date(opinion.createdAt)},
                    ${new Date(opinion.updatedAt)},
                    ${opinion.isDeleted}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockStrongOpinions.length} strong opinions inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding strong opinions:", error);
        throw error;
    }
}

async function seedPublicationTypes() {
    console.log("🌱 Seeding publication types...");

    try {
        const client = pg();

        // Insert publication types one by one using direct SQL
        for (const publicationType of mockPublicationTypes) {
            await client`
                INSERT INTO public.publication_types (
                    id, name, description, created_at, updated_at, is_deleted
                ) VALUES (
                    ${publicationType.id}::uuid,
                    ${publicationType.name},
                    ${publicationType.description},
                    ${new Date(publicationType.createdAt)},
                    ${new Date(publicationType.updatedAt)},
                    ${publicationType.isDeleted}
                )
                ON CONFLICT (name) DO NOTHING
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

async function main() {
    console.log("🚀 Starting seed process...");

    try {
        await seedPublicationTypes();
        await seedStrongOpinions();
        await seedPublications();
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

export { seedPublications, seedStrongOpinions, seedPublicationTypes };
