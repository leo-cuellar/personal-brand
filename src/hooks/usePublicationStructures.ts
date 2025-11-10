"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getPublicationStructures,
    createPublicationStructure,
    updatePublicationStructure,
    deletePublicationStructure,
    GetPublicationStructuresParams,
} from "@/services/api-wrapper/publication-structures";
import { PublicationStructure, NewPublicationStructure } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

interface UsePublicationStructuresReturn {
    publicationStructures: PublicationStructure[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPublicationStructure) => Promise<PublicationStructure>;
    update: (id: string, updates: Partial<PublicationStructure>) => Promise<PublicationStructure>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationStructures(
    params?: GetPublicationStructuresParams
): UsePublicationStructuresReturn {
    const { selectedPersonId } = usePersonContext();
    const [publicationStructures, setPublicationStructures] = useState<PublicationStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Merge personId from context with params
    const mergedParams = useMemo(() => {
        return {
            ...params,
            personId: params?.personId !== undefined ? params.personId : selectedPersonId,
        };
    }, [params, selectedPersonId]);

    const fetchPublicationStructures = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublicationStructures(mergedParams);
            setPublicationStructures(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [mergedParams]);

    useEffect(() => {
        fetchPublicationStructures();
    }, [fetchPublicationStructures]);

    const create = useCallback(
        async (data: NewPublicationStructure): Promise<PublicationStructure> => {
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
                const newStructure = await createPublicationStructure(dataWithPersonId);
                setPublicationStructures((prev) => [newStructure, ...prev]);
                return newStructure;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication structure";
                setError(errorMessage);
                await fetchPublicationStructures();
                throw err;
            }
        },
        [fetchPublicationStructures, selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationStructure>
        ): Promise<PublicationStructure> => {
            try {
                setError(null);
                const updatedStructure = await updatePublicationStructure(id, updates);
                setPublicationStructures((prev) =>
                    prev.map((structure) =>
                        structure.id === id ? updatedStructure : structure
                    )
                );
                return updatedStructure;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication structure";
                setError(errorMessage);
                await fetchPublicationStructures();
                throw err;
            }
        },
        [fetchPublicationStructures]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setPublicationStructures((prev) => prev.filter((structure) => structure.id !== id));
                await deletePublicationStructure(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication structure";
                setError(errorMessage);
                await fetchPublicationStructures();
                throw err;
            }
        },
        [fetchPublicationStructures]
    );

    return {
        publicationStructures,
        loading,
        error,
        refetch: fetchPublicationStructures,
        create,
        update,
        remove,
    };
}

