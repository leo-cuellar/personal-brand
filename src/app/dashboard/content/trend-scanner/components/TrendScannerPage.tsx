"use client";

import { useState } from "react";
import { usePerplexity } from "@/hooks/usePerplexity";
import { usePersonContext } from "@/contexts/PersonContext";
import { useInspirations } from "@/hooks/useInspirations";
import type { CategoryTrendsResult } from "../../../../../../services/api-wrapper/perplexity";
import type { TrendItem } from "../../../../../../services/perplexity/trends";

export function TrendScannerPage() {
    const { searchTrendsByCategory, loading, error } = usePerplexity();
    const { selectedPersonId } = usePersonContext();
    const { create: createInspiration } = useInspirations({ autoFetch: false });
    const [results, setResults] = useState<CategoryTrendsResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [addingInspiration, setAddingInspiration] = useState<string | null>(null);
    const [addedInspirations, setAddedInspirations] = useState<Set<string>>(new Set());

    const handleScan = async () => {
        if (!selectedPersonId) {
            alert("Please select a person first");
            return;
        }

        try {
            const response = await searchTrendsByCategory(selectedPersonId);
            setResults(response.results);
            setHasSearched(true);
        } catch (err) {
            console.error("Error searching trends:", err);
            // Error is handled by the hook
        }
    };

    const totalTrends = results.reduce((sum, result) => sum + result.trends.length, 0);
    const categoriesWithErrors = results.filter((r) => r.error).length;

    const handleAddInspiration = async (
        trend: TrendItem,
        categoryName: string,
        categoryId: string
    ) => {
        if (!selectedPersonId) {
            alert("Por favor selecciona una persona primero");
            return;
        }

        const trendKey = `${categoryId}-${trend.source_url}`;
        setAddingInspiration(trendKey);

        try {
            // Combine title and summary for the text
            const text = `${trend.short_title}\n\n${trend.short_summary}`;

            await createInspiration({
                personId: selectedPersonId,
                text,
                link: trend.source_url,
                source: "trend_scanner",
                metadata: {
                    category_name: categoryName,
                    category_id: categoryId,
                    trend_title: trend.short_title,
                    trend_summary: trend.short_summary,
                },
            });

            setAddedInspirations((prev) => new Set(prev).add(trendKey));
        } catch (err) {
            console.error("Error adding inspiration:", err);
            alert("Error al agregar la inspiración. Por favor intenta de nuevo.");
        } finally {
            setAddingInspiration(null);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Trend Scanner
                </h1>
                <p className="text-gray-600">
                    Busca tendencias basadas en tus categorías de publicaciones usando Perplexity AI
                </p>
            </div>

            {!selectedPersonId && (
                <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                    <strong>Nota:</strong> Por favor selecciona una persona para buscar tendencias.
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <button
                    onClick={handleScan}
                    disabled={loading || !selectedPersonId}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Escaneando tendencias..." : "Escanear Tendencias"}
                </button>
            </div>

            {loading && (
                <div className="flex min-h-[200px] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="text-lg text-gray-600">Buscando tendencias por categoría...</p>
                    </div>
                </div>
            )}

            {!loading && hasSearched && (
                <div className="space-y-6">
                    {results.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                            <p className="text-gray-500">
                                No se encontraron categorías habilitadas para búsqueda.
                                Ve a Settings para habilitar categorías.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    {results.length} categoría{results.length !== 1 ? "s" : ""} procesada{results.length !== 1 ? "s" : ""}
                                    {totalTrends > 0 && ` • ${totalTrends} tendencia${totalTrends !== 1 ? "s" : ""} encontrada${totalTrends !== 1 ? "s" : ""}`}
                                </div>
                                {categoriesWithErrors > 0 && (
                                    <div className="text-yellow-600">
                                        {categoriesWithErrors} categoría{categoriesWithErrors !== 1 ? "s" : ""} con error
                                    </div>
                                )}
                            </div>
                            {results.map((categoryResult) => (
                                <div
                                    key={categoryResult.categoryId}
                                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                                >
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                        {categoryResult.categoryName}
                                    </h2>
                                    {categoryResult.error ? (
                                        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                                            <strong>Error:</strong> {categoryResult.error}
                                        </div>
                                    ) : categoryResult.trends.length === 0 ? (
                                        <p className="text-gray-500">No se encontraron tendencias para esta categoría.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {categoryResult.trends.map((trend, index) => {
                                                const trendKey = `${categoryResult.categoryId}-${trend.source_url}`;
                                                const isAdding = addingInspiration === trendKey;
                                                const isAdded = addedInspirations.has(trendKey);

                                                return (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="mb-2 flex items-start justify-between gap-4">
                                                            <a
                                                                href={trend.source_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                                            >
                                                                {trend.short_title}
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    handleAddInspiration(
                                                                        trend,
                                                                        categoryResult.categoryName,
                                                                        categoryResult.categoryId
                                                                    )
                                                                }
                                                                disabled={isAdding || isAdded || !selectedPersonId}
                                                                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed ${isAdded
                                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                                    : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                                                    }`}
                                                            >
                                                                {isAdding ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                                        Agregando...
                                                                    </span>
                                                                ) : isAdded ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M5 13l4 4L19 7"
                                                                            />
                                                                        </svg>
                                                                        Agregada
                                                                    </span>
                                                                ) : (
                                                                    "Agregar como inspiración"
                                                                )}
                                                            </button>
                                                        </div>
                                                        <p className="mb-2 text-gray-700">{trend.short_summary}</p>
                                                        <a
                                                            href={trend.source_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                                                        >
                                                            {trend.source_url}
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {!loading && !hasSearched && (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                    <p className="text-gray-500">
                        Haz clic en &quot;Escanear Tendencias&quot; para buscar noticias y desarrollos recientes
                        basados en tus categorías de publicaciones habilitadas.
                    </p>
                </div>
            )}
        </div>
    );
}
