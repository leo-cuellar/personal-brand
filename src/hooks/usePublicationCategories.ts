"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getPublicationCategories,
    createPublicationCategory,
    updatePublicationCategory,
    deletePublicationCategory,
    GetPublicationCategoriesParams,
} from "@/services/api-wrapper/publication-categories";
import { PublicationCategory, NewPublicationCategory } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

interface UsePublicationCategoriesReturn {
    publicationCategories: PublicationCategory[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPublicationCategory) => Promise<PublicationCategory>;
    update: (id: string, updates: Partial<PublicationCategory>) => Promise<PublicationCategory>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationCategories(
    params?: GetPublicationCategoriesParams
): UsePublicationCategoriesReturn {
    const { selectedPersonId } = usePersonContext();
    const [publicationCategories, setPublicationCategories] = useState<PublicationCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Merge personId from context with params
    const mergedParams = useMemo(() => {
        return {
            ...params,
            personId: params?.personId !== undefined ? params.personId : selectedPersonId,
        };
    }, [params, selectedPersonId]);

    const fetchPublicationCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublicationCategories(mergedParams);
            setPublicationCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [mergedParams]);

    useEffect(() => {
        fetchPublicationCategories();
    }, [fetchPublicationCategories]);

    const create = useCallback(
        async (data: NewPublicationCategory): Promise<PublicationCategory> => {
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
                const newPublicationCategory = await createPublicationCategory(dataWithPersonId);
                setPublicationCategories((prev) => [newPublicationCategory, ...prev]);
                return newPublicationCategory;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication category";
                setError(errorMessage);
                await fetchPublicationCategories();
                throw err;
            }
        },
        [fetchPublicationCategories, selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationCategory>
        ): Promise<PublicationCategory> => {
            try {
                setError(null);
                const updatedPublicationCategory = await updatePublicationCategory(id, updates);
                setPublicationCategories((prev) =>
                    prev.map((category) =>
                        category.id === id ? updatedPublicationCategory : category
                    )
                );
                return updatedPublicationCategory;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication category";
                setError(errorMessage);
                await fetchPublicationCategories();
                throw err;
            }
        },
        [fetchPublicationCategories]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setPublicationCategories((prev) => prev.filter((category) => category.id !== id));
                await deletePublicationCategory(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication category";
                setError(errorMessage);
                await fetchPublicationCategories();
                throw err;
            }
        },
        [fetchPublicationCategories]
    );

    return {
        publicationCategories,
        loading,
        error,
        refetch: fetchPublicationCategories,
        create,
        update,
        remove,
    };
}

