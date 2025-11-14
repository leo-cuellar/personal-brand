"use client";

import { useEffect } from "react";
import { useBuyerPersonas } from "@/hooks/useBuyerPersonas";

export function BuyerPersonasPage() {
    const { buyerPersonas, loading, error, getBuyerPersonas } = useBuyerPersonas();

    useEffect(() => {
        getBuyerPersonas({ includeArchived: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading buyer personas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Buyer Personas
                </h1>
                <p className="text-gray-600">
                    Manage buyer personas for content targeting
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mb-6">
                <span className="text-sm text-gray-500">
                    {buyerPersonas.length} buyer persona{buyerPersonas.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="space-y-6">
                {buyerPersonas.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            No active buyer personas.
                        </p>
                    </div>
                ) : (
                    buyerPersonas.map((persona) => (
                        <div
                            key={persona.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${
                                persona.isArchived
                                    ? "border-gray-300 bg-gray-50"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <div className="mb-4">
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                    {persona.name}
                                </h3>
                                {persona.description && (
                                    <p className="text-gray-600">{persona.description}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                                        Knowledge Level
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {persona.knowledgeLevel
                                            ? String(persona.knowledgeLevel).charAt(0).toUpperCase() +
                                              String(persona.knowledgeLevel).slice(1)
                                            : "Medium"}
                                    </p>
                                </div>
                                {persona.goals.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                                            Goals
                                        </h4>
                                        <ul className="space-y-1">
                                            {persona.goals.map((goal, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-gray-600"
                                                >
                                                    • {goal}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {persona.frustrations.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                                            Frustrations
                                        </h4>
                                        <ul className="space-y-1">
                                            {persona.frustrations.map((frustration, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-gray-600"
                                                >
                                                    • {frustration}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {persona.desires.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                                            Desires
                                        </h4>
                                        <ul className="space-y-1">
                                            {persona.desires.map((desire, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-gray-600"
                                                >
                                                    • {desire}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {persona.isArchived && (
                                <div className="mt-4">
                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                        Archived
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

