"use client";

import { useState, useCallback } from "react";
import {
    getPersonalBrands,
    createPersonalBrand,
    updatePersonalBrand,
    deletePersonalBrand,
    GetPersonalBrandsParams,
} from "../../services/api-wrapper/personal-brands";
import { PersonalBrand, NewPersonalBrand } from "../../services/supabase/schemas";

interface UsePersonalBrandsReturn {
    personalBrands: PersonalBrand[];
    loading: boolean;
    error: string | null;
    getPersonalBrands: (params?: GetPersonalBrandsParams) => Promise<void>;
    create: (data: NewPersonalBrand) => Promise<PersonalBrand>;
    update: (id: string, updates: Partial<PersonalBrand>) => Promise<PersonalBrand>;
    remove: (id: string) => Promise<void>;
}

export function usePersonalBrands(): UsePersonalBrandsReturn {
    const [personalBrands, setPersonalBrands] = useState<PersonalBrand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPersonalBrands = useCallback(async (params?: GetPersonalBrandsParams) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPersonalBrands(params);
            setPersonalBrands(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(
        async (data: NewPersonalBrand): Promise<PersonalBrand> => {
            try {
                setError(null);
                const newPersonalBrand = await createPersonalBrand(data);
                setPersonalBrands((prev) => [newPersonalBrand, ...prev]);
                return newPersonalBrand;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create personal brand";
                setError(errorMessage);
                throw err;
            }
        },
        []
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<PersonalBrand>
        ): Promise<PersonalBrand> => {
            try {
                setError(null);
                const updatedPersonalBrand = await updatePersonalBrand(id, updates);
                setPersonalBrands((prev) =>
                    prev.map((brand) =>
                        brand.id === id ? updatedPersonalBrand : brand
                    )
                );
                return updatedPersonalBrand;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update personal brand";
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
                setPersonalBrands((prev) => prev.filter((brand) => brand.id !== id));
                await deletePersonalBrand(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete personal brand";
                setError(errorMessage);
                throw err;
            }
        },
        []
    );

    return {
        personalBrands,
        loading,
        error,
        getPersonalBrands: fetchPersonalBrands,
        create,
        update,
        remove,
    };
}

// Legacy alias for backward compatibility
export const usePersons = usePersonalBrands;
