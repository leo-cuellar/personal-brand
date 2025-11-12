import { perplexity } from "./client";

export interface TrendSearchResult {
    title: string;
    url: string;
    snippet: string;
    date?: string;
    lastUpdated?: string;
}

export interface TrendSearchResponse {
    results: TrendSearchResult[];
    query: string;
}

/**
 * Search for trends using Perplexity's sonar model
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 10)
 * @returns Search results with trends/news
 */
export async function searchTrends(
    query: string,
    maxResults: number = 10
): Promise<TrendSearchResponse> {
    if (!query || query.trim().length === 0) {
        throw new Error("Search query cannot be empty");
    }

    try {
        const search = await perplexity.search.create({
            query: query,
            max_results: maxResults,
        });

        const results: TrendSearchResult[] = search.results.map((result) => ({
            title: result.title || "",
            url: result.url || "",
            snippet: result.snippet || "",
            date: result.date || undefined,
            lastUpdated: result.last_updated || undefined,
        }));

        return {
            results,
            query,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Perplexity search failed: ${error.message}`);
        }
        throw new Error("Perplexity search failed: Unknown error");
    }
}

