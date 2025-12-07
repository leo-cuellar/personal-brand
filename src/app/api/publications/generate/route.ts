import { NextResponse } from "next/server";
import { getContext } from "./modules/getContext";
import { getPublicationAngle } from "./modules/getPublicationAngle";

const HARDCODED_PERSONAL_BRAND_ID = "00000000-0000-0000-0000-000000000001";

export async function POST() {
    try {
        // Get context for publication generation
        const {
            personalBrand,
            publicationIdeas,
            publicationTypes,
            publicationStructures,
            readerPersonas,
        } = await getContext(HARDCODED_PERSONAL_BRAND_ID);

        // Extract angles for each idea-persona combination
        const angles: unknown[] = [];

        // Loop through each idea
        for (const idea of publicationIdeas) {
            // Loop through each persona
            for (const persona of readerPersonas) {
                const angle = await getPublicationAngle({
                    idea,
                    persona,
                    personalBrand,
                });
                angles.push(angle);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Publication generation endpoint - implementation in progress",
            angles,
            data: null,
        });
    } catch (error) {
        console.error("Error generating publication:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate publication",
            },
            { status: 500 }
        );
    }
}
