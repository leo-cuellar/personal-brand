"use client";

import { useState, useMemo } from "react";
import { usePublications } from "@/hooks/usePublications";
import { Publication, NewPublication } from "@/services/supabase/schemas";

function formatDate(date: Date | string | null): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateTime(date: Date | string | null): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    return d.toLocaleString();
}

export function PublicationsPage() {
    const [showArchived, setShowArchived] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"draft" | "scheduled" | "published" | "all">("all");
    const params = useMemo(() => {
        const p: { includeArchived?: boolean; status?: "draft" | "scheduled" | "published" } = {};
        if (showArchived) p.includeArchived = true;
        if (statusFilter !== "all") p.status = statusFilter;
        return p;
    }, [showArchived, statusFilter]);
    const { publications, loading, error, create, update, remove } =
        usePublications(params);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<NewPublication>({
        title: null,
        content: "",
        status: "draft",
        platform: "linkedin",
        scheduledAt: null,
        publishedAt: null,
        isArchived: false,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create(formData);
            setFormData({
                title: null,
                content: "",
                status: "draft",
                platform: "linkedin",
                scheduledAt: null,
                publishedAt: null,
                isArchived: false,
            });
            setIsCreating(false);
        } catch (err) {
            console.error("Failed to create:", err);
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Publication>) => {
        try {
            await update(id, updates);
            setEditingId(null);
        } catch (err) {
            console.error("Failed to update:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this publication? This action cannot be undone.")) {
            try {
                await remove(id);
            } catch (err) {
                console.error("Failed to delete:", err);
            }
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
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {isCreating ? "Cancel" : "+ Add New Publication"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Publication
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value || null })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional title for the publication"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={6}
                                placeholder="Enter the publication content..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Status *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value as "draft" | "scheduled" | "published" })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Platform *
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) =>
                                        setFormData({ ...formData, platform: e.target.value as "linkedin" })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="linkedin">LinkedIn</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormData({
                                        title: null,
                                        content: "",
                                        status: "draft",
                                        platform: "linkedin",
                                        scheduledAt: null,
                                        publishedAt: null,
                                        isArchived: false,
                                    });
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {publications.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {showArchived
                                ? "No publications found."
                                : "No active publications. Create one to get started!"}
                        </p>
                    </div>
                ) : (
                    publications.map((publication) => (
                        <div
                            key={publication.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${publication.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            {editingId === publication.id ? (
                                <EditForm
                                    publication={publication}
                                    onSave={(updates) => handleUpdate(publication.id, updates)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {publication.title || "Untitled Publication"}
                                                </h3>
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    publication.status === "published"
                                                        ? "bg-green-100 text-green-700"
                                                        : publication.status === "scheduled"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}>
                                                    {publication.status}
                                                </span>
                                                {publication.isArchived && (
                                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mb-2 text-gray-600 line-clamp-3">
                                                {publication.content}
                                            </p>
                                            <div className="text-xs text-gray-500">
                                                Platform: {publication.platform} • 
                                                Scheduled: {formatDate(publication.scheduledAt)} • 
                                                Published: {formatDate(publication.publishedAt)}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex gap-2">
                                            <button
                                                onClick={() => setEditingId(publication.id)}
                                                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleUpdate(publication.id, {
                                                        isArchived: !publication.isArchived,
                                                    })
                                                }
                                                className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                            >
                                                {publication.isArchived ? "Unarchive" : "Archive"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(publication.id)}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Created: {formatDate(publication.createdAt)} •
                                        Updated: {formatDate(publication.updatedAt)}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function EditForm({
    publication,
    onSave,
    onCancel,
}: {
    publication: Publication;
    onSave: (updates: Partial<Publication>) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(publication.title || "");
    const [content, setContent] = useState(publication.content);
    const [status, setStatus] = useState<"draft" | "scheduled" | "published">(publication.status);
    const [platform, setPlatform] = useState<"linkedin">(publication.platform);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: title || null,
            content,
            status,
            platform,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Content *
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status *
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as typeof status)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Platform *
                    </label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as "linkedin")}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="linkedin">LinkedIn</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

