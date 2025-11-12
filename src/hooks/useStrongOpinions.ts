"use client";

import { useState, useCallback } from "react";
import {
    getStrongOpinions,
    createStrongOpinion,
    updateStrongOpinion,
    deleteStrongOpinion,
    GetStrongOpinionsParams,
} from "../../services/api-wrapper/strong-opinions";
import { StrongOpinion, NewStrongOpinion } from "../../services/supabase/schemas";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";

interface UseStrongOpinionsReturn {
    strongOpinions: StrongOpinion[];
    loading: boolean;
    error: string | null;
    getStrongOpinions: (params?: GetStrongOpinionsParams) => Promise<void>;
    create: (data: NewStrongOpinion) => Promise<StrongOpinion>;
    update: (id: string, updates: Partial<StrongOpinion>) => Promise<StrongOpinion>;
    remove: (id: string) => Promise<void>;
}

export function useStrongOpinions(): UseStrongOpinionsReturn {
    const { selectedPersonId } = usePersonalBrandContext();
    const [strongOpinions, setStrongOpinions] = useState<StrongOpinion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStrongOpinions = useCallback(async (params?: GetStrongOpinionsParams) => {
        try {
            setLoading(true);
            setError(null);
            // Merge personalBrandId from context with params
            const mergedParams = {
                ...params,
                personalBrandId: params?.personalBrandId !== undefined ? params.personalBrandId : selectedPersonId,
            };
            const data = await getStrongOpinions(mergedParams);
            setStrongOpinions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedPersonId]);

    const create = useCallback(
        async (data: NewStrongOpinion): Promise<StrongOpinion> => {
            try {
                setError(null);
                // Ensure personalBrandId is set from context if not provided
                const personalBrandId = data.personalBrandId || selectedPersonId;
                if (!personalBrandId) {
                    throw new Error("Personal Brand ID is required. Please select a personal brand first.");
                }
                const dataWithPersonalBrandId = {
                    ...data,
                    personalBrandId,
                };
                const newStrongOpinion = await createStrongOpinion(dataWithPersonalBrandId);
                setStrongOpinions((prev) => [newStrongOpinion, ...prev]);
                return newStrongOpinion;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create strong opinion";
                setError(errorMessage);
                throw err;
            }
        },
        [selectedPersonId]
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
                throw err;
            }
        },
        []
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
                throw err;
            }
        },
        []
    );

    return {
        strongOpinions,
        loading,
        error,
        getStrongOpinions: fetchStrongOpinions,
        create,
        update,
        remove,
    };
}
