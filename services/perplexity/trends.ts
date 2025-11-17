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

    let prompt = `
Eres un curador experto en tendencias tecnológicas y de negocio.
Tu tarea es identificar SOLO noticias altamente relevantes, verificables y con impacto real.

Busca y selecciona entre 2 y 4 desarrollos ocurridos en las últimas 24 horas
que estén directamente relacionados de forma semántica con:

TEMA:
${categoryName}
${categoryDescription}

REGLAS DE RELEVANCIA (obligatorias):

1. Filtrado semántico
- No uses coincidencias de palabras clave.
- Selecciona SOLO desarrollos que compartan intención, contexto o impacto con el tema.
- Ignora por completo resultados vagos, dudosos o marginales.

2. Ranking por impacto (NO por orden de búsqueda)

Ordena los candidatos según:
	1.	impacto en industria o política,
	2.	magnitud del cambio,
	3.	credibilidad,
	4.	alcance internacional (MX + EE.UU. prioridad),
	5.	novedad real.

3. Validez estricta

Incluye únicamente:
- Noticias confirmadas,
- Comunicados oficiales,
- Investigaciones verificadas,
- Lanzamientos reales.

4. Exclusiones

No incluyas:
- Artículos de opinión,
- Resúmenes genéricos,
- Predicciones,
- Blogs de baja calidad,
- Contenido patrocinado.

Devuelve un JSON estricto, sin markdown.
    `;

    prompt = prompt.trim();

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

