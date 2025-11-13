"use client";

import { useEffect } from "react";

interface PersonalBrandStrongOpinionsProps {
    personalBrandId: string;
    opinions: string[] | null; // null means not loaded yet, [] means loaded but empty
    loading: boolean;
    error: string | null;
    onLoad: (id: string) => Promise<void>;
}

export function PersonalBrandStrongOpinions({
    personalBrandId,
    opinions,
    loading,
    error,
    onLoad,
}: PersonalBrandStrongOpinionsProps) {
    useEffect(() => {
        // Only fetch if opinions are not already loaded (null means not loaded yet)
        if (opinions === null && !loading) {
            onLoad(personalBrandId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personalBrandId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-sm text-gray-600">Loading strong opinions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (opinions === null) {
        // Still loading or not loaded yet
        return null;
    }

    if (opinions.length === 0) {
        return (
            <div className="text-sm text-gray-400">No strong opinions added yet</div>
        );
    }

    return (
        <div>
            <ul className="space-y-4">
                {opinions.map((opinion, index) => (
                    <li key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {opinion}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

