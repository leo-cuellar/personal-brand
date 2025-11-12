"use client";

import { useState, useEffect, useMemo } from "react";
import { useInspirations } from "@/hooks/useInspirations";
import { Inspiration, NewInspiration } from "../../../../../../services/supabase/schemas";
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

export function InspirationsPage() {
    const { selectedPersonId } = usePersonContext();
    const [showArchived, setShowArchived] = useState(false);
    const { inspirations, loading, error, getInspirations, create, update, remove } =
        useInspirations();

    const params = useMemo(
        () => ({ includeArchived: showArchived }),
        [showArchived]
    );

    useEffect(() => {
        getInspirations(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<NewInspiration>>({
        text: "",
        link: "",
        source: "manual",
        isArchived: false,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPersonId) {
            alert("Please select a person first from the header");
            return;
        }
        if (!formData.text) {
            alert("Text is required");
            return;
        }
        try {
            await create({
                text: formData.text,
                link: formData.link || null,
                source: "manual",
                isArchived: formData.isArchived || false,
            } as NewInspiration);
            setFormData({ text: "", link: "", source: "manual", isArchived: false });
            setIsCreating(false);
        } catch {
            // Error handled by alert or UI
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Inspiration>) => {
        try {
            await update(id, updates);
            setEditingId(null);
        } catch {
            // Error handled by alert or UI
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this inspiration? This action cannot be undone.")) {
            try {
                await remove(id);
            } catch {
                // Error handled by alert or UI
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading inspirations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Inspirations
                </h1>
                <p className="text-gray-600">
                    Manage your inspiration content - from short ideas to full LinkedIn posts
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
                    <span className="text-sm text-gray-500">
                        {inspirations.length} inspiration{inspirations.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        disabled={!selectedPersonId}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        title={!selectedPersonId ? "Please select a person first" : ""}
                    >
                        {isCreating ? "Cancel" : "+ Add New Inspiration"}
                    </button>
                </div>
            </div>

            {isCreating && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Inspiration
                    </h2>
                    {!selectedPersonId && (
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                            <strong>⚠️ Warning:</strong> Please select a person from the header before creating an inspiration.
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Text *
                            </label>
                            <textarea
                                value={formData.text}
                                onChange={(e) =>
                                    setFormData({ ...formData, text: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={8}
                                placeholder="Enter your inspiration text here... It can be a short idea like 'hablar de x cosa' or a full LinkedIn post."
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Link (optional)
                            </label>
                            <input
                                type="url"
                                value={formData.link || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, link: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
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
                                    setFormData({ text: "", link: "", source: "manual", isArchived: false });
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
                {inspirations.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {showArchived
                                ? "No inspirations found."
                                : "No active inspirations. Create one to get started!"}
                        </p>
                    </div>
                ) : (
                    inspirations.map((inspiration) => (
                        <div
                            key={inspiration.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${inspiration.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            {editingId === inspiration.id ? (
                                <EditForm
                                    inspiration={inspiration}
                                    onSave={(updates) => handleUpdate(inspiration.id, updates)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                {inspiration.isArchived && (
                                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Archived
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${inspiration.source === "trend_scanner"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : inspiration.source === "linkedin"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {inspiration.source === "trend_scanner"
                                                        ? "Trend Scanner"
                                                        : inspiration.source === "linkedin"
                                                            ? "LinkedIn"
                                                            : "Manual"}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap text-gray-800">{inspiration.text}</p>
                                            {inspiration.link && (
                                                <div className="mt-2">
                                                    <a
                                                        href={inspiration.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {inspiration.link}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex gap-2">
                                            <button
                                                onClick={() => setEditingId(inspiration.id)}
                                                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inspiration.id)}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Created: {formatDate(inspiration.createdAt)} •
                                        Updated: {formatDate(inspiration.updatedAt)}
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
    inspiration,
    onSave,
    onCancel,
}: {
    inspiration: Inspiration;
    onSave: (updates: Partial<Inspiration>) => void;
    onCancel: () => void;
}) {
    const [text, setText] = useState(inspiration.text);
    const [link, setLink] = useState(inspiration.link || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ text, link: link || null });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Text *
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    required
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Link (optional)
                </label>
                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                />
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

