"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getPublicationTypes,
    createPublicationType,
    updatePublicationType,
    deletePublicationType,
    GetPublicationTypesParams,
} from "@/services/api-wrapper/publication-types";
import { PublicationType, NewPublicationType } from "@/services/supabase/schemas";

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
    const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPublicationTypes(params);
            setPublicationTypes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchPublicationTypes();
    }, [fetchPublicationTypes]);

    const create = useCallback(
        async (data: NewPublicationType): Promise<PublicationType> => {
            try {
                setError(null);
                const newPublicationType = await createPublicationType(data);
                await fetchPublicationTypes();
                return newPublicationType;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication type";
                setError(errorMessage);
                throw err;
            }
        },
        [fetchPublicationTypes]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationType>
        ): Promise<PublicationType> => {
            try {
                setError(null);
                const updatedPublicationType = await updatePublicationType(id, updates);
                await fetchPublicationTypes();
                return updatedPublicationType;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update publication type";
                setError(errorMessage);
                throw err;
            }
        },
        [fetchPublicationTypes]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                await deletePublicationType(id);
                await fetchPublicationTypes();
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication type";
                setError(errorMessage);
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

