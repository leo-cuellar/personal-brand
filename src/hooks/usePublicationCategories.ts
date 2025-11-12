"use client";

import { useState, useCallback } from "react";
import {
    getPublicationCategories,
    createPublicationCategory,
    updatePublicationCategory,
    deletePublicationCategory,
    GetPublicationCategoriesParams,
} from "../../services/api-wrapper/publication-categories";
import { PublicationCategory, NewPublicationCategory } from "../../services/supabase/schemas";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";

interface UsePublicationCategoriesReturn {
    publicationCategories: PublicationCategory[];
    loading: boolean;
    error: string | null;
    getPublicationCategories: (params?: GetPublicationCategoriesParams) => Promise<void>;
    create: (data: NewPublicationCategory) => Promise<PublicationCategory>;
    update: (id: string, updates: Partial<PublicationCategory>) => Promise<PublicationCategory>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationCategories(): UsePublicationCategoriesReturn {
    const { selectedPersonId } = usePersonalBrandContext();
    const [publicationCategories, setPublicationCategories] = useState<PublicationCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationCategories = useCallback(async (params?: GetPublicationCategoriesParams) => {
        try {
            setLoading(true);
            setError(null);
            // Merge personalBrandId from context with params
            const mergedParams = {
                ...params,
                personalBrandId: params?.personalBrandId !== undefined ? params.personalBrandId : selectedPersonId,
            };
            const data = await getPublicationCategories(mergedParams);
            setPublicationCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedPersonId]);

    const create = useCallback(
        async (data: NewPublicationCategory): Promise<PublicationCategory> => {
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
                const newPublicationCategory = await createPublicationCategory(dataWithPersonalBrandId);
                setPublicationCategories((prev) => [newPublicationCategory, ...prev]);
                return newPublicationCategory;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication category";
                setError(errorMessage);
                throw err;
            }
        },
        [selectedPersonId]
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
                throw err;
            }
        },
        []
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
                throw err;
            }
        },
        []
    );

    return {
        publicationCategories,
        loading,
        error,
        getPublicationCategories: fetchPublicationCategories,
        create,
        update,
        remove,
    };
}
