"use client";

import { useState, useEffect, useMemo } from "react";
import { usePublicationIdeas } from "@/hooks/usePublicationIdeas";
import { useN8nHooks } from "@/hooks/useN8nHooks";
import { usePersonContext } from "@/contexts/PersonContext";
import { IdeasReviewFlow } from "./IdeasReviewFlow";

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

export function PublicationIdeasPage() {
    const { selectedPersonId } = usePersonContext();
    const [showArchived, setShowArchived] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"in_review" | "accepted" | "rejected" | "used" | "all">("in_review");
    const [isReviewMode, setIsReviewMode] = useState(false);

    const { publicationIdeas, loading, error, getPublicationIdeas, update } = usePublicationIdeas();
    const { publicationIdeas: reviewIdeas, getPublicationIdeas: getReviewIdeas } = usePublicationIdeas();

    const params = useMemo(() => {
        const p: { includeArchived?: boolean; status?: "in_review" | "accepted" | "rejected" | "used" } = {};
        if (showArchived) p.includeArchived = true;
        if (statusFilter !== "all") p.status = statusFilter;
        return p;
    }, [showArchived, statusFilter]);

    const reviewParams = useMemo(() => {
        return { status: "in_review" as const, includeArchived: false };
    }, []);

    useEffect(() => {
        getPublicationIdeas(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    useEffect(() => {
        getReviewIdeas(reviewParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewParams]);
    const { idGenTrendScanner, idGenContext, loading: n8nLoading, error: n8nError } = useN8nHooks();

    const handleAccept = async (id: string) => {
        try {
            await update(id, { status: "accepted" });
            // Refetch both lists to update everything
            await Promise.all([getPublicationIdeas(params), getReviewIdeas(reviewParams)]);
        } catch {
            // Error handled by UI
        }
    };

    const handleReject = async (id: string) => {
        try {
            await update(id, { status: "rejected" });
            // Refetch both lists to update everything
            await Promise.all([getPublicationIdeas(params), getReviewIdeas(reviewParams)]);
        } catch {
            // Error handled by UI
        }
    };

    const handleStartReview = () => {
        if (reviewIdeas.length === 0) {
            alert("No ideas in review to process.");
            return;
        }
        setIsReviewMode(true);
    };

    const handleExitReview = () => {
        setIsReviewMode(false);
        getPublicationIdeas(params); // Refresh the list when exiting review mode
    };

    const handleGenerateIdeas = async () => {
        try {
            await idGenTrendScanner();
            await idGenContext();
            await getPublicationIdeas(params);
        } catch (err) {
            alert(`Failed to generate ideas: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "in_review":
                return "bg-yellow-100 text-yellow-700";
            case "used":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "accepted":
                return "Accepted";
            case "rejected":
                return "Rejected";
            case "in_review":
                return "In Review";
            case "used":
                return "Used";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading publication ideas...</p>
                </div>
            </div>
        );
    }

    // Show review flow if in review mode
    if (isReviewMode) {
        return (
            <IdeasReviewFlow
                ideas={reviewIdeas}
                onAccept={handleAccept}
                onReject={handleReject}
                onExit={handleExitReview}
            />
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Publication Ideas
                </h1>
                <p className="text-gray-600">
                    Review and manage publication ideas created by n8n
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {n8nError && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Generate Ideas Error:</strong> {n8nError}
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Show archived</span>
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "in_review" | "accepted" | "rejected" | "used" | "all")}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="in_review">In Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="used">Used</option>
                    </select>
                    <span className="text-sm text-gray-500">
                        {publicationIdeas.length} idea{publicationIdeas.length !== 1 ? "s" : ""}
                        {reviewIdeas.length > 0 && (
                            <span className="ml-2 text-blue-600">
                                ({reviewIdeas.length} in review)
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex gap-3">
                    {reviewIdeas.length > 0 && (
                        <button
                            onClick={handleStartReview}
                            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Start Review ({reviewIdeas.length})
                        </button>
                    )}
                    <button
                        onClick={handleGenerateIdeas}
                        disabled={n8nLoading || !selectedPersonId}
                        className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        title={!selectedPersonId ? "Please select a person first" : ""}
                    >
                        {n8nLoading ? "Generating..." : "Generate Ideas"}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {publicationIdeas.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {showArchived
                                ? "No publication ideas found."
                                : `No ${statusFilter === "all" ? "" : statusFilter.replace("_", " ")} publication ideas found.`}
                        </p>
                    </div>
                ) : (
                    publicationIdeas.map((idea) => (
                        <div
                            key={idea.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${idea.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {idea.idea}
                                        </h3>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(idea.status)}`}>
                                            {getStatusLabel(idea.status)}
                                        </span>
                                        {idea.isArchived && (
                                            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                Archived
                                            </span>
                                        )}
                                    </div>
                                    {idea.description && (
                                        <p className="text-gray-600">{idea.description}</p>
                                    )}
                                    {idea.link && (
                                        <div className="mt-2">
                                            <a
                                                href={idea.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {idea.link}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {idea.status === "in_review" && (
                                <div className="mb-3 flex gap-3">
                                    <button
                                        onClick={() => handleAccept(idea.id)}
                                        className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(idea.id)}
                                        className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                            <div className="text-xs text-gray-500">
                                Created: {formatDate(idea.createdAt)} •
                                Updated: {formatDate(idea.updatedAt)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
