"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getPersonalBrands } from "../../services/api-wrapper/personal-brands";

interface PersonalBrandContextType {
    selectedPersonId: string | null;
    setSelectedPersonId: (id: string | null) => void;
    clearSelection: () => void;
}

const PersonalBrandContext = createContext<PersonalBrandContextType | undefined>(undefined);

export function PersonalBrandProvider({ children }: { children: React.ReactNode }) {
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
                const personalBrands = await getPersonalBrands({ includeArchived: false });
                if (personalBrands.length > 0) {
                    setSelectedPersonId(personalBrands[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch personal brands for auto-selection:", error);
            } finally {
                setIsInitialized(true);
            }
        };

        selectFirstPerson();
    }, [selectedPersonId, isInitialized, setSelectedPersonId]);

    return (
        <PersonalBrandContext.Provider
            value={{
                selectedPersonId,
                setSelectedPersonId,
                clearSelection,
            }}
        >
            {children}
        </PersonalBrandContext.Provider>
    );
}

export function usePersonalBrandContext() {
    const context = useContext(PersonalBrandContext);
    if (context === undefined) {
        throw new Error("usePersonalBrandContext must be used within a PersonalBrandProvider");
    }
    return context;
}

// Legacy alias for backward compatibility
export const usePersonContext = usePersonalBrandContext;

