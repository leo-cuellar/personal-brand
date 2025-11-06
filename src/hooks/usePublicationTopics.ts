"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getPublicationTopics,
    createPublicationTopic,
    updatePublicationTopic,
    deletePublicationTopic,
    GetPublicationTopicsParams,
} from "@/services/api-wrapper/publication-topics";
import { PublicationTopic, NewPublicationTopic } from "@/services/supabase/schemas";

interface UsePublicationTopicsReturn {
    publicationTopics: PublicationTopic[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPublicationTopic) => Promise<PublicationTopic>;
    update: (id: string, updates: Partial<PublicationTopic>) => Promise<PublicationTopic>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationTopics(
    params?: GetPublicationTopicsParams
): UsePublicationTopicsReturn {
    const [publicationTopics, setPublicationTopics] = useState<PublicationTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationTopics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublicationTopics(params);
            setPublicationTopics(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchPublicationTopics();
    }, [fetchPublicationTopics]);

    const create = useCallback(
        async (data: NewPublicationTopic): Promise<PublicationTopic> => {
            try {
                setError(null);
                const newPublicationTopic = await createPublicationTopic(data);
                setPublicationTopics((prev) => [newPublicationTopic, ...prev]);
                return newPublicationTopic;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication topic";
                setError(errorMessage);
                await fetchPublicationTopics();
                throw err;
            }
        },
        [fetchPublicationTopics]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationTopic>
        ): Promise<PublicationTopic> => {
            try {
                setError(null);
                const updatedPublicationTopic = await updatePublicationTopic(id, updates);
                setPublicationTopics((prev) =>
                    prev.map((topic) =>
                        topic.id === id ? updatedPublicationTopic : topic
                    )
                );
                return updatedPublicationTopic;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication topic";
                setError(errorMessage);
                await fetchPublicationTopics();
                throw err;
            }
        },
        [fetchPublicationTopics]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setPublicationTopics((prev) => prev.filter((topic) => topic.id !== id));
                await deletePublicationTopic(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication topic";
                setError(errorMessage);
                await fetchPublicationTopics();
                throw err;
            }
        },
        [fetchPublicationTopics]
    );

    return {
        publicationTopics,
        loading,
        error,
        refetch: fetchPublicationTopics,
        create,
        update,
        remove,
    };
}

