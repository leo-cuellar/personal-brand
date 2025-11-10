import { randomUUID } from "crypto";
import { PublicationCategory } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockPublicationCategories: PublicationCategory[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Tecnología, automatización e inteligencia aplicada",
        description: "Explora cómo la inteligencia artificial, la automatización y la ingeniería de software están transformando la forma en que las empresas operan, escalan y toman decisiones. Desde la adopción de herramientas inteligentes hasta la integración de flujos humanos y automatizados, esta categoría cubre todo lo relacionado con la aplicación estratégica de la tecnología en contextos empresariales. Incluye casos reales, mejores prácticas y análisis sobre el impacto económico y operativo de la innovación tecnológica.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: true,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Talento, carrera y mentalidad tech",
        description: "Aborda la evolución profesional de los desarrolladores en la era de la automatización y la IA. Esta categoría se centra en cómo los profesionales técnicos pueden adaptarse, destacar y liderar en un entorno cambiante. Incluye temas de crecimiento profesional, nuevas competencias, salarios, oportunidades internacionales y mentalidad estratégica para construir carreras sostenibles más allá del código.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: true,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Intersección talento–empresa",
        description: "Analiza el punto donde convergen el talento técnico y la visión empresarial. Esta categoría busca mostrar cómo developers y compañías pueden crear sinergias reales para innovar, optimizar procesos y generar valor. Incluye perspectivas sobre contratación estratégica, modelos de nearshoring basados en innovación, colaboración humano–IA y el rol del talento latinoamericano en la transformación tecnológica global.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: true,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Cultura tecnológica y liderazgo moderno",
        description: "Explora cómo la tecnología está redefiniendo la cultura organizacional, los estilos de liderazgo y la gestión de equipos. Esta categoría aborda los desafíos y oportunidades de liderar en la era digital: equipos distribuidos, adopción de IA, mentalidad ágil y desarrollo de líderes técnicos con visión estratégica. Incluye reflexiones sobre cómo escalar talento, confianza y cultura junto con la tecnología.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: true,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Estrategia, mercado y visión del futuro",
        description: "Ofrece una mirada analítica y prospectiva sobre las tendencias que están moldeando el futuro de la tecnología, el talento y los negocios. Desde la evolución de la IA y el trabajo global hasta los nuevos modelos de negocio impulsados por datos y automatización. Esta categoría conecta lo que está pasando hoy con lo que viene después, ayudando a anticipar oportunidades y riesgos en el panorama tecnológico y empresarial.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: true,
    },
];
