import { BuyerPersona } from "../schemas";

export const mockBuyerPersonas: BuyerPersona[] = [
    {
        id: "00000000-0000-0000-0000-000000000010" as unknown as string,
        name: "Desarrollador Frontend Junior",
        description: "Desarrollador con 1-3 años de experiencia buscando crecer en su carrera y conseguir mejores oportunidades laborales.",
        goals: [
            "Conseguir un trabajo remoto en una empresa internacional",
            "Aumentar su salario significativamente",
            "Mejorar sus habilidades técnicas y de comunicación",
            "Construir un portafolio sólido que destaque",
        ],
        frustrations: [
            "Siente que está estancado en su trabajo actual",
            "No sabe cómo destacar entre otros candidatos",
            "Le falta confianza para aplicar a trabajos internacionales",
            "No tiene una red profesional sólida",
        ],
        desires: [
            "Trabajar en proyectos desafiantes y modernos",
            "Tener un mentor que lo guíe en su carrera",
            "Ganar en dólares trabajando desde casa",
            "Ser reconocido por su trabajo y habilidades",
        ],
        knowledgeLevel: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: "00000000-0000-0000-0000-000000000011" as unknown as string,
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
        id: "00000000-0000-0000-0000-000000000012" as unknown as string,
        name: "Estudiante de Programación",
        description: "Estudiante o recién graduado que está aprendiendo desarrollo frontend y busca su primer trabajo.",
        goals: [
            "Conseguir su primer trabajo como desarrollador",
            "Aprender las tecnologías más demandadas",
            "Construir proyectos que demuestren sus habilidades",
            "Entender cómo funciona la industria tech",
        ],
        frustrations: [
            "No sabe por dónde empezar su carrera",
            "Siente que le falta experiencia práctica",
            "No tiene claridad sobre qué tecnologías aprender",
            "Le da miedo aplicar a trabajos sin experiencia",
        ],
        desires: [
            "Encontrar un camino claro hacia su primer trabajo",
            "Aprender de desarrolladores experimentados",
            "Construir un portafolio que lo diferencie",
            "Conectar con otros desarrolladores y oportunidades",
        ],
        knowledgeLevel: "low",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

