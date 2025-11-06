"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getPersons,
    createPerson,
    updatePerson,
    deletePerson,
    GetPersonsParams,
} from "@/services/api-wrapper/persons";
import { Person, NewPerson } from "@/services/supabase/schemas";

interface UsePersonsReturn {
    persons: Person[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    create: (data: NewPerson) => Promise<Person>;
    update: (id: string, updates: Partial<Person>) => Promise<Person>;
    remove: (id: string) => Promise<void>;
}

export function usePersons(
    params?: GetPersonsParams
): UsePersonsReturn {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPersons = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPersons(params);
            setPersons(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchPersons();
    }, [fetchPersons]);

    const create = useCallback(
        async (data: NewPerson): Promise<Person> => {
            try {
                setError(null);
                const newPerson = await createPerson(data);
                setPersons((prev) => [newPerson, ...prev]);
                return newPerson;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to create person";
                setError(errorMessage);
                await fetchPersons();
                throw err;
            }
        },
        [fetchPersons]
    );

    const update = useCallback(
        async (
            id: string,
            updates: Partial<Person>
        ): Promise<Person> => {
            try {
                setError(null);
                const updatedPerson = await updatePerson(id, updates);
                setPersons((prev) =>
                    prev.map((person) =>
                        person.id === id ? updatedPerson : person
                    )
                );
                return updatedPerson;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update person";
                setError(errorMessage);
                await fetchPersons();
                throw err;
            }
        },
        [fetchPersons]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            try {
                setError(null);
                setPersons((prev) => prev.filter((person) => person.id !== id));
                await deletePerson(id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete person";
                setError(errorMessage);
                await fetchPersons();
                throw err;
            }
        },
        [fetchPersons]
    );

    return {
        persons,
        loading,
        error,
        refetch: fetchPersons,
        create,
        update,
        remove,
    };
}

