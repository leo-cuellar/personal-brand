import { config } from "dotenv";

config({ path: ".env.local" });

import { getPostgresClient } from "../index";
import { mockPublications } from "../mocks/publications";
import { mockStrongOpinions } from "../mocks/strong-opinions";
import { mockPublicationTypes } from "../mocks/publication-types";
import { mockPublicationTopics } from "../mocks/publication-topics";
import { mockPublicationIdeas } from "../mocks/publication-ideas";
import { mockPersonalStories } from "../mocks/personal-stories";

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
                    created_at, updated_at, is_archived
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
                    ${publication.isArchived}
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
                    id, opinion, created_at, updated_at, is_archived
                ) VALUES (
                    ${opinion.id}::uuid,
                    ${opinion.opinion},
                    ${new Date(opinion.createdAt)},
                    ${new Date(opinion.updatedAt)},
                    ${opinion.isArchived}
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
                    id, name, description, created_at, updated_at, is_archived
                ) VALUES (
                    ${publicationType.id}::uuid,
                    ${publicationType.name},
                    ${publicationType.description},
                    ${new Date(publicationType.createdAt)},
                    ${new Date(publicationType.updatedAt)},
                    ${publicationType.isArchived}
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

async function seedPublicationTopics() {
    console.log("🌱 Seeding publication topics...");

    try {
        const client = pg();

        // Insert publication topics one by one using direct SQL
        for (const publicationTopic of mockPublicationTopics) {
            await client`
                INSERT INTO public.publication_topics (
                    id, name, description, created_at, updated_at, is_archived
                ) VALUES (
                    ${publicationTopic.id}::uuid,
                    ${publicationTopic.name},
                    ${publicationTopic.description},
                    ${new Date(publicationTopic.createdAt)},
                    ${new Date(publicationTopic.updatedAt)},
                    ${publicationTopic.isArchived}
                )
                ON CONFLICT (name) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPublicationTopics.length} publication topics inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding publication topics:", error);
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
                    id, idea, description, source, created_at, updated_at, is_archived
                ) VALUES (
                    ${publicationIdea.id}::uuid,
                    ${publicationIdea.idea},
                    ${publicationIdea.description || null},
                    ${publicationIdea.source}::idea_source,
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

async function seedPersonalStories() {
    console.log("🌱 Seeding personal stories...");

    try {
        const client = pg();

        // Insert personal stories one by one using direct SQL
        for (const personalStory of mockPersonalStories) {
            await client`
                INSERT INTO public.personal_stories (
                    id, immediate_credibility, professional_problem_or_challenge,
                    internal_struggles, external_context, key_microtransitions,
                    insight_or_spark, process, result_or_transformation,
                    shared_beliefs, current_vision_or_personal_mission,
                    social_proof_or_validation, call_to_action,
                    created_at, updated_at, is_archived
                ) VALUES (
                    ${personalStory.id}::uuid,
                    ${personalStory.immediateCredibility},
                    ${personalStory.professionalProblemOrChallenge},
                    ${personalStory.internalStruggles},
                    ${personalStory.externalContext},
                    ${personalStory.keyMicrotransitions},
                    ${personalStory.insightOrSpark},
                    ${personalStory.process},
                    ${personalStory.resultOrTransformation},
                    ${personalStory.sharedBeliefs},
                    ${personalStory.currentVisionOrPersonalMission},
                    ${personalStory.socialProofOrValidation},
                    ${personalStory.callToAction},
                    ${new Date(personalStory.createdAt)},
                    ${new Date(personalStory.updatedAt)},
                    ${personalStory.isArchived}
                )
                ON CONFLICT (id) DO NOTHING
            `;
        }

        await client.end();

        console.log(
            `✅ ${mockPersonalStories.length} personal stories inserted successfully`
        );
    } catch (error) {
        console.error("❌ Error seeding personal stories:", error);
        throw error;
    }
}

async function main() {
    console.log("🚀 Starting seed process...");

    try {
        await seedPersonalStories();
        await seedPublicationIdeas();
        await seedPublicationTopics();
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

export {
    seedPublications,
    seedStrongOpinions,
    seedPublicationTypes,
    seedPublicationTopics,
    seedPublicationIdeas,
    seedPersonalStories,
};
