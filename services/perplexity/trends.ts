import { perplexity } from "./client";

export interface TrendItem {
    short_title: string;
    short_summary: string;
    source_url: string;
}

export interface TrendsResponse {
    trends: TrendItem[];
}

/**
 * Search for trends based on a publication category using Perplexity's sonar model
 * @param categoryName - Name of the publication category
 * @param categoryDescription - Description of the publication category
 * @returns Trends in the specified format (2-4 trends based on relevance)
 */
export async function searchTrendsByCategory(
    categoryName: string,
    categoryDescription: string
): Promise<TrendsResponse> {
    if (!categoryName || categoryName.trim().length === 0) {
        throw new Error("Category name cannot be empty");
    }

    const prompt = `Eres un curador de noticias y contenido en tiempo real enfocado en desarrollos recientes y específicos.
Busca entre 2 y 4 noticias, anuncios y conversaciones virales más relevantes de las últimas 24 horas relacionadas con el siguiente tema:

DESCRIPCIÓN:
${categoryName}
${categoryDescription}

REQUISITOS CRÍTICOS:
- Devuelve ÚNICAMENTE noticias, anuncios o desarrollos concretos.
- Centrate en noticias relevantes de Mexico y Estados Unidos.
- NO devuelvas artículos de opinión sobre tendencias.
- Cada elemento debe ser un desarrollo específico y delimitado en el tiempo, no una observación general de tendencia.
- Prioriza:
	1.	Noticias de última hora y anuncios
	2.	Lanzamientos de productos o funcionalidades
	3.	Cambios en políticas o regulaciones
	4.	Comunicados empresariales o del sector
	5.	Investigaciones o hallazgos académicos
	6.	Conversaciones virales o movimientos relevantes en redes sociales
	7.	Listas de tendencias recientes
- Excluye:
    - Artículos genéricos de "principales tendencias"
	- Artículos de predicciones sobre tendencias
	- Opiniones o análisis sobre tendencias generales
	- Recopilaciones o resúmenes genéricos ("roundups")
	- Meta-análisis de tendencias
    
Formato de salida
- Entrega la salida en un arreglo JSON llamado "trends" con exactamente estos campos:
	- short_title: título conciso de la noticia o desarrollo específico (máx. 80 caracteres)
	- short_summary: resumen breve del desarrollo específico (2–3 oraciones)
	- source_url: URL directa a la fuente o noticia original
- No generes salida en formato markdown.`;

    try {
        const completion = await perplexity.chat.completions.create({
            model: "sonar",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "trends_response",
                    description: "Response containing an array of trends",
                    schema: {
                        type: "object",
                        properties: {
                            trends: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        short_title: {
                                            type: "string",
                                            description: "Concise title of the news or specific development (max 80 characters)",
                                        },
                                        short_summary: {
                                            type: "string",
                                            description: "Brief summary of the specific development (2-3 sentences)",
                                        },
                                        source_url: {
                                            type: "string",
                                            description: "Direct URL to the original source or news",
                                        },
                                    },
                                    required: ["short_title", "short_summary", "source_url"],
                                },
                            },
                        },
                        required: ["trends"],
                    },
                    strict: true,
                },
            },
            search_recency_filter: "day",
            country: "MX",
        });

        // Extract content from the first choice
        const rawContent = completion.choices?.[0]?.message?.content;
        if (!rawContent) {
            throw new Error("No content returned from Perplexity");
        }

        // Handle content that can be string or array
        let content: string;
        if (typeof rawContent === "string") {
            content = rawContent;
        } else if (Array.isArray(rawContent)) {
            // Extract text from content chunks
            content = rawContent
                .filter((chunk) => chunk.type === "text")
                .map((chunk) => (chunk as { text: string }).text)
                .join("");
        } else {
            throw new Error("Unexpected content format from Perplexity");
        }

        if (!content) {
            throw new Error("No text content found in Perplexity response");
        }

        // Parse the JSON response
        let parsed: TrendsResponse;
        try {
            parsed = JSON.parse(content);
        } catch {
            // Sometimes the response might have markdown code blocks
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1]);
            } else {
                throw new Error("Failed to parse JSON response from Perplexity");
            }
        }

        // Validate the response structure
        if (!parsed.trends || !Array.isArray(parsed.trends)) {
            throw new Error("Invalid response format: trends array not found");
        }

        return parsed;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Perplexity trends search failed: ${error.message}`);
        }
        throw new Error("Perplexity trends search failed: Unknown error");
    }
}

