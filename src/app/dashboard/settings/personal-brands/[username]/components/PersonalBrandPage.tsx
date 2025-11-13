"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePersonalBrands } from "@/hooks/usePersonalBrands";
import { PersonalBrandNarrative } from "./PersonalBrandNarrative";
import { PersonalBrandStrongOpinions } from "./PersonalBrandStrongOpinions";

function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

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
                    <p className="text-lg text-gray-600">
                        @{personalBrand.username}
                    </p>
                )}
            </div>

            {/* General Information */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">General Information</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Created:</span>{" "}
                            <span className="text-gray-600">{formatDate(personalBrand.createdAt)}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Updated:</span>{" "}
                            <span className="text-gray-600">{formatDate(personalBrand.updatedAt)}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Status:</span>{" "}
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${personalBrand.isArchived
                                ? "bg-gray-200 text-gray-700"
                                : "bg-green-100 text-green-700"
                                }`}>
                                {personalBrand.isArchived ? "Archived" : "Active"}
                            </span>
                        </div>
                    </div>
                    {Object.keys(personalBrand.socialAccounts).length > 0 && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <span className="mb-2 block text-sm font-medium text-gray-700">Social Accounts</span>
                            <div className="flex flex-wrap gap-3">
                                {personalBrand.socialAccounts.linkedin && (
                                    <a
                                        href={personalBrand.socialAccounts.linkedin.profile_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        LinkedIn: @{personalBrand.socialAccounts.linkedin.profile_name}
                                    </a>
                                )}
                                {personalBrand.socialAccounts.twitter && (
                                    <a
                                        href={personalBrand.socialAccounts.twitter.profile_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        Twitter: @{personalBrand.socialAccounts.twitter.profile_name}
                                    </a>
                                )}
                                {personalBrand.socialAccounts.instagram && (
                                    <a
                                        href={personalBrand.socialAccounts.instagram.profile_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        Instagram: @{personalBrand.socialAccounts.instagram.profile_name}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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

