"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getStrongOpinions,
    createStrongOpinion,
    updateStrongOpinion,
    deleteStrongOpinion,
    GetStrongOpinionsParams,
} from "@/services/api-wrapper/strong-opinions";
import { StrongOpinion, NewStrongOpinion } from "@/services/supabase/schemas";

interface UseStrongOpinionsReturn {
    strongOpinions: StrongOpinion[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewStrongOpinion) => Promise<StrongOpinion>;
    update: (id: string, updates: Partial<StrongOpinion>) => Promise<StrongOpinion>;
    remove: (id: string) => Promise<void>;
}

export function useStrongOpinions(
    params?: GetStrongOpinionsParams
): UseStrongOpinionsReturn {
    const [strongOpinions, setStrongOpinions] = useState<StrongOpinion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStrongOpinions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStrongOpinions(params);
            setStrongOpinions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchStrongOpinions();
    }, [fetchStrongOpinions]);

    const create = useCallback(
        async (data: NewStrongOpinion): Promise<StrongOpinion> => {
            try {
                setError(null);
                const newStrongOpinion = await createStrongOpinion(data);
                setStrongOpinions((prev) => [newStrongOpinion, ...prev]);
                return newStrongOpinion;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create strong opinion";
                setError(errorMessage);
                await fetchStrongOpinions();
                throw err;
            }
        },
        [fetchStrongOpinions]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<StrongOpinion>
        ): Promise<StrongOpinion> => {
            try {
                setError(null);
                const updatedStrongOpinion = await updateStrongOpinion(id, updates);
                setStrongOpinions((prev) =>
                    prev.map((opinion) =>
                        opinion.id === id ? updatedStrongOpinion : opinion
                    )
                );
                return updatedStrongOpinion;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update strong opinion";
                setError(errorMessage);
                await fetchStrongOpinions();
                throw err;
            }
        },
        [fetchStrongOpinions]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setStrongOpinions((prev) => prev.filter((opinion) => opinion.id !== id));
                await deleteStrongOpinion(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete strong opinion";
                setError(errorMessage);
                await fetchStrongOpinions();
                throw err;
            }
        },
        [fetchStrongOpinions]
    );

    return {
        strongOpinions,
        loading,
        error,
        refetch: fetchStrongOpinions,
        create,
        update,
        remove,
    };
}

