"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getInspirations,
    createInspiration,
    updateInspiration,
    deleteInspiration,
    GetInspirationsParams,
} from "../../services/api-wrapper/inspirations";
import { Inspiration, NewInspiration } from "../../services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

interface UseInspirationsReturn {
    inspirations: Inspiration[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewInspiration) => Promise<Inspiration>;
    update: (id: string, updates: Partial<Inspiration>) => Promise<Inspiration>;
    remove: (id: string) => Promise<void>;
}

export function useInspirations(
    params?: GetInspirationsParams & { autoFetch?: boolean }
): UseInspirationsReturn {
    const { selectedPersonId } = usePersonContext();
    const [inspirations, setInspirations] = useState<Inspiration[]>([]);
    const [loading, setLoading] = useState(params?.autoFetch !== false);
    const [error, setError] = useState<string | null>(null);
    const autoFetch = params?.autoFetch !== false; // Default to true for backward compatibility

    // Merge personId from context with params (excluding autoFetch)
    const fetchParams = useMemo(() => {
        if (!params) return {};
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { autoFetch, ...rest } = params;
        return rest;
    }, [params]);

    const mergedParams = useMemo(() => {
        return {
            ...fetchParams,
            personId: fetchParams?.personId !== undefined ? fetchParams.personId : selectedPersonId,
        };
    }, [fetchParams, selectedPersonId]);

    const fetchInspirations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getInspirations(mergedParams);
            setInspirations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [mergedParams]);

    useEffect(() => {
        if (autoFetch) {
            fetchInspirations();
        }
    }, [autoFetch, fetchInspirations]);

    const create = useCallback(
        async (data: NewInspiration): Promise<Inspiration> => {
            try {
                setError(null);
                // Ensure personId is set from context if not provided
                const personId = data.personId || selectedPersonId;
                if (!personId) {
                    throw new Error("Person ID is required. Please select a person first.");
                }
                const dataWithPersonId = {
                    ...data,
                    personId,
                };
                const newInspiration = await createInspiration(dataWithPersonId);
                setInspirations((prev) => [newInspiration, ...prev]);
                return newInspiration;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create inspiration";
                setError(errorMessage);
                await fetchInspirations();
                throw err;
            }
        },
        [fetchInspirations, selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<Inspiration>
        ): Promise<Inspiration> => {
            try {
                setError(null);
                const updatedInspiration = await updateInspiration(id, updates);
                setInspirations((prev) =>
                    prev.map((inspiration) =>
                        inspiration.id === id ? updatedInspiration : inspiration
                    )
                );
                return updatedInspiration;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update inspiration";
                setError(errorMessage);
                await fetchInspirations();
                throw err;
            }
        },
        [fetchInspirations]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setInspirations((prev) => prev.filter((inspiration) => inspiration.id !== id));
                await deleteInspiration(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete inspiration";
                setError(errorMessage);
                await fetchInspirations();
                throw err;
            }
        },
        [fetchInspirations]
    );

    return {
        inspirations,
        loading,
        error,
        refetch: fetchInspirations,
        create,
        update,
        remove,
    };
}

