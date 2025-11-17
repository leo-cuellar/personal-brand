import { config } from "dotenv";

config({ path: ".env.local" });

import { getPostgresClient } from "../index";

const pg = () => getPostgresClient();

async function resetDatabase() {
    console.log("🔄 Resetting database...");

    console.log(
        "⚠️  This will delete ALL data!"
    );

    try {
        // 1. Drop tables using direct SQL
        const client = pg();
        console.log("🗑️ Dropping existing tables...");

        // Drop tables in correct order
        await client`DROP TABLE IF EXISTS public.personal_brands CASCADE`;
        await client`DROP TABLE IF EXISTS public.publication_ideas CASCADE`;
        await client`DROP TABLE IF EXISTS public.publication_categories CASCADE`;
        await client`DROP TABLE IF EXISTS public.publication_types CASCADE`;
        await client`DROP TABLE IF EXISTS public.publication_structures CASCADE`;

        // Drop enums if they exist
        await client`DROP TYPE IF EXISTS public.idea_source CASCADE`;
        await client`DROP TYPE IF EXISTS public.idea_status CASCADE`;

        await client.end();

        console.log("✅ Database reset successfully");
        console.log("💡 Run 'npm run db:push' to sync the schema");
        console.log("💡 Run 'npm run db:seed' to populate with test data");
    } catch (error) {
        console.error("❌ Error resetting database:", error);
        throw error;
    }
}

async function main() {
    console.log("🚀 Starting reset process...");

    try {
        await resetDatabase();
        console.log("🎉 Reset completed successfully!");
    } catch (error) {
        console.error("💥 Error in reset process:", error);
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

export { resetDatabase };
