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
        <select
            value={selectedPersonId || ""}
            onChange={handleChange}
            className="appearance-none rounded-lg border border-gray-300 bg-white bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat pr-10 pl-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            }}
        >
            <option value="">All Persons</option>
            {persons.map((person) => (
                <option key={person.id} value={person.id}>
                    {person.name}
                </option>
            ))}
        </select>
    );
}

