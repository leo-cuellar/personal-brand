"use client";

import { useState, useCallback } from "react";
import {
    idGenTrendScanner,
    idGenContext,
    publicationGen,
    N8nResponse,
} from "../../services/api-wrapper/n8n";

interface UseN8nHooksReturn {
    idGenTrendScanner: () => Promise<N8nResponse>;
    idGenContext: () => Promise<N8nResponse>;
    publicationGen: () => Promise<N8nResponse>;
    loading: boolean;
    error: string | null;
}

export function useN8nHooks(): UseN8nHooksReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runIdGenTrendScanner = useCallback(async (): Promise<N8nResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await idGenTrendScanner();
            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to run id gen trend scanner";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const runIdGenContext = useCallback(async (): Promise<N8nResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await idGenContext();
            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to run id gen context";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const runPublicationGen = useCallback(async (): Promise<N8nResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await publicationGen();
            return result;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to run publication gen";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        idGenTrendScanner: runIdGenTrendScanner,
        idGenContext: runIdGenContext,
        publicationGen: runPublicationGen,
        loading,
        error,
    };
}

