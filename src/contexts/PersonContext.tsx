"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getPersons } from "../../services/api-wrapper/persons";

interface PersonContextType {
    selectedPersonId: string | null;
    setSelectedPersonId: (id: string | null) => void;
    clearSelection: () => void;
}

const PersonContext = createContext<PersonContextType | undefined>(undefined);

export function PersonProvider({ children }: { children: React.ReactNode }) {
    // Initialize state from localStorage using lazy initializer
    const [selectedPersonId, setSelectedPersonIdState] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("selectedPersonId");
        }
        return null;
    });
    const [isInitialized, setIsInitialized] = useState(false);

    const setSelectedPersonId = useCallback((id: string | null) => {
        setSelectedPersonIdState(id);
        if (id) {
            localStorage.setItem("selectedPersonId", id);
        } else {
            localStorage.removeItem("selectedPersonId");
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedPersonId(null);
    }, [setSelectedPersonId]);

    // Auto-select first person if none is selected
    useEffect(() => {
        if (isInitialized || selectedPersonId) {
            return;
        }

        const selectFirstPerson = async () => {
            try {
                const persons = await getPersons({ includeArchived: false });
                if (persons.length > 0) {
                    setSelectedPersonId(persons[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch persons for auto-selection:", error);
            } finally {
                setIsInitialized(true);
            }
        };

        selectFirstPerson();
    }, [selectedPersonId, isInitialized, setSelectedPersonId]);

    return (
        <PersonContext.Provider
            value={{
                selectedPersonId,
                setSelectedPersonId,
                clearSelection,
            }}
        >
            {children}
        </PersonContext.Provider>
    );
}

export function usePersonContext() {
    const context = useContext(PersonContext);
    if (context === undefined) {
        throw new Error("usePersonContext must be used within a PersonProvider");
    }
    return context;
}

