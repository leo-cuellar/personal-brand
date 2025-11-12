/**
 * Perplexity API Wrapper
 * Wraps calls to our internal API routes for Perplexity
 */

import type {
    TrendSearchResponse,
} from "../perplexity/search";
import type { TrendItem } from "../perplexity/trends";

export interface SearchTrendsParams {
    query: string;
    maxResults?: number;
}

export interface SearchTrendsByCategoryParams {
    personalBrandId: string;
}

export interface CategoryTrendsResult {
    categoryId: string;
    categoryName: string;
    trends: TrendItem[];
    error?: string;
}

export interface TrendsByCategoryResponse {
    results: CategoryTrendsResult[];
    message?: string;
}

/**
 * Search for trends using Perplexity (legacy search API)
 */
export async function searchTrends(
    params: SearchTrendsParams
): Promise<TrendSearchResponse> {
    const { query, maxResults } = params;

    if (!query || query.trim().length === 0) {
        throw new Error("Query is required");
    }

    const response = await fetch("/api/perplexity/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query,
            maxResults: maxResults || 10,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search trends");
    }

    const data: TrendSearchResponse = await response.json();
    return data;
}

/**
 * Search for trends by publication categories using Perplexity
 */
export async function searchTrendsByCategory(
    params: SearchTrendsByCategoryParams
): Promise<TrendsByCategoryResponse> {
    const { personalBrandId } = params;

    if (!personalBrandId || personalBrandId.trim().length === 0) {
        throw new Error("personalBrandId is required");
    }

    const response = await fetch("/api/perplexity/trends", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            personalBrandId,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search trends by category");
    }

    const data: TrendsByCategoryResponse = await response.json();
    return data;
}

