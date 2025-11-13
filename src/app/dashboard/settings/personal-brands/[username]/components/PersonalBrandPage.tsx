"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePersonalBrands } from "@/hooks/usePersonalBrands";
import { PersonalBrandNarrative } from "./PersonalBrandNarrative";
import { PersonalBrandStrongOpinions } from "./PersonalBrandStrongOpinions";

interface PersonalBrandPageProps {
    username: string;
}

export function PersonalBrandPage({ username }: PersonalBrandPageProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"narrative" | "opinions">("narrative");

    const {
        personalBrand,
        personalBrandLoading: loading,
        personalBrandError: error,
        getPersonalBrandByUsername,
        narrative,
        narrativeLoading,
        narrativeError,
        getNarrative,
        opinions,
        opinionsLoading,
        opinionsError,
        getOpinions,
    } = usePersonalBrands();

    useEffect(() => {
        if (!username) {
            return;
        }

        getPersonalBrandByUsername(username, "basic");
    }, [username, getPersonalBrandByUsername]);

    // Show loading if currently loading OR if we haven't loaded anything yet (no personalBrand, no error, not loading)
    const isInitialLoad = !personalBrand && !error && !loading;

    if (loading || isInitialLoad) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading personal brand...</p>
                </div>
            </div>
        );
    }

    // Only show error if we're not loading and there's actually an error
    if (error && !loading && !isInitialLoad) {
        return (
            <div className="container mx-auto max-w-6xl p-8">
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
                <button
                    onClick={() => router.push("/dashboard/settings/personal-brands")}
                    className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                    Back to Personal Brands
                </button>
            </div>
        );
    }

    // Only show "not found" if we're not loading, there's no error but also no personal brand
    if (!personalBrand && !loading && !error && !isInitialLoad) {
        return (
            <div className="container mx-auto max-w-6xl p-8">
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> Personal brand not found
                </div>
                <button
                    onClick={() => router.push("/dashboard/settings/personal-brands")}
                    className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                    Back to Personal Brands
                </button>
            </div>
        );
    }

    // Type guard: at this point personalBrand must exist
    if (!personalBrand) {
        return null;
    }

    console.log(personalBrand);

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-6">
                <button
                    onClick={() => router.push("/dashboard/settings/personal-brands")}
                    className="mb-4 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                    ← Back to Personal Brands
                </button>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    {personalBrand.name}
                </h1>
                {personalBrand.username && (
                    <p className="mb-2 text-lg text-gray-600">
                        @{personalBrand.username}
                    </p>
                )}
                {personalBrand.niche && (
                    <p className="text-base text-gray-700">
                        {personalBrand.niche}
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("narrative")}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === "narrative"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        Brand Narrative
                    </button>
                    <button
                        onClick={() => setActiveTab("opinions")}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === "opinions"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        Strong Opinions
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {activeTab === "narrative" && (
                    <PersonalBrandNarrative
                        username={username}
                        narrative={narrative}
                        loading={narrativeLoading}
                        error={narrativeError}
                        onLoad={getNarrative}
                    />
                )}

                {activeTab === "opinions" && (
                    <PersonalBrandStrongOpinions
                        username={username}
                        opinions={opinions}
                        loading={opinionsLoading}
                        error={opinionsError}
                        onLoad={getOpinions}
                    />
                )}
            </div>
        </div>
    );
}

