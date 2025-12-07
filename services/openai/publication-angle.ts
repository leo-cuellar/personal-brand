import { openai } from "./client";

export interface GeneratePublicationAngleParams {
    idea: {
        title: string;
        description: string | null;
    };
    readerPersona: {
        name: string;
        description: string | null;
        goals: string[];
        frustrations: string[];
        desires: string[];
    };
    brandContext: {
        niche: string | null;
        brand_narrative: unknown;
        strong_opinions: string[];
        values: string[];
    };
}

export interface PublicationAngle {
    argument: string;
    method: string;
    strategic_relevance: string;
}

export async function generatePublicationAngle(
    params: GeneratePublicationAngleParams
): Promise<PublicationAngle> {
    const { idea, readerPersona, brandContext } = params;

    const systemPrompt = `Eres un asistente especializado en definir ángulos estratégicos para publicaciones de marca personal.

Vas a recibir tres entradas:

	1.	idea: objeto con la idea central de la publicación
{ "title": "...", "description": "..." }

	2.	reader_persona: objeto que describe al lector objetivo
{ "name": "...", "description": "...", "goals": [...], "frustrations": [...], "desires": [...] }

	3.	brand_context: objeto con información relevante de la marca personal
{ "niche": "...", "brand_narrative": {...}, "strong_opinions": [...], "values": [...] }

TU TAREA

Analizar estos tres elementos y definir UN SOLO ÁNGULO DE PUBLICACIÓN que:

	•	Respete la intención de la idea.
	•	Esté claramente orientado al reader_persona descrito.
	•	Refuerce el posicionamiento y objetivos estratégicos del brand_context.

Un "ángulo" es el enfoque conceptual desde el cual se va a escribir la publicación.
No es el borrador del post ni su estructura; es la tesis + enfoque que guiarán todo.

FORMATO DE SALIDA (OBLIGATORIO)

Devuelve SIEMPRE un único objeto JSON con exactamente esta forma:

{
"argument": "Declaración clara del punto central que la publicación demostrará o desarrollará.",
"method": "Explicación breve del enfoque lógico o narrativo que se utilizará para desarrollar el argumento.",
"strategic_relevance": "Razón objetiva por la cual este ángulo es valioso para la estrategia de la marca personal y para la audiencia objetivo."
}

INSTRUCCIONES

	1.	De la idea:
	•	Identifica el problema, tensión, oportunidad, insight o enseñanza principal.
	•	Determina qué aspecto tiene más potencial para desarrollarse en una publicación sólida.

	2.	Del reader_persona:
	•	Detecta qué necesita entender, cuestionar, decidir o mejorar.
	•	Elige el enfoque que le aporte mayor claridad, utilidad o cambio de perspectiva.

	3.	Del brand_context:
	•	Asegúrate de que el ángulo refuerza el posicionamiento, la autoridad y los objetivos de la marca.
	•	Respeta límites de temas, tono y líneas rojas definidos en el contexto.

	4.	Construye el ángulo:
	•	"argument": formula la tesis principal en una sola declaración clara.
	•	"method": explica en 1–2 frases cómo se desarrollaría esa tesis (contraste, ejemplo real, explicación causal, marco mental, etc.).
	•	"strategic_relevance": explica por qué este ángulo ayuda a la marca a posicionarse y por qué es valioso para este lector.

RESTRICCIONES

	•	No generes borradores de publicaciones.
	•	No generes títulos de post, listas de puntos ni estructuras narrativas.
	•	No añadas texto fuera del objeto JSON requerido.
	•	No inventes datos externos: usa únicamente lo que se deduce lógicamente de idea, reader_persona y brand_context.
	•	Mantén el lenguaje preciso, concreto y orientado a decisión estratégica.`;

    const userPrompt = `idea:
${JSON.stringify(idea, null, 2)}

reader_persona:
${JSON.stringify(readerPersona, null, 2)}

brand_context:
${JSON.stringify(brandContext, null, 2)}

Devuelve ÚNICAMENTE el objeto JSON con el formato especificado, sin texto adicional antes o después.`;

    // JSON Schema for structured output
    const jsonSchema = {
        type: "object",
        properties: {
            argument: {
                type: "string",
                description: "Declaración clara del punto central que la publicación demostrará o desarrollará.",
            },
            method: {
                type: "string",
                description: "Explicación breve del enfoque lógico o narrativo que se utilizará para desarrollar el argumento.",
            },
            strategic_relevance: {
                type: "string",
                description: "Razón objetiva por la cual este ángulo es valioso para la estrategia de la marca personal y para la audiencia objetivo.",
            },
        },
        required: ["argument", "method", "strategic_relevance"],
        additionalProperties: false,
    } as const;

    const completion = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "publication_angle",
                strict: true,
                schema: jsonSchema,
            },
        },
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
        throw new Error("Failed to generate publication angle");
    }

    try {
        const parsed = JSON.parse(responseText) as PublicationAngle;
        return parsed;
    } catch (error) {
        throw new Error(`Failed to parse publication angle response: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
