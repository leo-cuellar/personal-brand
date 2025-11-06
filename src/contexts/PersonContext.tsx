"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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

