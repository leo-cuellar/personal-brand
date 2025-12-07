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
    context_summary: string;
}

export async function getPublicationAngle(
    params: GetPublicationAngleParams
): Promise<GetPublicationAngleResult> {
    const { idea, persona, personalBrand } = params;

    // Extract IDs from the objects
    const ideaId = (idea as { id: string }).id;
    const personaId = (persona as { id: string }).id;

    return {
        idea_id: ideaId,
        persona_id: personaId,
        argument: "Declaración clara del punto central que la publicación demostrará o desarrollará.",
        method: "Explicación breve del enfoque lógico o narrativo que se utilizará para desarrollar el argumento.",
        strategic_relevance: "Razón objetiva por la cual este ángulo es valioso para la marca personal y para la audiencia objetivo.",
        context_summary: "Resumen crítico de la información del input que fundamenta el ángulo.",
    };
}
