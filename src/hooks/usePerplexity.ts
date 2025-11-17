"use client";

import { useState, useCallback } from "react";
import {
    searchTrends as searchTrendsWrapper,
    searchTrendsByCategory as searchTrendsByCategoryWrapper,
} from "../../services/api-wrapper/perplexity";
import type { TrendSearchResponse } from "../../services/perplexity/search";
import type { TrendsByCategoryResponse } from "../../services/api-wrapper/perplexity";
import {
    getTrendScannerCache,
    saveTrendScannerCache,
} from "../utils/trend-scanner-cache";

interface UsePerplexityReturn {
    searchTrends: (query: string, maxResults?: number) => Promise<TrendSearchResponse>;
    searchTrendsByCategory: (
        personalBrandId: string
    ) => Promise<TrendsByCategoryResponse>;
    loading: boolean;
    error: string | null;
}

export function usePerplexity(): UsePerplexityReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchTrends = useCallback(
        async (query: string, maxResults: number = 10): Promise<TrendSearchResponse> => {
            setLoading(true);
            setError(null);
            try {
                const result = await searchTrendsWrapper({ query, maxResults });
                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to search trends";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const searchTrendsByCategory = useCallback(
        async (personalBrandId: string): Promise<TrendsByCategoryResponse> => {
            // Verificar cache primero
            const cachedData = getTrendScannerCache(personalBrandId);
            if (cachedData !== null) {
                // Cache válido del día de hoy, retornar sin hacer llamada
                // No activar loading ni error, solo retornar los datos del cache
                return { results: cachedData };
            }

            // No hay cache válido, hacer la llamada
            setLoading(true);
            setError(null);
            try {
                const result = await searchTrendsByCategoryWrapper({
                    personalBrandId,
                });
                // Guardar en cache después de una llamada exitosa
                saveTrendScannerCache(personalBrandId, result.results);
                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to search trends by category";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        searchTrends,
        searchTrendsByCategory,
        loading,
        error,
    };
}

