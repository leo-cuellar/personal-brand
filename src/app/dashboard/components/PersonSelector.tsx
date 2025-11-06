"use client";

import { useMemo } from "react";
import { usePersonContext } from "@/contexts/PersonContext";
import { usePersons } from "@/hooks/usePersons";

export function PersonSelector() {
    const { selectedPersonId, setSelectedPersonId, clearSelection } =
        usePersonContext();
    
    // Memoize params to prevent infinite loop
    const params = useMemo(() => ({ includeArchived: false }), []);
    const { persons, loading } = usePersons(params);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "") {
            clearSelection();
        } else {
            setSelectedPersonId(value);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-gray-500">Loading persons...</div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <label
                htmlFor="person-select"
                className="text-sm font-medium text-gray-700"
            >
                Person:
            </label>
            <select
                id="person-select"
                value={selectedPersonId || ""}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Persons</option>
                {persons.map((person) => (
                    <option key={person.id} value={person.id}>
                        {person.name}
                    </option>
                ))}
            </select>
            {selectedPersonId && (
                <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Clear
                </button>
            )}
        </div>
    );
}

