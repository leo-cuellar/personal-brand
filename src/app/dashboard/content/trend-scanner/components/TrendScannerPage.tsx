"use client";

import { useState, useEffect } from "react";
import { usePerplexity } from "@/hooks/usePerplexity";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";
import { usePublicationIdeas } from "@/hooks/usePublicationIdeas";
import type { CategoryTrendsResult } from "../../../../../../services/api-wrapper/perplexity";
import { getTrendScannerCache, markTrendAsAdded } from "@/utils/trend-scanner-cache";
import { Switch } from "@/components/Switch";

export function TrendScannerPage() {
    const { searchTrendsByCategory, loading, error } = usePerplexity();
    const { selectedPersonId } = usePersonalBrandContext();
    const { create } = usePublicationIdeas();
    const [results, setResults] = useState<CategoryTrendsResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [addingIdeas, setAddingIdeas] = useState<Set<string>>(new Set());
    const [addedUrls, setAddedUrls] = useState<Set<string>>(new Set());

    // Cargar cache al montar o cuando cambie el personalBrandId
    useEffect(() => {
        if (!selectedPersonId) {
            setResults([]);
            setHasSearched(false);
            setAddedUrls(new Set());
            return;
        }

        const cachedData = getTrendScannerCache(selectedPersonId);
        if (cachedData !== null) {
            // Hay cache válido del día de hoy, cargar automáticamente
            setResults(cachedData);
            setHasSearched(true);
        } else {
            // No hay cache válido, resetear estado
            setResults([]);
            setHasSearched(false);
        }

        // Cargar URLs agregadas desde localStorage
        const allUrls = new Set<string>();
        try {
            const key = `trend-scanner-added-ideas-${selectedPersonId}`;
            const storedUrls = localStorage.getItem(key);
            if (storedUrls) {
                const urls: string[] = JSON.parse(storedUrls);
                urls.forEach((url) => allUrls.add(url));
            }
        } catch (error) {
            console.error("Error loading added URLs:", error);
        }
        setAddedUrls(allUrls);
    }, [selectedPersonId]);

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

    const handleAddIdea = async (trend: CategoryTrendsResult["trends"][0], categoryId: string) => {
        if (!selectedPersonId) {
            alert("Please select a person first");
            return;
        }

        // Verificar si ya fue agregada
        if (addedUrls.has(trend.source_url)) {
            return;
        }

        const trendKey = `${categoryId}-${trend.source_url}`;
        setAddingIdeas((prev) => new Set(prev).add(trendKey));

        try {
            await create({
                personalBrandId: selectedPersonId!,
                title: trend.short_title,
                description: trend.short_summary,
                link: trend.source_url,
                status: "accepted",
                source: "trend_scanner",
                sourceSummary: null,
                metadata: null,
                isArchived: false,
            });
            // Marcar como agregada después de éxito
            markTrendAsAdded(selectedPersonId, trend.source_url);
            setAddedUrls((prev) => new Set(prev).add(trend.source_url));
        } catch (error) {
            alert(`Failed to add idea: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setAddingIdeas((prev) => {
                const newSet = new Set(prev);
                newSet.delete(trendKey);
                return newSet;
            });
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

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Switch id="auto-run" disabled />
                    <label htmlFor="auto-run" className="text-sm font-medium text-gray-700 cursor-not-allowed opacity-50">
                        Auto-run
                    </label>
                </div>
            </div>

            <button
                onClick={handleScan}
                disabled={loading || !selectedPersonId || hasSearched}
                className="mb-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Escaneando tendencias..." : "Escanear Tendencias"}
            </button>

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
                                                const isAdding = addingIdeas.has(trendKey);
                                                const isAlreadyAdded = addedUrls.has(trend.source_url);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                            <a
                                                                href={trend.source_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                                            >
                                                                {trend.short_title}
                                                            </a>
                                                            <button
                                                                onClick={() => handleAddIdea(trend, categoryResult.categoryId)}
                                                                disabled={isAdding || !selectedPersonId || isAlreadyAdded}
                                                                className={`hidden rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:block whitespace-nowrap ${isAlreadyAdded
                                                                    ? "bg-gray-400 hover:bg-gray-400"
                                                                    : "bg-green-600 hover:bg-green-700"
                                                                    }`}
                                                            >
                                                                {isAdding ? "Adding..." : isAlreadyAdded ? "Added" : "Add Idea"}
                                                            </button>
                                                        </div>
                                                        <p className="mb-2 text-gray-700">{trend.short_summary}</p>
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <a
                                                                href={trend.source_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block break-all text-sm text-gray-500 hover:text-blue-600 hover:underline"
                                                            >
                                                                {trend.source_url}
                                                            </a>
                                                            <button
                                                                onClick={() => handleAddIdea(trend, categoryResult.categoryId)}
                                                                disabled={isAdding || !selectedPersonId || isAlreadyAdded}
                                                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden ${isAlreadyAdded
                                                                    ? "bg-gray-400 hover:bg-gray-400"
                                                                    : "bg-green-600 hover:bg-green-700"
                                                                    }`}
                                                            >
                                                                {isAdding ? "Adding..." : isAlreadyAdded ? "Added" : "Add Idea"}
                                                            </button>
                                                        </div>
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
