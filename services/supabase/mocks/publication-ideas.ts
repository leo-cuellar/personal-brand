import { PublicationIdea } from "../schemas";

const HARDCODED_PERSONAL_BRAND_ID = "00000000-0000-0000-0000-000000000001";

export const mockPublicationIdeas: PublicationIdea[] = [
    {
        id: "00000000-0000-0000-0000-000000000100" as unknown as string,
        personalBrandId: HARDCODED_PERSONAL_BRAND_ID as unknown as string,
        title: "Cómo destacar como desarrollador frontend en el mercado laboral actual",
        description: "Estrategias prácticas para desarrolladores frontend que buscan mejorar su posición en el mercado laboral, incluyendo técnicas de networking, construcción de portafolio y desarrollo de habilidades técnicas clave.",
        link: null,
        status: "accepted" as const,
        source: "trend_scanner" as const,
        sourceSummary: "Análisis de tendencias del mercado laboral para desarrolladores frontend",
        metadata: {
            trend_keywords: ["frontend", "desarrollo", "carrera", "trabajo"],
            relevance_score: 0.85,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

