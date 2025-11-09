"use client";

import { useState, useMemo } from "react";
import { usePublications } from "@/hooks/usePublications";
import { Publication } from "@/services/supabase/schemas";
import { PublicationsList } from "./PublicationsList";
import { PublicationsCalendar } from "./PublicationsCalendar";

type ViewType = "list" | "calendar";

export function PublicationsContainer() {
    const [view, setView] = useState<ViewType>("list");
    const [showArchived, setShowArchived] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"draft" | "scheduled" | "published" | "all">("all");

    const params = useMemo(() => {
        const p: { includeArchived?: boolean; status?: "draft" | "scheduled" | "published" } = {};
        if (showArchived) p.includeArchived = true;
        if (statusFilter !== "all") p.status = statusFilter;
        return p;
    }, [showArchived, statusFilter]);

    const { publications, loading, error, create, update, remove } = usePublications(params);

    const handleSelectEvent = (event: { resource: Publication }) => {
        const pub = event.resource;
        // You can add logic here to show a modal or navigate to edit
        console.log("Selected publication:", pub);
    };

    const handleEventDrop = async (args: { event: { resource: Publication }; start: Date; end: Date }) => {
        const pub = args.event.resource;
        try {
            await update(pub.id, {
                scheduledAt: args.start,
            });
        } catch (err) {
            console.error("Failed to update publication date:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading publications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Publications
                </h1>
                <p className="text-gray-600">
                    Manage your publications (drafts, scheduled, and published)
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-2 rounded-lg border border-gray-300 bg-white p-1">
                        <button
                            onClick={() => setView("list")}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === "list"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setView("calendar")}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === "calendar"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            Calendar
                        </button>
                    </div>
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
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                    </select>
                    <span className="text-sm text-gray-500">
                        {publications.length} publication{publications.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {view === "list" ? (
                <PublicationsList
                    publications={publications}
                    onCreate={create}
                    onUpdate={update}
                    onDelete={remove}
                />
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <PublicationsCalendar
                        publications={publications}
                        onSelectEvent={handleSelectEvent}
                        onEventDrop={handleEventDrop}
                    />
                </div>
            )}
        </div>
    );
}

