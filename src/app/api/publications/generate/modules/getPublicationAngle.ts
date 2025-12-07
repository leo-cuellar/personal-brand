import { generatePublicationAngle } from "../../../../../../services/openai/publication-angle";

export interface GetPublicationAngleParams {
    idea: unknown;
    persona: unknown;
    personalBrand: unknown;
}

export interface GetPublicationAngleResult {
    idea_id: string;
    persona_id: string;
    argument: string;
    method: string;
    strategic_relevance: string;
}

export async function getPublicationAngle(
    params: GetPublicationAngleParams
): Promise<GetPublicationAngleResult> {
    const { idea, persona, personalBrand } = params;

    // Extract IDs from the objects
    const ideaId = (idea as { id: string }).id;
    const personaId = (persona as { id: string }).id;

    // Format idea data
    const ideaData = {
        title: (idea as { title: string }).title || "",
        description: (idea as { description: string | null }).description || null,
    };

    // Format reader persona data (only: name, description, goals, frustrations, desires)
    const readerPersonaData = {
        name: (persona as { name: string }).name || "",
        description: (persona as { description: string | null }).description || null,
        goals: (persona as { goals: string[] }).goals || [],
        frustrations: (persona as { frustrations: string[] }).frustrations || [],
        desires: (persona as { desires: string[] }).desires || [],
    };

    // Format brand context from personal brand (only: niche, brand_narrative, strong_opinions, values)
    const brandContextData = {
        niche: (personalBrand as { niche: string | null }).niche || null,
        brand_narrative: (personalBrand as { brand_narrative: unknown }).brand_narrative || {},
        strong_opinions: (personalBrand as { strong_opinions: unknown }).strong_opinions as string[] || [],
        values: (personalBrand as { values: unknown }).values as string[] || [],
    };

    // Generate publication angle using OpenAI
    const angle = await generatePublicationAngle({
        idea: ideaData,
        readerPersona: readerPersonaData,
        brandContext: brandContextData,
    });

    return {
        idea_id: ideaId,
        persona_id: personaId,
        argument: angle.argument,
        method: angle.method,
        strategic_relevance: angle.strategic_relevance,
    };
}
