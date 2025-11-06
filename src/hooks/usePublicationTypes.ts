"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getPublicationTypes,
    createPublicationType,
    updatePublicationType,
    deletePublicationType,
    GetPublicationTypesParams,
} from "@/services/api-wrapper/publication-types";
import { PublicationType, NewPublicationType } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

interface UsePublicationTypesReturn {
    publicationTypes: PublicationType[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPublicationType) => Promise<PublicationType>;
    update: (id: string, updates: Partial<PublicationType>) => Promise<PublicationType>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationTypes(
    params?: GetPublicationTypesParams
): UsePublicationTypesReturn {
    const { selectedPersonId } = usePersonContext();
    const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Merge personId from context with params
    const mergedParams = useMemo(() => {
        return {
            ...params,
            personId: params?.personId !== undefined ? params.personId : selectedPersonId,
        };
    }, [params, selectedPersonId]);

    const fetchPublicationTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublicationTypes(mergedParams);
            setPublicationTypes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [mergedParams]);

    useEffect(() => {
        fetchPublicationTypes();
    }, [fetchPublicationTypes]);

    const create = useCallback(
        async (data: NewPublicationType): Promise<PublicationType> => {
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
                const newPublicationType = await createPublicationType(dataWithPersonId);
                // Optimistic update: add to list immediately
                setPublicationTypes((prev) => [newPublicationType, ...prev]);
                return newPublicationType;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication type";
                setError(errorMessage);
                // Refetch on error to ensure consistency
                await fetchPublicationTypes();
                throw err;
            }
        },
        [fetchPublicationTypes, selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationType>
        ): Promise<PublicationType> => {
            try {
                setError(null);
                const updatedPublicationType = await updatePublicationType(id, updates);
                // Optimistic update: update in list immediately
                setPublicationTypes((prev) =>
                    prev.map((type) =>
                        type.id === id ? updatedPublicationType : type
                    )
                );
                return updatedPublicationType;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication type";
                setError(errorMessage);
                // Refetch on error to ensure consistency
                await fetchPublicationTypes();
                throw err;
            }
        },
        [fetchPublicationTypes]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                // Optimistic update: remove from list immediately
                setPublicationTypes((prev) => prev.filter((type) => type.id !== id));
                await deletePublicationType(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication type";
                setError(errorMessage);
                // Refetch on error to restore correct state
                await fetchPublicationTypes();
                throw err;
            }
        },
        [fetchPublicationTypes]
    );

    return {
        publicationTypes,
        loading,
        error,
        refetch: fetchPublicationTypes,
        create,
        update,
        remove,
    };
}

