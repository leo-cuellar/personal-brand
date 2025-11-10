"use client";

import { useState, useCallback } from "react";
import { trendScanner, TrendScannerResponse } from "@/services/api-wrapper/n8n";

interface UseN8nHooksReturn {
    trendScanner: () => Promise<TrendScannerResponse>;
    loading: boolean;
    error: string | null;
}

export function useN8nHooks(): UseN8nHooksReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runTrendScanner = useCallback(async (): Promise<TrendScannerResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await trendScanner();
            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to run trend scanner";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        trendScanner: runTrendScanner,
        loading,
        error,
    };
}

