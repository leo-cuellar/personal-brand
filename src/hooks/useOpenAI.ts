"use client";

import { useState, useCallback } from "react";
import {
    generateCategoryDescription,
    GenerateCategoryDescriptionParams,
} from "@/services/api-wrapper/openai";

interface UseOpenAIReturn {
    generateCategoryDescription: (
        params: GenerateCategoryDescriptionParams
    ) => Promise<string>;
    loading: boolean;
    error: string | null;
}

export function useOpenAI(): UseOpenAIReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCategoryDescription = useCallback(
        async (params: GenerateCategoryDescriptionParams): Promise<string> => {
            try {
                setLoading(true);
                setError(null);
                const description = await generateCategoryDescription(params);
                return description;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to generate category description";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        generateCategoryDescription: handleGenerateCategoryDescription,
        loading,
        error,
    };
}

