"use client";

import { useState, useMemo } from "react";
import { usePublicationIdeas } from "@/hooks/usePublicationIdeas";
import { PublicationIdea } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

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
    const [statusFilter, setStatusFilter] = useState<"in_review" | "accepted" | "rejected" | "all">("in_review");
    const params = useMemo(() => {
        const p: { includeArchived?: boolean; status?: "in_review" | "accepted" | "rejected" } = {};
        if (showArchived) p.includeArchived = true;
        if (statusFilter !== "all") p.status = statusFilter;
        return p;
    }, [showArchived, statusFilter]);
    const { publicationIdeas, loading, error, update, refetch } = usePublicationIdeas(params);

    const handleAccept = async (id: string) => {
        try {
            await update(id, { status: "accepted" });
            // Refetch to update the list based on current filter
            await refetch();
        } catch (err) {
            console.error("Failed to accept idea:", err);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await update(id, { status: "rejected" });
            // Refetch to update the list based on current filter
            await refetch();
        } catch (err) {
            console.error("Failed to reject idea:", err);
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
                        onChange={(e) => setStatusFilter(e.target.value as "in_review" | "accepted" | "rejected" | "all")}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="in_review">In Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <span className="text-sm text-gray-500">
                        {publicationIdeas.length} idea{publicationIdeas.length !== 1 ? "s" : ""}
                    </span>
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
