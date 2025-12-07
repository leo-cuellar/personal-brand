import { BuyerPersona } from "../schemas";

const HARDCODED_PERSONAL_BRAND_ID = "00000000-0000-0000-0000-000000000001";

export const mockBuyerPersonas: BuyerPersona[] = [
    {
        id: "00000000-0000-0000-0000-000000000010" as unknown as string,
        personalBrandId: HARDCODED_PERSONAL_BRAND_ID as unknown as string,
        name: "Desarrollador Frontend Junior",
        description: "Desarrollador con 1-3 años de experiencia buscando crecer en su carrera, conseguir mejores oportunidades laborales y construir una base sólida para su futuro profesional.",
        goals: [
            "Conseguir su primer trabajo o un trabajo mejor en una empresa internacional",
            "Aumentar su salario significativamente",
            "Mejorar sus habilidades técnicas y de comunicación",
            "Construir un portafolio sólido que destaque",
            "Aprender de desarrolladores más experimentados",
        ],
        frustrations: [
            "Siente que está estancado en su trabajo actual",
            "No sabe cómo destacar entre otros candidatos",
            "Le falta confianza para aplicar a trabajos internacionales o remotos",
            "No tiene una red profesional sólida",
            "No está seguro de qué tecnologías aprender o en qué enfocarse",
        ],
        desires: [
            "Trabajar en proyectos desafiantes y modernos",
            "Tener un mentor que lo guíe en su carrera",
            "Ganar en dólares trabajando desde casa",
            "Ser reconocido por su trabajo y habilidades",
            "Entender cómo funciona realmente la industria tech",
        ],
        knowledgeLevel: "low",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: "00000000-0000-0000-0000-000000000011" as unknown as string,
        personalBrandId: HARDCODED_PERSONAL_BRAND_ID as unknown as string,
        name: "Desarrollador Frontend Senior",
        description: "Desarrollador con 5+ años de experiencia buscando transicionar a roles de liderazgo o emprendimiento.",
        goals: [
            "Liderar un equipo técnico",
            "Iniciar su propio proyecto o startup",
            "Convertirse en un referente técnico en su área",
            "Generar ingresos pasivos o múltiples fuentes",
        ],
        frustrations: [
            "Siente que ha llegado a un techo en su carrera",
            "Quiere más impacto pero no sabe cómo lograrlo",
            "Le falta experiencia en negocios y estrategia",
            "No tiene claridad sobre su siguiente paso profesional",
        ],
        desires: [
            "Tener más autonomía y control sobre su trabajo",
            "Construir algo propio que tenga impacto",
            "Mentorear a otros desarrolladores",
            "Equilibrar trabajo técnico con liderazgo",
        ],
        knowledgeLevel: "high",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: "00000000-0000-0000-0000-000000000013" as unknown as string,
        personalBrandId: HARDCODED_PERSONAL_BRAND_ID as unknown as string,
        name: "Fundador/CEO/Decision Maker",
        description: "Fundador de startup, CEO o tomador de decisiones en empresas que busca escalar su negocio y construir un equipo técnico de alto rendimiento.",
        goals: [
            "Construir y escalar un producto tecnológico exitoso",
            "Atraer y retener talento técnico de alto nivel",
            "Optimizar procesos de desarrollo y entrega",
            "Crear una cultura técnica que impulse la innovación",
        ],
        frustrations: [
            "Dificultad para encontrar desarrolladores senior confiables",
            "No entiende completamente el proceso de desarrollo técnico",
            "Problemas de comunicación entre el equipo técnico y el negocio",
            "Necesita escalar rápidamente pero no sabe cómo estructurar el equipo",
        ],
        desires: [
            "Tener un equipo técnico que entregue valor consistentemente",
            "Entender métricas y KPIs técnicos relevantes",
            "Construir procesos que permitan escalar sin perder calidad",
            "Crear una ventaja competitiva a través de la tecnología",
        ],
        knowledgeLevel: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

