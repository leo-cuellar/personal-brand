"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getPublications,
    createPublication,
    updatePublication,
    deletePublication,
    GetPublicationsParams,
} from "@/services/api-wrapper/publications";
import { Publication, NewPublication } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

interface UsePublicationsReturn {
    publications: Publication[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPublication) => Promise<Publication>;
    update: (id: string, updates: Partial<Publication>) => Promise<Publication>;
    remove: (id: string) => Promise<void>;
}

export function usePublications(
    params?: GetPublicationsParams
): UsePublicationsReturn {
    const { selectedPersonId } = usePersonContext();
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Merge personId from context with params
    const mergedParams = useMemo(() => {
        return {
            ...params,
            personId: params?.personId !== undefined ? params.personId : selectedPersonId,
        };
    }, [params, selectedPersonId]);

    const fetchPublications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublications(mergedParams);
            setPublications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [mergedParams]);

    useEffect(() => {
        fetchPublications();
    }, [fetchPublications]);

    const create = useCallback(
        async (data: NewPublication): Promise<Publication> => {
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
                const newPublication = await createPublication(dataWithPersonId);
                setPublications((prev) => [newPublication, ...prev]);
                return newPublication;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication";
                setError(errorMessage);
                await fetchPublications();
                throw err;
            }
        },
        [fetchPublications, selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<Publication>
        ): Promise<Publication> => {
            try {
                setError(null);
                const updatedPublication = await updatePublication(id, updates);
                setPublications((prev) =>
                    prev.map((pub) =>
                        pub.id === id ? updatedPublication : pub
                    )
                );
                return updatedPublication;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication";
                setError(errorMessage);
                await fetchPublications();
                throw err;
            }
        },
        [fetchPublications]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setPublications((prev) => prev.filter((pub) => pub.id !== id));
                await deletePublication(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication";
                setError(errorMessage);
                await fetchPublications();
                throw err;
            }
        },
        [fetchPublications]
    );

    return {
        publications,
        loading,
        error,
        refetch: fetchPublications,
        create,
        update,
        remove,
    };
}

