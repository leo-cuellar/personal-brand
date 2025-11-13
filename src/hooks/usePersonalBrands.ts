"use client";

import { useState, useCallback } from "react";
import {
    getPersonalBrands,
    getPersonalBrandByUsername,
    getPersonalBrandNarrative,
    getPersonalBrandOpinions,
    createPersonalBrand,
    updatePersonalBrand,
    updatePersonalBrandNarrative,
    updatePersonalBrandOpinions,
    deletePersonalBrand,
    GetPersonalBrandsParams,
} from "../../services/api-wrapper/personal-brands";
import { PersonalBrand, NewPersonalBrand, BrandNarrative } from "../../services/supabase/schemas";

interface UsePersonalBrandsReturn {
    // List methods
    personalBrands: PersonalBrand[];
    loading: boolean;
    error: string | null;
    getPersonalBrands: (params?: GetPersonalBrandsParams) => Promise<void>;
    create: (data: NewPersonalBrand) => Promise<PersonalBrand>;
    update: (id: string, updates: Partial<PersonalBrand>) => Promise<PersonalBrand>;
    remove: (id: string) => Promise<void>;

    // Single personal brand methods
    personalBrand: PersonalBrand | null;
    personalBrandLoading: boolean;
    personalBrandError: string | null;
    getPersonalBrandByUsername: (username: string, fields?: "basic" | "narrative" | "opinions" | "all") => Promise<void>;

    // Narrative methods
    narrative: BrandNarrative | null;
    narrativeLoading: boolean;
    narrativeError: string | null;
    getNarrative: (username: string) => Promise<void>;
    updateNarrative: (username: string, narrative: BrandNarrative) => Promise<void>;

    // Opinions methods
    opinions: string[] | null;
    opinionsLoading: boolean;
    opinionsError: string | null;
    getOpinions: (username: string) => Promise<void>;
    updateOpinions: (username: string, opinions: string[]) => Promise<void>;
}

export function usePersonalBrands(): UsePersonalBrandsReturn {
    // List state
    const [personalBrands, setPersonalBrands] = useState<PersonalBrand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Single personal brand state
    const [personalBrand, setPersonalBrand] = useState<PersonalBrand | null>(null);
    const [personalBrandLoading, setPersonalBrandLoading] = useState(false);
    const [personalBrandError, setPersonalBrandError] = useState<string | null>(null);

    // Narrative state
    const [narrative, setNarrative] = useState<BrandNarrative | null>(null);
    const [narrativeLoading, setNarrativeLoading] = useState(false);
    const [narrativeError, setNarrativeError] = useState<string | null>(null);

    // Opinions state
    const [opinions, setOpinions] = useState<string[] | null>(null);
    const [opinionsLoading, setOpinionsLoading] = useState(false);
    const [opinionsError, setOpinionsError] = useState<string | null>(null);

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

    // Single personal brand methods
    const getPersonalBrandByUsernameCallback = useCallback(
        async (username: string, fields?: "basic" | "narrative" | "opinions" | "all"): Promise<void> => {
            try {
                setPersonalBrandLoading(true);
                setPersonalBrandError(null);
                const data = await getPersonalBrandByUsername(username, { fields });
                setPersonalBrand(data);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to fetch personal brand";
                setPersonalBrandError(errorMessage);
                throw err;
            } finally {
                setPersonalBrandLoading(false);
            }
        },
        []
    );

    // Narrative methods
    const getNarrative = useCallback(async (username: string): Promise<void> => {
        // Only fetch if narrative is not already loaded
        if (narrative !== null) {
            return;
        }

        try {
            setNarrativeLoading(true);
            setNarrativeError(null);
            const data = await getPersonalBrandNarrative(username);
            setNarrative(data);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to fetch narrative";
            setNarrativeError(errorMessage);
            throw err;
        } finally {
            setNarrativeLoading(false);
        }
    }, [narrative]);

    const updateNarrative = useCallback(
        async (username: string, newNarrative: BrandNarrative): Promise<void> => {
            const previousNarrative = narrative;
            try {
                setNarrativeError(null);
                // Optimistic update
                setNarrative(newNarrative);
                const updated = await updatePersonalBrandNarrative(username, newNarrative);
                setNarrative(updated);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update narrative";
                setNarrativeError(errorMessage);
                // Revert optimistic update on error
                if (previousNarrative) {
                    setNarrative(previousNarrative);
                }
                throw err;
            }
        },
        [narrative]
    );

    // Opinions methods
    const getOpinions = useCallback(async (username: string): Promise<void> => {
        // Only fetch if opinions are not already loaded
        if (opinions !== null) {
            return;
        }

        try {
            setOpinionsLoading(true);
            setOpinionsError(null);
            const data = await getPersonalBrandOpinions(username);
            setOpinions(data);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to fetch opinions";
            setOpinionsError(errorMessage);
            throw err;
        } finally {
            setOpinionsLoading(false);
        }
    }, [opinions]);

    const updateOpinions = useCallback(
        async (username: string, newOpinions: string[]): Promise<void> => {
            const previousOpinions = opinions;
            try {
                setOpinionsError(null);
                // Optimistic update
                setOpinions(newOpinions);
                const updated = await updatePersonalBrandOpinions(username, newOpinions);
                setOpinions(updated);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update opinions";
                setOpinionsError(errorMessage);
                // Revert optimistic update on error
                if (previousOpinions !== null) {
                    setOpinions(previousOpinions);
                }
                throw err;
            }
        },
        [opinions]
    );

    return {
        // List methods
        personalBrands,
        loading,
        error,
        getPersonalBrands: fetchPersonalBrands,
        create,
        update,
        remove,
        // Single personal brand methods
        personalBrand,
        personalBrandLoading,
        personalBrandError,
        getPersonalBrandByUsername: getPersonalBrandByUsernameCallback,
        // Narrative methods
        narrative,
        narrativeLoading,
        narrativeError,
        getNarrative,
        updateNarrative,
        // Opinions methods
        opinions,
        opinionsLoading,
        opinionsError,
        getOpinions,
        updateOpinions,
    };
}

// Legacy alias for backward compatibility
export const usePersons = usePersonalBrands;
