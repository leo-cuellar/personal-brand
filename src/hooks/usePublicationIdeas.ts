"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getPublicationIdeas,
    createPublicationIdea,
    updatePublicationIdea,
    deletePublicationIdea,
    GetPublicationIdeasParams,
} from "@/services/api-wrapper/publication-ideas";
import { PublicationIdea, NewPublicationIdea } from "@/services/supabase/schemas";

interface UsePublicationIdeasReturn {
    publicationIdeas: PublicationIdea[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPublicationIdea) => Promise<PublicationIdea>;
    update: (id: string, updates: Partial<PublicationIdea>) => Promise<PublicationIdea>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationIdeas(
    params?: GetPublicationIdeasParams
): UsePublicationIdeasReturn {
    const [publicationIdeas, setPublicationIdeas] = useState<PublicationIdea[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationIdeas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublicationIdeas(params);
            setPublicationIdeas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchPublicationIdeas();
    }, [fetchPublicationIdeas]);

    const create = useCallback(
        async (data: NewPublicationIdea): Promise<PublicationIdea> => {
            try {
                setError(null);
                const newPublicationIdea = await createPublicationIdea(data);
                setPublicationIdeas((prev) => [newPublicationIdea, ...prev]);
                return newPublicationIdea;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication idea";
                setError(errorMessage);
                await fetchPublicationIdeas();
                throw err;
            }
        },
        [fetchPublicationIdeas]
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
                await fetchPublicationIdeas();
                throw err;
            }
        },
        [fetchPublicationIdeas]
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
                await fetchPublicationIdeas();
                throw err;
            }
        },
        [fetchPublicationIdeas]
    );

    return {
        publicationIdeas,
        loading,
        error,
        refetch: fetchPublicationIdeas,
        create,
        update,
        remove,
    };
}

