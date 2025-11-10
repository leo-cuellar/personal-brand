import { randomUUID } from "crypto";
import { PublicationStructure } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockPublicationStructures: PublicationStructure[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Insight-Driven Structure",
        description: "A structure that starts with an insight and builds through tension, story, takeaway, and dialogue invitation",
        structure: {
            "Insight / Observación": {
                description: "Comienza con algo que tu audiencia ya ha pensado pero no ha articulado",
                example: "Hay desarrolladores en LATAM que saben React, TypeScript, testing, arquitectura...\n\nY aún así, ganan $1,200 USD al mes o menos.\n\nNo es falta de talento.\n\nEs falta de contexto.",
            },
            "Tensión / Paradoja": {
                description: "Contrasta eso con una creencia limitante o realidad incómoda",
                example: "En México, puedes saber lo mismo que alguien en EE.UU., hacer el mismo trabajo, usar los mismos procesos…\n\nY aun así cobrar 1/4 del sueldo.\n\n¿Por qué?\n\nPorque muchos developers en LATAM no están compitiendo por valor, están compitiendo por precio.",
            },
            "Mini historia / ejemplo real": {
                description: "Refuerza tu punto con una experiencia personal o caso real",
                example: "Hace unos años yo también aceptaba lo que me ofrecieran.\n\nTenía miedo de parecer \"caro\". No sabía negociar. Ni siquiera entendía cómo funcionaba el mercado.\n\nHasta que un día un colega en otro país me dijo cuánto cobraba por un trabajo similar.\n\nEra el doble. Literal.\n\nMismo stack, menos experiencia.\n\nEso me obligó a hacer algo que nunca había hecho:\n\nEstudiar el negocio, entender cómo se vende un perfil, aprender a hablar de impacto, no de herramientas.",
            },
            "Takeaway / Conclusión útil": {
                description: "Qué debería aprender, pensar o cambiar el lector",
                example: "Aquí 3 cosas que cambiaron todo para mí:\n\nInvestigué benchmarks internacionales. Ya no me guié por lo que gana \"un dev en mi ciudad\".\n\nEmpecé a comunicarme con enfoque de negocio. No es \"sé React\", es \"he liderado productos que escalaron a 1M de usuarios\".\n\nAprendí a decir que no. Cuando una oferta no valoraba lo que yo podía aportar, la dejaba pasar.",
            },
            "Invitación al diálogo (CTC)": {
                description: "Cierra con una pregunta o reflexión que realmente quieras discutir",
                example: "Tu talento no es el problema.\n\nTu entorno, tus creencias y tu estrategia sí podrían serlo.\n\n¿Qué fue lo que a ti te hizo abrir los ojos sobre tu valor como developer?",
            },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

