"use client";

import { useState, useCallback } from "react";
import {
    getBuyerPersonas,
    getBuyerPersonaById,
    createBuyerPersona,
    updateBuyerPersona,
    deleteBuyerPersona,
    GetBuyerPersonasParams,
} from "../../services/api-wrapper/buyer-personas";
import { BuyerPersona, NewBuyerPersona } from "../../services/supabase/schemas";

interface UseBuyerPersonasReturn {
    buyerPersonas: BuyerPersona[];
    loading: boolean;
    error: string | null;
    getBuyerPersonas: (params?: GetBuyerPersonasParams) => Promise<void>;
    getBuyerPersonaById: (id: string) => Promise<BuyerPersona>;
    create: (data: NewBuyerPersona) => Promise<BuyerPersona>;
    update: (id: string, updates: Partial<BuyerPersona>) => Promise<BuyerPersona>;
    remove: (id: string) => Promise<void>;
}

export function useBuyerPersonas(): UseBuyerPersonasReturn {
    const [buyerPersonas, setBuyerPersonas] = useState<BuyerPersona[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBuyerPersonas = useCallback(async (params?: GetBuyerPersonasParams) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBuyerPersonas(params);
            setBuyerPersonas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBuyerPersonaById = useCallback(async (id: string): Promise<BuyerPersona> => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBuyerPersonaById(id);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (data: NewBuyerPersona): Promise<BuyerPersona> => {
        try {
            setLoading(true);
            setError(null);
            const newBuyerPersona = await createBuyerPersona(data);
            setBuyerPersonas((prev) => [newBuyerPersona, ...prev]);
            return newBuyerPersona;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const update = useCallback(async (id: string, updates: Partial<BuyerPersona>): Promise<BuyerPersona> => {
        try {
            setLoading(true);
            setError(null);
            const updatedBuyerPersona = await updateBuyerPersona(id, updates);
            setBuyerPersonas((prev) =>
                prev.map((persona) => (persona.id === id ? updatedBuyerPersona : persona))
            );
            return updatedBuyerPersona;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const remove = useCallback(async (id: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await deleteBuyerPersona(id);
            setBuyerPersonas((prev) => prev.filter((persona) => persona.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        buyerPersonas,
        loading,
        error,
        getBuyerPersonas: fetchBuyerPersonas,
        getBuyerPersonaById: fetchBuyerPersonaById,
        create,
        update,
        remove,
    };
}

