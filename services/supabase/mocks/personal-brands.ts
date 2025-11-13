import { PersonalBrand } from "../schemas";

// Export the first personal brand's ID so we can use it in other mocks
export const MOCK_PERSON_ID = "00000000-0000-0000-0000-000000000001";
export const MOCK_PERSONAL_BRAND_ID = MOCK_PERSON_ID; // Alias for clarity

export const mockPersons: PersonalBrand[] = [
    {
        id: MOCK_PERSON_ID as unknown as string,
        name: "Leo Cuellar",
        username: "leocuellardev",
        socialAccounts: {
            linkedin: {
                profile_url: "https://linkedin.com/in/leocuellardev",
                profile_name: "leocuellardev",
            },
        },
        brandNarrative: {
            immediateCredibility:
                "He trabajado en empresas de tecnología que operan a nivel internacional, formando parte de equipos de alto rendimiento y liderando iniciativas clave. Llevo más de una década construyendo productos desde el front-end, explorando también tecnologías como IA, blockchain y herramientas financieras. Mis roles han tenido impacto directo en negocio, estrategia y crecimiento. También he generado ingresos de seis cifras anuales en tech, construyendo todo esto desde un camino no tradicional, pero deliberado.",
            professionalProblemOrChallenge:
                "Después de cinco años en una carrera completamente distinta, tomé la decisión más difícil: dejarla atrás. No sabía qué venía después. Solo sabía que lo que estaba haciendo no me hacía sentir vivo. Me gustaba programar, ya había hecho algunos proyectos sencillos, pero no entendía cómo convertirlo en una carrera real. Lo único claro era que necesitaba construir algo propio, algo que tuviera sentido para mí.",
            internalStruggles:
                "Aunque era joven, sentía que ya había desperdiciado demasiado tiempo. Viví una etapa de confusión, frustración y aislamiento. Me invadía la duda sobre si podría construir algo valioso empezando tan tarde. El síndrome del impostor me acompañó por años: sentía que avanzaba, pero que todo era frágil, que no estaba realmente validado.",
            externalContext:
                "Tuve que reconstruirme desde cero, en lo profesional y en lo personal. Perdí todo lo que tenía, me endeudé, me estafaron, y regresé a casa de mi madre. Al mismo tiempo, veía una industria tech que parecía cerrada, elitista, reservada para quienes tenían títulos, conexiones y caminos \"correctos\". Todo en mi entorno gritaba que yo no pertenecía. No me senti rechazado asi que no enfocarse en el elitismo sino en no seguir el molde.",
            keyMicrotransitions:
                "Pasé de explorar la programación como curiosidad a construir soluciones reales. De estudiar por mi cuenta a conseguir trabajo. De desarrollador a líder de equipo. De empleado a emprendedor. Fallé al emprender más de una vez, pero cada intento me enseñó algo sobre enfoque, constancia y visión. Cada decisión, incluso las que no funcionaron, fue parte de convertirme en lo que soy hoy.",
            insightOrSpark:
                "Descubrí que podía construir. No solo una carrera, sino ideas, productos y soluciones que tenían valor. Que no necesitaba seguir el camino tradicional si estaba dispuesto a pagar el precio del trabajo, el aprendizaje y la resistencia. Que a veces, romper las reglas es el primer paso para crear algo realmente tuyo.",
            process:
                "Diseñé mi propia ruta. Aprendí por mi cuenta, construí un portafolio, mejoré cada sistema de aprendizaje que usaba. Con el tiempo, obtuve trabajos reales, entregué resultados, y empecé a liderar personas. Me equivoqué muchas veces, pero nunca dejé de iterar. Lo que empezó como supervivencia se convirtió en carrera, luego en propósito.",
            resultOrTransformation:
                "Hoy tengo una carrera sólida, con más de 10 años de experiencia. He trabajado en productos con miles de usuarios, liderado equipos técnicos y contribuido a soluciones de alto impacto para empresas globales. Sigo aprendiendo, creando y compartiendo, porque sé que el cambio no viene solo de lo técnico: viene de cómo pensamos, cómo actuamos y cómo lideramos.",
            sharedBeliefs:
                "Creo que hay miles de desarrolladores en LATAM con talento brutal, atrapados en un sistema que no los ve. Que siguen esperando validación externa cuando ya tienen lo necesario. Creo que no basta con saber programar: hay que pensar más allá del código, entender el juego y aprender a jugarlo con inteligencia, sin perder la esencia.",
            currentVisionOrPersonalMission:
                "Quiero ayudar a los desarrolladores en LATAM —sobre todo a los que trabajan en front-end y sienten que están estancados— a reconocerse como estrategas, constructores y líderes. A desbloquear su valor, construir una carrera que les represente y reclamar su lugar en la industria global.",
            socialProofOrValidation:
                "He formado parte de equipos técnicos de alto impacto, construido productos usados globalmente y liderado desarrolladores que hoy están en roles clave. No lo hice desde un camino tradicional. Lo hice a mi manera, con estrategia, intención y disciplina. Y hoy, comparto lo que aprendí para que otros también lo hagan.",
            callToAction:
                "Si alguna vez pensaste que ibas tarde, que no tienes lo que se necesita, o que no sabes cómo dar el siguiente paso… estoy construyendo para ti.",
        },
        strongOpinions: [
            "Remote work isn't just a trend—it's the future of how we'll work. Companies that don't adapt will lose top talent.",
            "AI won't replace humans, but humans who use AI will replace those who don't. The question isn't if, but when you'll adapt.",
            "The 40-hour work week is dead. Productivity isn't about hours logged—it's about results delivered. Time to rethink how we measure work.",
            "If you're not building your personal brand online, you're invisible. Your next opportunity won't find you—you need to make yourself findable.",
            "Networking isn't about collecting contacts—it's about building genuine relationships. Quality over quantity, always.",
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

