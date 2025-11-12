"use client";

import { useState, useCallback } from "react";
import {
    getPublicationTypes,
    createPublicationType,
    updatePublicationType,
    deletePublicationType,
    GetPublicationTypesParams,
} from "../../services/api-wrapper/publication-types";
import { PublicationType, NewPublicationType } from "../../services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

interface UsePublicationTypesReturn {
    publicationTypes: PublicationType[];
    loading: boolean;
    error: string | null;
    getPublicationTypes: (params?: GetPublicationTypesParams) => Promise<void>;
    create: (data: NewPublicationType) => Promise<PublicationType>;
    update: (id: string, updates: Partial<PublicationType>) => Promise<PublicationType>;
    remove: (id: string) => Promise<void>;
}

export function usePublicationTypes(): UsePublicationTypesReturn {
    const { selectedPersonId } = usePersonContext();
    const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationTypes = useCallback(async (params?: GetPublicationTypesParams) => {
        try {
            setLoading(true);
            setError(null);
            // Merge personId from context with params
            const mergedParams = {
                ...params,
                personId: params?.personId !== undefined ? params.personId : selectedPersonId,
            };
            const data = await getPublicationTypes(mergedParams);
            setPublicationTypes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedPersonId]);

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
                setPublicationTypes((prev) => [newPublicationType, ...prev]);
                return newPublicationType;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create publication type";
                setError(errorMessage);
                throw err;
            }
        },
        [selectedPersonId]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PublicationType>
        ): Promise<PublicationType> => {
            try {
                setError(null);
                const updatedPublicationType = await updatePublicationType(id, updates);
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
                throw err;
            }
        },
        []
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setPublicationTypes((prev) => prev.filter((type) => type.id !== id));
                await deletePublicationType(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete publication type";
                setError(errorMessage);
                throw err;
            }
        },
        []
    );

    return {
        publicationTypes,
        loading,
        error,
        getPublicationTypes: fetchPublicationTypes,
        create,
        update,
        remove,
    };
}
