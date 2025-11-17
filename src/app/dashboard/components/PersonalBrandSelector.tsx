"use client";

import { useEffect } from "react";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";
import { usePersonalBrands } from "@/hooks/usePersonalBrands";

export function PersonalBrandSelector() {
    const { selectedPersonId, setSelectedPersonId, clearSelection } =
        usePersonalBrandContext();

    const { personalBrands, loading, getPersonalBrands } = usePersonalBrands();

    useEffect(() => {
        getPersonalBrands({ includeArchived: false, includeProfile: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            <div className="text-sm text-gray-500">Loading personal brands...</div>
        );
    }

    return (
        <select
            value={selectedPersonId || ""}
            onChange={handleChange}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat pr-10 pl-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            }}
        >
            <option value="">All Personal Brands</option>
            {personalBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                    {brand.name}
                </option>
            ))}
        </select>
    );
}

