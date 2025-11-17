import { PersonalBrand } from "../schemas";

// Export the first personal brand's ID so we can use it in other mocks
export const MOCK_PERSON_ID = "00000000-0000-0000-0000-000000000001";
export const MOCK_PERSONAL_BRAND_ID = MOCK_PERSON_ID; // Alias for clarity

export const mockPersons: PersonalBrand[] = [
    {
        id: MOCK_PERSON_ID as unknown as string,
        name: "Leo Cuellar",
        username: "leocuellardev",
        niche: "Ayudo a desarrolladores (juniors y seniors) y CEOs a construir carreras exitosas, escalar equipos técnicos y crear productos de alto impacto",
        socialAccounts: {
            linkedin: {
                profile_url: "https://linkedin.com/in/leocuellardev",
                profile_name: "leocuellardev",
            },
        },
        brandNarrative: {
            immediateCredibility:
                "He liderado equipos técnicos en empresas de tecnología que operan a nivel internacional, escalando productos desde cero hasta millones de usuarios. Con más de una década de experiencia, he construido equipos de alto rendimiento, establecido procesos de desarrollo que realmente funcionan, ayudado a fundadores y CEOs a transformar ideas en productos exitosos, y guiado a desarrolladores junior en sus primeros pasos hacia carreras exitosas. He visto de primera mano qué funciona y qué no cuando se trata de construir carreras, equipos y escalar tecnología.",
            professionalProblemOrChallenge:
                "Empecé como desarrollador junior sin saber cómo construir una carrera real. Luego, después de años como desarrollador individual, llegué a un punto donde quería más impacto. Sabía que podía construir código, pero construir equipos, procesos y cultura técnica era completamente diferente. Los fundadores y CEOs con los que trabajaba necesitaban alguien que entendiera tanto el lado técnico como el de negocio, pero la mayoría de líderes técnicos solo hablaban código. Y los desarrolladores junior necesitaban guía para no cometer los mismos errores que yo cometí. Necesitaba convertirme en ese puente para todos.",
            internalStruggles:
                "Como junior, el síndrome del impostor me acompañó por años: ¿realmente sabía lo suficiente? ¿Era lo suficientemente bueno? Luego, cuando lideré un equipo técnico por primera vez, fue abrumador. No solo tenía que escribir código, sino tomar decisiones que afectaban a otros, comunicar visión técnica a no-técnicos, y balancear velocidad con calidad. El síndrome del impostor volvió: ¿realmente sabía lo suficiente para liderar? ¿Podría escalar sin romper lo que funcionaba?",
            externalContext:
                "Veía desarrolladores junior perdidos, sin saber cómo avanzar en sus carreras o qué tecnologías aprender. Startups fallando porque no entendían cómo construir equipos técnicos. CEOs contratando desarrolladores sin saber qué buscar. Fundadores técnicos que no sabían cómo comunicar su visión. Y desarrolladores senior que querían liderar pero no sabían cómo hacer la transición. El mercado necesitaba guía para juniors, líderes técnicos que pudieran escalar equipos y productos, y CEOs que entendieran tecnología, pero había muy pocos recursos.",
            keyMicrotransitions:
                "Pasé de ser el mejor desarrollador del equipo a ser el que ayudaba a otros a ser mejores. De escribir código todo el día a diseñar arquitecturas y procesos. De resolver problemas técnicos a resolver problemas de equipo. De trabajar solo a construir sistemas que funcionaban sin mí. Cada transición fue incómoda, pero necesaria para escalar.",
            insightOrSpark:
                "Descubrí que el mejor código no es el más elegante, sino el que permite al equipo moverse rápido y con confianza. Que escalar un producto no es solo agregar features, sino construir procesos, cultura y sistemas que permitan crecer sosteniblemente. Que un líder técnico efectivo no es el que más sabe, sino el que mejor comunica, empodera y elimina obstáculos.",
            process:
                "Aprendí liderazgo técnico haciendo. Construí procesos de desarrollo desde cero, establecí estándares de código que realmente se seguían, creé sistemas de comunicación entre equipos técnicos y de negocio. Me equivoqué muchas veces, pero cada error me enseñó algo sobre cómo escalar sin perder calidad ni velocidad.",
            resultOrTransformation:
                "Hoy he ayudado a múltiples startups a escalar sus equipos técnicos de 2 a 20+ desarrolladores. He construido productos que manejan millones de usuarios, establecido procesos que permiten entregar valor consistentemente, y formado líderes técnicos que ahora están haciendo lo mismo. El impacto ya no es solo mi código, sino los equipos y productos que ayudo a construir.",
            sharedBeliefs:
                "Creo que cualquier desarrollador junior puede construir una carrera exitosa si tiene la guía correcta y está dispuesto a aprender. Que los mejores equipos técnicos no son los que tienen los mejores desarrolladores, sino los que tienen los mejores procesos y cultura. Que escalar un producto requiere tanto excelencia técnica como liderazgo efectivo. Que los CEOs y fundadores necesitan líderes técnicos que hablen su idioma y entiendan sus necesidades. Y que cualquier desarrollador senior puede convertirse en ese líder, si está dispuesto a aprender.",
            currentVisionOrPersonalMission:
                "Quiero ayudar a desarrolladores junior a construir carreras sólidas desde el principio, a desarrolladores senior a hacer la transición a liderazgo técnico efectivo, y a CEOs y fundadores a construir equipos técnicos que realmente escalen. A crear el puente entre código y negocio, entre visión y ejecución, entre equipo pequeño y equipo grande, entre junior y senior.",
            socialProofOrValidation:
                "He guiado a desarrolladores junior en sus primeros pasos hacia trabajos internacionales, liderado equipos técnicos en startups que crecieron de 5 a 50 personas, construido productos usados por millones, y ayudado a fundadores a tomar decisiones técnicas que definieron el éxito de sus empresas. No lo hice siguiendo un manual, sino aprendiendo en el camino y compartiendo lo que funcionó.",
            callToAction:
                "Si eres desarrollador junior buscando construir tu carrera, desarrollador senior buscando escalar tu impacto, o CEO buscando construir un equipo técnico que realmente funcione… estoy aquí para ayudarte a hacerlo bien.",
        },
        strongOpinions: [
            "Escalar un equipo técnico no se trata de contratar más desarrolladores—se trata de construir sistemas y procesos que permitan al equipo moverse rápido sin romper cosas.",
            "Los mejores líderes técnicos no son los que escriben más código, sino los que permiten a su equipo escribir mejor código y entregar más valor.",
            "Los CEOs que no entienden los desafíos de su equipo técnico tomarán decisiones que ralentizan el crecimiento. La alfabetización técnica ya no es opcional.",
            "Un desarrollador senior que no puede comunicar conceptos técnicos a stakeholders no técnicos no está listo para liderar. La comunicación es una habilidad fundamental, no algo opcional.",
            "Los procesos existen para servir al equipo, no al revés. Si tu proceso te está ralentizando, es hora de cambiarlo, no de aplicarlo con más fuerza.",
        ],
        values: [
            "Excelencia técnica con impacto de negocio",
            "Liderazgo que empodera y escala",
            "Comunicación clara entre equipos técnicos y de negocio",
            "Procesos que aceleran, no ralentizan",
            "Construir equipos que funcionan sin ti",
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

