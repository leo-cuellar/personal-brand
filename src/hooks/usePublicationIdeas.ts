"use client";

import { useState, useCallback } from "react";
import {
    getPublicationIdeas,
    createPublicationIdea,
    updatePublicationIdea,
    deletePublicationIdea,
    GetPublicationIdeasParams,
} from "../../services/api-wrapper/publication-ideas";
import { PublicationIdea, NewPublicationIdea } from "../../services/supabase/schemas";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";

interface UsePublicationIdeasReturn {
    publicationIdeas: PublicationIdea[];
    loading: boolean;
    error: string | null;
    getPublicationIdeas: (params?: GetPublicationIdeasParams) => Promise<void>;
    create: (data: NewPublicationIdea) => Promise<PublicationIdea>;
    update: (id: string, updates: Partial<PublicationIdea>) => Promise<PublicationIdea>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationIdeas(): UsePublicationIdeasReturn {
    const { selectedPersonId } = usePersonalBrandContext();
    const [publicationIdeas, setPublicationIdeas] = useState<PublicationIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationIdeas = useCallback(async (params?: GetPublicationIdeasParams) => {
        try {
            setLoading(true);
            setError(null);
            // Merge personalBrandId from context with params
            const mergedParams = {
                ...params,
                personalBrandId: params?.personalBrandId !== undefined ? params.personalBrandId : selectedPersonId,
            };
            const data = await getPublicationIdeas(mergedParams);
            setPublicationIdeas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedPersonId]);

    const create = useCallback(
        async (data: NewPublicationIdea): Promise<PublicationIdea> => {
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
                const newPublicationIdea = await createPublicationIdea(dataWithPersonalBrandId);
                setPublicationIdeas((prev) => [newPublicationIdea, ...prev]);
                return newPublicationIdea;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication idea";
                setError(errorMessage);
                throw err;
            }
        },
        [selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationIdea>
        ): Promise<PublicationIdea> => {
            try {
                setError(null);
                const updatedPublicationIdea = await updatePublicationIdea(id, updates);
                setPublicationIdeas((prev) =>
                    prev.map((idea) =>
                        idea.id === id ? updatedPublicationIdea : idea
                    )
                );
                return updatedPublicationIdea;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication idea";
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
                setPublicationIdeas((prev) => prev.filter((idea) => idea.id !== id));
                await deletePublicationIdea(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication idea";
                setError(errorMessage);
                throw err;
            }
        },
        []
    );

    return {
        publicationIdeas,
        loading,
        error,
        getPublicationIdeas: fetchPublicationIdeas,
        create,
        update,
        remove,
    };
}
